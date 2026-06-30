import {
  Direction,
  DispatchStatus,
  ItemType,
  OrderSource,
  OrderStatus,
  RouteGroup,
  ServiceLevel,
  Visibility,
} from "../constants/enums";

export interface Dimensions {
  lengthCm?: number;
  widthCm?: number;
  heightCm?: number;
}

export interface OrderTimelineEvent {
  id: string;
  orderId: string;
  eventType: string;
  title: string;
  description: string;
  visibility: Visibility;
  createdBy: string;
  createdAt: string;
}

export interface DriverCandidate {
  driverId: string;
  driverName: string;
  driverPhone: string;
  vehicleType: string;
  vehiclePlate?: string;
  responseText: string;
  status: "CLAIMED" | "APPROVED" | "REJECTED";
  createdAt: string;
}

export interface Order {
  id: string;
  orderCode: string;
  source: OrderSource;
  customerId?: string;
  senderName: string;
  senderPhone: string;
  pickupAddress: string;
  pickupDistrict?: string;
  pickupProvince: string;
  pickupWard?: string;
  pickupLat?: number;
  pickupLng?: number;
  pickupPlaceId?: string;
  receiverName: string;
  receiverPhone: string;
  deliveryAddress: string;
  deliveryDistrict?: string;
  deliveryProvince: string;
  deliveryWard?: string;
  deliveryLat?: number;
  deliveryLng?: number;
  deliveryPlaceId?: string;
  direction: Direction;
  routeName: string;
  routeGroup: RouteGroup;
  serviceLevel: ServiceLevel;
  itemType: ItemType;
  itemDescription?: string;
  itemImages?: string[];
  packageCount: number;
  weight?: number;
  dimensions?: Dimensions | string;
  declaredValue?: number;
  expectedPickupTime?: string;
  expectedDeliveryTime?: string;
  mapsDistanceKm?: number;
  mapsDurationMinutes?: number;
  quotedPrice?: number;
  finalPrice?: number;
  paymentStatus: "UNPAID" | "DEPOSITED" | "PAID" | "COD";
  paymentMethod?: "CASH" | "BANK_TRANSFER" | "COD";
  codAmount?: number;
  insuranceRequired?: boolean;
  loadingRequired?: boolean;
  manualQuoteRequired: boolean;
  status: OrderStatus;
  dispatchStatus: DispatchStatus;
  suggestedZaloGroups: string[];
  assignedZaloGroupIds: string[];
  dispatchedAt?: string;
  dispatchMessage?: string;
  driverCandidates: DriverCandidate[];
  assignedDriverId?: string;
  assignedDriverName?: string;
  assignedDriverPhone?: string;
  assignedVehicleType?: string;
  assignedVehiclePlate?: string;
  internalNotes?: string;
  customerTrackingNote?: string;
  timeline: OrderTimelineEvent[];
  proofOfPickupImages?: string[];
  proofOfDeliveryImages?: string[];
  assignedDriverVisibleToCustomer?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  type: "PERSONAL" | "SHOP" | "BUSINESS";
  defaultAddress?: string;
  totalOrders: number;
  notes?: string;
  createdAt: string;
}

