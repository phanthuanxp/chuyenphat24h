/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum OrderStatus {
  NEW = "NEW",
  PENDING_CONFIRMATION = "PENDING_CONFIRMATION",
  QUOTED = "QUOTED",
  CUSTOMER_CONFIRMED = "CUSTOMER_CONFIRMED",
  ASSIGNING_DRIVER = "ASSIGNING_DRIVER",
  ASSIGNED = "ASSIGNED",
  PICKUP_IN_PROGRESS = "PICKUP_IN_PROGRESS",
  PICKED_UP = "PICKED_UP",
  IN_TRANSIT = "IN_TRANSIT",
  ARRIVED_DESTINATION = "ARRIVED_DESTINATION",
  DELIVERY_IN_PROGRESS = "DELIVERY_IN_PROGRESS",
  DELIVERED = "DELIVERED",
  CANCELLED = "CANCELLED",
  RETURNED = "RETURNED",
  ISSUE_REPORTED = "ISSUE_REPORTED"
}

export const OrderStatusLabels: Record<OrderStatus, string> = {
  [OrderStatus.NEW]: "Mới tạo",
  [OrderStatus.PENDING_CONFIRMATION]: "Chờ xác nhận",
  [OrderStatus.QUOTED]: "Đã báo giá",
  [OrderStatus.CUSTOMER_CONFIRMED]: "Khách đã xác nhận",
  [OrderStatus.ASSIGNING_DRIVER]: "Đang điều xe",
  [OrderStatus.ASSIGNED]: "Đã gán tài xế",
  [OrderStatus.PICKUP_IN_PROGRESS]: "Đang lấy hàng",
  [OrderStatus.PICKED_UP]: "Đã lấy hàng",
  [OrderStatus.IN_TRANSIT]: "Đang vận chuyển",
  [OrderStatus.ARRIVED_DESTINATION]: "Đã đến tỉnh nhận",
  [OrderStatus.DELIVERY_IN_PROGRESS]: "Đang giao hàng",
  [OrderStatus.DELIVERED]: "Đã giao thành công",
  [OrderStatus.CANCELLED]: "Đã hủy",
  [OrderStatus.RETURNED]: "Hoàn hàng",
  [OrderStatus.ISSUE_REPORTED]: "Có sự cố"
};

export const OrderStatusColors: Record<OrderStatus, string> = {
  [OrderStatus.NEW]: "bg-blue-50 text-blue-700 border-blue-200",
  [OrderStatus.PENDING_CONFIRMATION]: "bg-amber-50 text-amber-700 border-amber-200",
  [OrderStatus.QUOTED]: "bg-indigo-50 text-indigo-700 border-indigo-200",
  [OrderStatus.CUSTOMER_CONFIRMED]: "bg-purple-50 text-purple-700 border-purple-200",
  [OrderStatus.ASSIGNING_DRIVER]: "bg-orange-50 text-orange-700 border-orange-200",
  [OrderStatus.ASSIGNED]: "bg-emerald-50 text-emerald-700 border-emerald-200",
  [OrderStatus.PICKUP_IN_PROGRESS]: "bg-cyan-50 text-cyan-700 border-cyan-200",
  [OrderStatus.PICKED_UP]: "bg-sky-50 text-sky-700 border-sky-200",
  [OrderStatus.IN_TRANSIT]: "bg-rose-50 text-rose-700 border-rose-200",
  [OrderStatus.ARRIVED_DESTINATION]: "bg-teal-50 text-teal-700 border-teal-200",
  [OrderStatus.DELIVERY_IN_PROGRESS]: "bg-lime-50 text-lime-700 border-lime-200",
  [OrderStatus.DELIVERED]: "bg-green-100 text-green-800 border-green-200",
  [OrderStatus.CANCELLED]: "bg-gray-100 text-gray-700 border-gray-200",
  [OrderStatus.RETURNED]: "bg-red-50 text-red-700 border-red-200",
  [OrderStatus.ISSUE_REPORTED]: "bg-red-100 text-red-900 border-red-300"
};

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  type: "Cá nhân" | "Shop online" | "Doanh nghiệp" | "Văn phòng" | "Showroom" | "Gara" | "Đại lý điện máy";
  defaultAddress?: string;
  totalOrders: number;
  notes?: string;
  createdAt: string;
}

