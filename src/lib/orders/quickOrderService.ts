import { DispatchStatus, ItemType, OrderSource, OrderStatus, Visibility } from "../constants/enums";
import type { Order, QuickOrderPayload, RouteEstimate } from "../types";
import { mapsService } from "../maps/mapsService";
import { classifyRouteGroup } from "../maps/routeClassifier";
import { estimatePrice, isManualQuoteRequired } from "../pricing/pricingService";
import { createOrder } from "./orderService";
import { suggestZaloGroups } from "../dispatch/aiDispatchService";

export function generateOrderCode() {
  const day = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const seq = Math.floor(1000 + Math.random() * 9000);
  return `CP24H-${day}-${seq}`;
}

export function validateQuickOrderPayload(payload: QuickOrderPayload) {
  const missing = [
    !payload.pickupAddress && "pickupAddress",
    !payload.deliveryAddress && "deliveryAddress",
    !payload.customerPhone && "customerPhone",
    !payload.itemType && "itemType",
  ].filter(Boolean);
  return { valid: missing.length === 0, missing };
}

export async function enrichOrderWithMapsData(payload: QuickOrderPayload) {
  const pickup = payload.pickupPlaceId
    ? await mapsService.getPlaceDetails(payload.pickupPlaceId)
    : await mapsService.geocodeAddress(payload.pickupAddress);
  const delivery = payload.deliveryPlaceId
    ? await mapsService.getPlaceDetails(payload.deliveryPlaceId)
    : await mapsService.geocodeAddress(payload.deliveryAddress);
  return { pickup, delivery };
}

export async function classifyQuickOrder(payload: QuickOrderPayload): Promise<RouteEstimate> {
  const { pickup, delivery } = await enrichOrderWithMapsData(payload);
  const pickupProvince = payload.pickupProvince || pickup?.province || payload.pickupAddress;
  const deliveryProvince = payload.deliveryProvince || delivery?.province || payload.deliveryAddress;
  const classification = classifyRouteGroup(pickupProvince, deliveryProvince);
  const distance = await mapsService.calculateDistance({
    origin: payload.pickupAddress,
    destination: payload.deliveryAddress,
    originProvince: classification.pickupProvince,
    destinationProvince: classification.deliveryProvince,
  });
  const manualQuoteRequired = isManualQuoteRequired(payload.itemType, classification);
  const price = estimatePrice({
    classification,
    itemType: payload.itemType,
    weight: payload.weight,
  });

  let statusText = "Co the tao don ngay";
  let ctaText = "Tao don gui hang";
  if (!classification.isSupported) {
    statusText = "Khong ho tro tuyen";
    ctaText = "Gui yeu cau kiem tra tuyen";
  } else if (manualQuoteRequired) {
    statusText = "Can nhan vien xac nhan gia";
    ctaText = "Gui yeu cau bao gia";
  } else if (classification.needsManualReview) {
    statusText = "Can xac nhan lich xe";
    ctaText = "Gui yeu cau kiem tra tuyen";
  }

  return {
    ...classification,
    itemType: payload.itemType,
    manualQuoteRequired,
    distanceKm: distance.distanceKm,
    durationMinutes: distance.durationMinutes,
    estimatedPrice: price.finalPrice,
    statusText,
    ctaText,
  };
}

export async function createQuickOrderFromHomeForm(payload: QuickOrderPayload) {
  const validation = validateQuickOrderPayload(payload);
  if (!validation.valid) {
    throw new Error(`Missing fields: ${validation.missing.join(", ")}`);
  }

  const { pickup, delivery } = await enrichOrderWithMapsData(payload);
  const estimate = await classifyQuickOrder(payload);
  const price = estimatePrice({
    classification: estimate,
    itemType: payload.itemType,
    weight: payload.weight,
  });

  const now = new Date().toISOString();
  const order: Order = {
    id: `ORD-${Date.now()}`,
    orderCode: generateOrderCode(),
    source: OrderSource.WEBSITE,
    senderName: payload.senderName || "Khach website",
    senderPhone: payload.customerPhone,
    pickupAddress: pickup?.fullAddress || payload.pickupAddress,
    pickupDistrict: pickup?.district,
    pickupProvince: estimate.pickupProvince,
    pickupWard: pickup?.ward,
    pickupLat: pickup?.lat,
    pickupLng: pickup?.lng,
    pickupPlaceId: pickup?.placeId,
    receiverName: payload.receiverName || "Nguoi nhan",
    receiverPhone: payload.customerPhone,
    deliveryAddress: delivery?.fullAddress || payload.deliveryAddress,
    deliveryDistrict: delivery?.district,
    deliveryProvince: estimate.deliveryProvince,
    deliveryWard: delivery?.ward,
    deliveryLat: delivery?.lat,
    deliveryLng: delivery?.lng,
    deliveryPlaceId: delivery?.placeId,
    direction: estimate.direction,
    routeName: estimate.routeName,
    routeGroup: estimate.routeGroup,
    serviceLevel: estimate.serviceLevel,
    itemType: payload.itemType,
    itemDescription: payload.itemDescription,
    packageCount: payload.packageCount || 1,
    weight: payload.weight || 1,
    expectedPickupTime: "Cang som cang tot",
    expectedDeliveryTime: payload.expectedDeliveryTime,
    mapsDistanceKm: estimate.distanceKm,
    mapsDurationMinutes: estimate.durationMinutes,
    quotedPrice: price.finalPrice,
    finalPrice: price.finalPrice,
    paymentStatus: "UNPAID",
    manualQuoteRequired: estimate.manualQuoteRequired,
    status: estimate.manualQuoteRequired ? OrderStatus.PENDING_CONFIRMATION : OrderStatus.NEW,
    dispatchStatus: DispatchStatus.NOT_DISPATCHED,
    suggestedZaloGroups: [],
    assignedZaloGroupIds: [],
    driverCandidates: [],
    customerTrackingNote: estimate.publicMessage,
    timeline: [
      {
        id: `TL-${Date.now()}`,
        orderId: "pending",
        eventType: "CREATED",
        title: "Da tiep nhan yeu cau gui hang",
        description: estimate.publicMessage,
        visibility: Visibility.PUBLIC_CUSTOMER,
        createdBy: "system",
        createdAt: now,
      },
    ],
    proofOfPickupImages: [],
    proofOfDeliveryImages: [],
    createdAt: now,
    updatedAt: now,
  };

  order.timeline = order.timeline.map((event) => ({ ...event, orderId: order.id }));
  order.suggestedZaloGroups = suggestZaloGroups(order).map((group) => group.id);
  return createOrder(order);
}

