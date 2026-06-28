export * from "./lib/types";
export {
  Direction,
  DispatchStatus,
  ItemType,
  OrderSource,
  OrderStatus,
  RouteGroup,
  ServiceLevel,
  Visibility,
  STATUS_LABELS as OrderStatusLabels,
} from "./lib/constants/enums";

import { OrderStatus } from "./lib/constants/enums";

export const OrderStatusColors: Record<OrderStatus, string> = {
  [OrderStatus.NEW]: "bg-blue-50 text-blue-700 border-blue-200",
  [OrderStatus.PENDING_CONFIRMATION]: "bg-amber-50 text-amber-700 border-amber-200",
  [OrderStatus.QUOTED]: "bg-indigo-50 text-indigo-700 border-indigo-200",
  [OrderStatus.CUSTOMER_CONFIRMED]: "bg-purple-50 text-purple-700 border-purple-200",
  [OrderStatus.READY_TO_DISPATCH]: "bg-orange-50 text-orange-700 border-orange-200",
  [OrderStatus.DISPATCHED_TO_ZALO]: "bg-cyan-50 text-cyan-700 border-cyan-200",
  [OrderStatus.DRIVER_CLAIMED]: "bg-teal-50 text-teal-700 border-teal-200",
  [OrderStatus.WAITING_ADMIN_APPROVAL]: "bg-yellow-50 text-yellow-700 border-yellow-200",
  [OrderStatus.DRIVER_ASSIGNED]: "bg-emerald-50 text-emerald-700 border-emerald-200",
  [OrderStatus.PICKUP_IN_PROGRESS]: "bg-cyan-50 text-cyan-700 border-cyan-200",
  [OrderStatus.PICKED_UP]: "bg-sky-50 text-sky-700 border-sky-200",
  [OrderStatus.IN_TRANSIT]: "bg-rose-50 text-rose-700 border-rose-200",
  [OrderStatus.ARRIVED_DESTINATION]: "bg-teal-50 text-teal-700 border-teal-200",
  [OrderStatus.DELIVERY_IN_PROGRESS]: "bg-lime-50 text-lime-700 border-lime-200",
  [OrderStatus.DELIVERED]: "bg-green-100 text-green-800 border-green-200",
  [OrderStatus.ISSUE_REPORTED]: "bg-red-100 text-red-900 border-red-300",
  [OrderStatus.REDISPATCH_REQUIRED]: "bg-orange-100 text-orange-900 border-orange-300",
  [OrderStatus.CANCELLED]: "bg-gray-100 text-gray-700 border-gray-200",
  [OrderStatus.RETURNED]: "bg-red-50 text-red-700 border-red-200",
};

export interface Route {
  id: string;
  name: string;
  originProvince?: string;
  destinationProvince?: string;
  direction?: string;
  departureTime?: string;
  estimatedDuration?: string;
  serviceLevel?: string;
  driverId?: string;
  vehicleId?: string;
  capacityStatus?: string;
  routeStatus?: string;
  remainingOrderSlots?: number;
  acceptedItemTypes?: string[];
  notes?: string;
}

export interface Driver {
  id: string;
  name: string;
  phone: string;
  avatar?: string;
  vehicleId?: string;
  status?: string;
  rating?: number;
  notes?: string;
}

export interface Vehicle {
  id: string;
  type: string;
  plateNumber: string;
  capacity?: string;
  cargoDimensions?: string;
  status?: string;
  notes?: string;
}

export interface ContentPage {
  id: string;
  title: string;
  slug: string;
  metaTitle: string;
  metaDescription: string;
  content: string;
  pageType: "service" | "policy" | "blog";
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: string;
}