export interface Order {
  id: string;
  orderCode: string;
  customerId?: string;
  senderName: string;
  senderPhone: string;
  pickupAddress: string;
  pickupDistrict: string;
  pickupProvince: string;
  receiverName: string;
  receiverPhone: string;
  deliveryAddress: string;
  deliveryDistrict: string;
  deliveryProvince: string;
  direction: "Hà Nội đi Tỉnh" | "Tỉnh về Hà Nội";
  routeName: string;
  itemType: string;
  itemDescription: string;
  itemImages?: string[];
  weight: number; // in kg
  dimensions?: string; // DxRxC cm
  declaredValue?: number; // VNĐ
  serviceType: "Hỏa tốc 2-4h" | "Trong ngày" | "Gửi 24h" | "Xe riêng";
  expectedPickupTime?: string;
  expectedDeliveryTime?: string;
  quotedPrice?: number;
  finalPrice?: number;
  status: OrderStatus;
  assignedDriverId?: string;
  assignedVehicleId?: string;
  assignedRouteId?: string;
  paymentStatus: "Chưa thanh toán" | "Đã cọc" | "Đã thanh toán" | "Thu hộ COD";
  internalNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Route {
  id: string;
  name: string;
  originProvince: string;
  destinationProvince: string;
  direction: "Hà Nội đi Tỉnh" | "Tỉnh về Hà Nội";
  departureTime: string;
  estimatedDuration: string;
  serviceLevel: string; // e.g. "Thời gian: 2-4 giờ"
  driverId?: string;
  vehicleId?: string;
  capacityStatus: "Trống nhiều" | "Còn trống vừa" | "Sắp đầy" | "Đã đầy";
  routeStatus: "Sắp chạy" | "Đang nhận hàng" | "Đã xuất phát" | "Đang trên đường" | "Đã đến nơi" | "Đã kết thúc";
  remainingOrderSlots: number;
  acceptedItemTypes: string[];
  notes?: string;
}

export interface Driver {
  id: string;
  name: string;
  phone: string;
  avatar: string;
  vehicleId?: string;
  status: "Rảnh" | "Đang nhận hàng" | "Đang chạy tuyến" | "Nghỉ";
  rating: number;
  notes?: string;
}

export interface Vehicle {
  id: string;
  type: "Xe máy" | "Xe 4 chỗ" | "Xe 7 chỗ" | "Xe 16 chỗ" | "Bán tải" | "Xe tải nhỏ" | "Xe tải lớn";
  plateNumber: string;
  capacity: string; // e.g., "500 kg"
  cargoDimensions: string; // e.g., "180x130x120 cm"
  status: "Hoạt động" | "Bảo dưỡng" | "Tạm ngưng";
  notes?: string;
}

export interface PricingRule {
  id: string;
  originProvince: string;
  destinationProvince: string;
  direction: "Hà Nội đi Tỉnh" | "Tỉnh về Hà Nội";
  itemType: string;
  serviceType: string;
  basePrice: number;
  pricePerKg: number;
  bulkyFee: number;
  fragileFee: number;
  nightFee: number;
  loadingFee: number;
  insuranceRate: number; // as a percentage of declaredValue (e.g. 0.01)
  minPrice: number;
  isManualQuoteRequired: boolean;
  isActive: boolean;
}

export interface StatusLog {
  id: string;
  orderId: string;
  status: OrderStatus;
  note: string;
  image?: string;
  updatedBy: string;
  createdAt: string;
}

export interface Payment {
  id: string;
  orderId: string;
  method: "Tiền mặt" | "Chuyển khoản QR" | "Thanh toán ví" | "COD";
  amount: number;
  status: "Chưa thanh toán" | "Đã thanh toán" | "Thất bại";
  transactionCode?: string;
  createdAt: string;
}

export interface ContentPage {
  id: string;
  title: string;
  slug: string;
  metaTitle: string;
  metaDescription: string;
  content: string;
  pageType: "service" | "policy" | "blog";
  status: "Nháp" | "Xuất bản";
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: string;
}
