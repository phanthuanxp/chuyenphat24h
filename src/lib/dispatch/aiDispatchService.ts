import { RouteGroup } from "../constants/enums";
import type { Order, ZaloRouteGroup } from "../types";
import { getGroupByProvince, getSpecialGroupsForItemType } from "../zalo/zaloGroupService";

export function classifyOrderForDispatch(order: Order) {
  return {
    routeGroup: order.routeGroup,
    serviceLevel: order.serviceLevel,
    manualQuoteRequired: order.manualQuoteRequired,
    riskFlags: detectOrderRiskFlags(order),
  };
}

export function suggestZaloGroups(order: Order): ZaloRouteGroup[] {
  const specialGroups = getSpecialGroupsForItemType(order.itemType);
  if (order.manualQuoteRequired && specialGroups.length > 0) return specialGroups;

  const province = order.pickupProvince === "Ha Noi" ? order.deliveryProvince : order.pickupProvince;
  const routeGroups = getGroupByProvince(province);
  return routeGroups.length > 0 ? routeGroups : specialGroups;
}

export function generateDriverBroadcastMessage(order: Order) {
  const finalPrice = order.finalPrice ? `${order.finalPrice.toLocaleString("vi-VN")} VND` : "Can bao gia";
  return [
    `DON MOI ${order.orderCode}`,
    "",
    `Tuyen: ${order.pickupProvince} -> ${order.deliveryProvince}`,
    `Lay hang: ${order.pickupAddress}`,
    `Giao hang: ${order.deliveryAddress}`,
    "",
    `Loai hang: ${order.itemType}`,
    `Mo ta: ${order.itemDescription || "Khong ghi"}`,
    `So kien: ${order.packageCount}`,
    `Khoi luong: ${order.weight || 1} kg`,
    `Kich thuoc: ${typeof order.dimensions === "string" ? order.dimensions : "Chua co"}`,
    "",
    `Thoi gian lay: ${order.expectedPickupTime || "Cang som cang tot"}`,
    `Yeu cau giao: ${order.expectedDeliveryTime || "Theo dieu phoi"}`,
    `Goi dich vu: ${order.serviceLevel}`,
    "",
    `Gia khach tra: ${finalPrice}`,
    `Ghi chu: ${order.internalNotes || "Khong co"}`,
    "",
    `Tai xe khop tuyen vui long nhan don:`,
    `NHAN ${order.orderCode}`,
    "",
    "Hotline dieu phoi: 0345 07 6789",
  ].join("\n");
}

export function detectOrderRiskFlags(order: Order) {
  const flags: string[] = [];
  if (order.manualQuoteRequired) flags.push("MANUAL_QUOTE_REQUIRED");
  if (order.routeGroup === RouteGroup.NORTHWEST_MANUAL) flags.push("NORTHWEST_SCHEDULE_CONFIRMATION");
  if (order.declaredValue && order.declaredValue > 20000000) flags.push("HIGH_DECLARED_VALUE");
  return flags;
}