export interface ZaloRouteGroup {
  id: string;
  groupName: string;
  province: string;
  routeName: string;
  direction: Direction;
  zaloGroupId: string;
  zaloGroupLink: string;
  groupType: "PROVINCE" | "ROUTE" | "SPECIAL_ITEM";
  activeDriversCount: number;
  allowedItemTypes: ItemType[];
  serviceLevel: ServiceLevel;
  isActive: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DriverPartner {
  id: string;
  name: string;
  phone: string;
  zaloName?: string;
  zaloUserId?: string;
  avatar?: string;
  vehicleType: string;
  vehiclePlate?: string;
  vehicleCapacity?: string;
  usualRoutes: string[];
  provinces: string[];
  canCarryBulkyGoods: boolean;
  canCarryMotorbike: boolean;
  canDoNightDelivery: boolean;
  verificationStatus: "PENDING" | "VERIFIED" | "REJECTED";
  rating: number;
  totalOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  notes?: string;
  joinedGroups: string[];
  createdAt: string;
  updatedAt: string;
}

export interface PartnerApplication {
  id: string;
  name: string;
  phone: string;
  vehicleType: string;
  vehiclePlate?: string;
  usualRoutes: string[];
  provinces: string[];
  canCarryBulkyGoods: boolean;
  note?: string;
  status: "NEW_APPLICATION" | "APPROVED" | "REJECTED";
  createdAt: string;
}

export interface AIDispatchLog {
  id: string;
  orderId: string;
  targetGroupId: string;
  targetGroupName: string;
  messageContent: string;
  sentAt?: string;
  sentBy: "AI_BOT" | "ADMIN";
  sendStatus: "PREVIEW" | "SENT" | "FAILED";
  errorMessage?: string;
  driverResponsesCount: number;
  createdAt: string;
}

export interface BotCommandLog {
  id: string;
  commandText: string;
  orderCode?: string;
  driverPhone?: string;
  driverName?: string;
  sourceGroupId?: string;
  parsedIntent: string;
  resultStatus: "PARSED" | "FAILED" | "ORDER_NOT_FOUND";
  responseMessage: string;
  createdAt: string;
}

export interface NotificationLog {
  id: string;
  channel: "TELEGRAM_ADMIN" | "ZALO_ADMIN" | "ZALO_CUSTOMER" | "SYSTEM";
  eventType: "NEW_ORDER" | "ORDER_QUOTED" | "CUSTOMER_CONFIRMED" | "ORDER_APPROVED" | "VEHICLE_SEARCH_STARTED" | "VEHICLE_ASSIGNED" | "TELEGRAM_COMMAND" | "ZALO_ADMIN_COMMAND" | "ZALO_CUSTOMER_REPLY";
  orderId?: string;
  orderCode?: string;
  recipient?: string;
  message: string;
  status: "MOCK_SENT" | "SENT" | "FAILED";
  createdAt: string;
}

export interface PricingRule {
  id: string;
  originProvince: string;
  destinationProvince: string;
  direction: Direction;
  itemType: ItemType;
  serviceType: ServiceLevel;
  basePrice: number;
  pricePerKg: number;
  bulkyFee: number;
  fragileFee: number;
  nightFee: number;
  loadingFee: number;
  insuranceRate: number;
  minPrice: number;
  isManualQuoteRequired: boolean;
  isActive: boolean;
}

export interface MapsAddress {
  label: string;
  fullAddress: string;
  province: string;
  district?: string;
  ward?: string;
  lat: number;
  lng: number;
  placeId: string;
  raw?: unknown;
}

export interface RouteDistance {
  distanceKm: number;
  durationMinutes: number;
  raw?: unknown;
}

export interface RouteClassification {
  pickupProvince: string;
  deliveryProvince: string;
  direction: Direction;
  routeName: string;
  routeGroup: RouteGroup;
  serviceLevel: ServiceLevel;
  isSupported: boolean;
  needsManualReview: boolean;
  publicMessage: string;
}

export interface RouteEstimate extends RouteClassification {
  itemType: ItemType;
  manualQuoteRequired: boolean;
  distanceKm?: number;
  durationMinutes?: number;
  estimatedPrice?: number;
  statusText: string;
  ctaText: string;
}

export interface PublicTrackingInfo {
  orderCode: string;
  routeName: string;
  itemType: ItemType;
  status: OrderStatus;
  statusLabel: string;
  expectedDeliveryTime?: string;
  hotline: string;
  customerTrackingNote?: string;
  driver?: {
    name?: string;
    phone?: string;
    vehicleType?: string;
    vehiclePlate?: string;
  };
  publicTimeline: OrderTimelineEvent[];
  proofOfDeliveryImages: string[];
}

export interface QuickOrderPayload {
  pickupAddress: string;
  pickupPlaceId?: string;
  deliveryAddress: string;
  deliveryPlaceId?: string;
  pickupProvince?: string;
  deliveryProvince?: string;
  itemType: ItemType;
  expectedDeliveryTime: string;
  customerPhone: string;
  senderName?: string;
  receiverName?: string;
  itemDescription?: string;
  itemImages?: string[];
  packageCount?: number;
  weight?: number;
}
