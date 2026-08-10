import crypto from "node:crypto";
import { DispatchStatus, ItemType, OrderSource, OrderStatus, Visibility } from "../constants/enums";
import type { Order, QuickOrderPayload, RouteEstimate } from "../types";
import { mapsService } from "../maps/mapsService";
import { classifyRouteGroup } from "../maps/routeClassifier";
import { estimatePrice, isManualQuoteRequired } from "../pricing/pricingService";
import { createOrder, getOrders } from "./orderService";
import { notifyTelegramNewOrder, notifyZaloAdminNewOrder } from "../notification/notificationService";

const phonePattern = /^(?:\+?84|0)\d{9,10}$/;
const allowedImagePattern = /^data:image\/(?:jpeg|png|webp);base64,/i;
const maxImageBytes = 2 * 1024 * 1024;

export class QuickOrderValidationError extends Error {
  statusCode = 400;
}

export function generateOrderCode(existingCodes = new Set(getOrders().map((order) => order.orderCode))) {
  const day = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const suffix = crypto.randomBytes(4).toString("hex").toUpperCase();
    const code = `CP24H-${day}-${suffix}`;
    if (!existingCodes.has(code)) return code;
  }
  throw new Error("Could not allocate a unique order code");
}

export function validateQuickOrderPayload(payload: QuickOrderPayload) {
  const missing = [
    !payload.pickupAddress && "pickupAddress",
    !payload.deliveryAddress && "deliveryAddress",
    !payload.customerPhone && "customerPhone",
    !payload.itemType && "itemType",
  ].filter(Boolean);
  const errors: string[] = [];
  const customerPhone = String(payload.customerPhone || "").replace(/[\s.-]/g, "");
  const receiverPhone = String(payload.receiverPhone || customerPhone).replace(/[\s.-]/g, "");
  if (customerPhone && !phonePattern.test(customerPhone)) errors.push("customerPhone is invalid");
  if (receiverPhone && !phonePattern.test(receiverPhone)) errors.push("receiverPhone is invalid");
  if (Number(payload.packageCount || 1) < 1) errors.push("packageCount must be at least 1");
  if (Number(payload.weight || 1) <= 0 || Number(payload.weight || 1) > 10000) errors.push("weight is invalid");
  if ((payload.itemImages?.length || 0) > 4) errors.push("itemImages supports at most 4 images");
  for (const image of payload.itemImages || []) {
    if (!allowedImagePattern.test(image)) errors.push("itemImages contains an unsupported image type");
    const base64 = image.split(",", 2)[1] || "";
    if (Math.ceil(base64.length * 0.75) > maxImageBytes) errors.push("each item image must be 2 MB or smaller");
  }
  return { valid: missing.length === 0 && errors.length === 0, missing, errors };
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
  const validation = validateQuickOrderPayload(payload);
  if (!validation.valid) {
    throw new QuickOrderValidationError([
      validation.missing.length ? `Missing fields: ${validation.missing.join(", ")}` : "",
      ...validation.errors,
    ].filter(Boolean).join("; "));
  }
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
    throw new QuickOrderValidationError([
      validation.missing.length ? `Missing fields: ${validation.missing.join(", ")}` : "",
      ...validation.errors,
    ].filter(Boolean).join("; "));
  }

  if (payload.idempotencyKey) {
    const normalizedPhone = payload.customerPhone.replace(/[\s.-]/g, "");
    const existingOrder = getOrders().find((order) => order.idempotencyKey === payload.idempotencyKey && order.senderPhone === normalizedPhone);
    if (existingOrder) return existingOrder;
  }

  const { pickup, delivery } = await enrichOrderWithMapsData(payload);
  const estimate = await classifyQuickOrder(payload);
  const price = estimatePrice({
    classification: estimate,
    itemType: payload.itemType,
    weight: payload.weight,
  });

  const now = new Date().toISOString();
  const customerPhone = payload.customerPhone.replace(/[\s.-]/g, "");
  const receiverPhone = (payload.receiverPhone || payload.customerPhone).replace(/[\s.-]/g, "");
  const priceNote = price.finalPrice ? `${price.finalPrice.toLocaleString("vi-VN")}d` : "can bao gia thu cong";
  const order: Order = {
    id: `ORD-${Date.now()}`,
    orderCode: generateOrderCode(),
    idempotencyKey: payload.idempotencyKey,
    source: OrderSource.WEBSITE,
    senderName: payload.senderName || "Khach website",
    senderPhone: customerPhone,
    pickupAddress: pickup?.fullAddress || payload.pickupAddress,
    pickupDistrict: pickup?.district,
    pickupProvince: estimate.pickupProvince,
    pickupWard: pickup?.ward,
    pickupLat: pickup?.lat,
    pickupLng: pickup?.lng,
    pickupPlaceId: pickup?.placeId,
    receiverName: payload.receiverName || "Nguoi nhan",
    receiverPhone,
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
    itemImages: payload.itemImages || [],
    packageCount: payload.packageCount || 1,
    weight: payload.weight || 1,
    expectedPickupTime: "Cang som cang tot",
    expectedDeliveryTime: payload.expectedDeliveryTime,
    mapsDistanceKm: estimate.distanceKm,
    mapsDurationMinutes: estimate.durationMinutes,
    quotedPrice: price.finalPrice,
    finalPrice: undefined,
    paymentStatus: "UNPAID",
    manualQuoteRequired: estimate.manualQuoteRequired,
    status: OrderStatus.PENDING_CONFIRMATION,
    dispatchStatus: DispatchStatus.NOT_DISPATCHED,
    suggestedZaloGroups: [],
    assignedZaloGroupIds: [],
    driverCandidates: [],
    internalNotes: `Gia tren website chi la gia de xuat: ${priceNote}. Admin se bao gia/chot lich va gui thong tin xe cho khach qua Zalo.`,
    customerTrackingNote: "Don da duoc tiep nhan. Dieu hanh se xac nhan gia chinh thuc va thong tin xe qua Zalo.",
    timeline: [
      {
        id: `TL-${Date.now()}`,
        orderId: "pending",
        eventType: "CREATED",
        title: "Da tiep nhan yeu cau gui hang",
        description: "He thong da nhan don va gui ve kenh Zalo admin de dieu hanh bao gia.",
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
  const createdOrder = createOrder(order);
  await notifyZaloAdminNewOrder(createdOrder);
  await notifyTelegramNewOrder(createdOrder);
  return createdOrder;
}
