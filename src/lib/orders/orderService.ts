import { DispatchStatus, OrderStatus, Visibility } from "../constants/enums";
import type { DriverCandidate, Order, OrderTimelineEvent } from "../types";
import { mockOrders } from "../../data/mockOrders";
import { readJsonArray, writeJsonArray } from "../storage/jsonStore";
import { loadPersistentCollection, persistCollection } from "../storage/persistentStore";

let orders: Order[] = readJsonArray<Order>("orders.json", mockOrders);

function persistOrders() {
  writeJsonArray("orders.json", orders);
  persistCollection("orders", orders);
}

export async function hydrateOrderStorage() {
  orders = await loadPersistentCollection<Order>("orders", orders);
  persistOrders();
}

export function getOrders() {
  return orders;
}

export function getOrderByCode(orderCode: string) {
  return orders.find((order) => order.orderCode.toLowerCase() === orderCode.toLowerCase());
}

export function createOrder(payload: Order) {
  orders = [payload, ...orders];
  persistOrders();
  return payload;
}

export function updateOrder(orderId: string, updates: Partial<Order>) {
  orders = orders.map((order) => (order.id === orderId ? { ...order, ...updates, updatedAt: new Date().toISOString() } : order));
  persistOrders();
  return orders.find((order) => order.id === orderId) || null;
}

export function updateOrderStatus(orderId: string, status: OrderStatus, description?: string) {
  const updated = updateOrder(orderId, { status });
  if (updated) {
    addTimelineEvent(orderId, {
      eventType: status,
      title: status,
      description: description || "Trang thai don hang da duoc cap nhat.",
      visibility: Visibility.PUBLIC_CUSTOMER,
      createdBy: "admin",
    });
  }
  return getOrders().find((order) => order.id === orderId) || null;
}

export function addTimelineEvent(orderId: string, event: Omit<OrderTimelineEvent, "id" | "orderId" | "createdAt">) {
  const timelineEvent: OrderTimelineEvent = {
    ...event,
    id: `TL-${Date.now()}`,
    orderId,
    createdAt: new Date().toISOString(),
  };
  const order = orders.find((item) => item.id === orderId);
  if (!order) return null;
  updateOrder(orderId, { timeline: [...order.timeline, timelineEvent] });
  return timelineEvent;
}

export function assignDriverToOrder(orderId: string, candidate: DriverCandidate) {
  return updateOrder(orderId, {
    status: OrderStatus.DRIVER_ASSIGNED,
    dispatchStatus: DispatchStatus.DRIVER_ASSIGNED,
    assignedDriverId: candidate.driverId,
    assignedDriverName: candidate.driverName,
    assignedDriverPhone: candidate.driverPhone,
    assignedVehicleType: candidate.vehicleType,
    assignedVehiclePlate: candidate.vehiclePlate,
  });
}

export function markOrderManualReview(orderId: string, note = "Can xu ly thu cong") {
  return updateOrder(orderId, {
    manualQuoteRequired: true,
    status: OrderStatus.PENDING_CONFIRMATION,
    internalNotes: note,
  });
}
