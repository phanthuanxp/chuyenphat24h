import { STATUS_LABELS } from "../constants/enums";
import { Visibility } from "../constants/enums";
import type { Order, OrderTimelineEvent, PublicTrackingInfo } from "../types";

export function buildPublicTimeline(order: Order): OrderTimelineEvent[] {
  return order.timeline.filter((event) => event.visibility === Visibility.PUBLIC_CUSTOMER);
}

export function hideInternalOrderData(order: Order): PublicTrackingInfo {
  return {
    orderCode: order.orderCode,
    routeName: order.routeName,
    itemType: order.itemType,
    status: order.status,
    statusLabel: STATUS_LABELS[order.status],
    expectedDeliveryTime: order.expectedDeliveryTime,
    hotline: "0345 07 6789",
    customerTrackingNote: order.customerTrackingNote,
    driver: order.assignedDriverVisibleToCustomer
      ? {
          name: order.assignedDriverName,
          phone: order.assignedDriverPhone,
          vehicleType: order.assignedVehicleType,
          vehiclePlate: order.assignedVehiclePlate,
        }
      : undefined,
    publicTimeline: buildPublicTimeline(order),
    proofOfDeliveryImages: order.proofOfDeliveryImages || [],
  };
}

export function getPublicTrackingInfo(orders: Order[], orderCode: string, phone: string) {
  const order = orders.find((item) =>
    item.orderCode.toLowerCase() === orderCode.toLowerCase() &&
    (item.senderPhone.includes(phone) || item.receiverPhone.includes(phone)),
  );
  return order ? hideInternalOrderData(order) : null;
}

