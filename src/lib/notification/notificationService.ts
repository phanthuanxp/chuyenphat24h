import type { NotificationLog, Order } from "../types";
import { readJsonArray, writeJsonArray } from "../storage/jsonStore";
import { loadPersistentCollection, persistCollection } from "../storage/persistentStore";

let notificationLogs = readJsonArray<NotificationLog>("notificationLogs.json", []);

function persistNotificationLogs() {
  writeJsonArray("notificationLogs.json", notificationLogs);
  persistCollection("notificationLogs", notificationLogs);
}

export async function hydrateNotificationStorage() {
  notificationLogs = await loadPersistentCollection<NotificationLog>("notificationLogs", notificationLogs);
  persistNotificationLogs();
}

function createNotificationLog(payload: Omit<NotificationLog, "id" | "createdAt" | "status"> & { status?: NotificationLog["status"] }) {
  const log: NotificationLog = {
    ...payload,
    id: `NTF-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    status: payload.status || "MOCK_SENT",
    createdAt: new Date().toISOString(),
  };
  notificationLogs = [log, ...notificationLogs];
  persistNotificationLogs();
  return log;
}

function formatMoney(value?: number) {
  return value ? `${value.toLocaleString("vi-VN")}d` : "cho admin quyet dinh";
}

export function getNotificationLogs() {
  return notificationLogs;
}

export function notifyTelegramNewOrder(order: Order) {
  const message = [
    `DON MOI ${order.orderCode}`,
    `${order.pickupProvince} -> ${order.deliveryProvince}`,
    `Hang: ${order.itemType}${order.itemDescription ? ` - ${order.itemDescription}` : ""}`,
    `Anh san pham: ${order.itemImages?.length || 0}`,
    `Gia de xuat: ${formatMoney(order.quotedPrice)}`,
    `Khach/Zalo: ${order.senderPhone}`,
    `Lenh: DUYET ${order.orderCode} <gia_cuoi> | GIA ${order.orderCode} <gia_cuoi> | TIMXE ${order.orderCode}`,
  ].join("\n");

  return createNotificationLog({
    channel: "TELEGRAM_ADMIN",
    eventType: "NEW_ORDER",
    orderId: order.id,
    orderCode: order.orderCode,
    recipient: process.env.TELEGRAM_ADMIN_CHAT_ID || "mock-admin-chat",
    message,
  });
}

export function notifyVehicleSearchStarted(order: Order) {
  return createNotificationLog({
    channel: "SYSTEM",
    eventType: "VEHICLE_SEARCH_STARTED",
    orderId: order.id,
    orderCode: order.orderCode,
    message: `He thong bat dau tim xe gan nhat cho ${order.orderCode}.`,
  });
}

export function mockSendCustomerZaloOrderApproved(order: Order) {
  return createNotificationLog({
    channel: "ZALO_CUSTOMER",
    eventType: "ORDER_APPROVED",
    orderId: order.id,
    orderCode: order.orderCode,
    recipient: order.senderPhone,
    message: `Zalo mock: Don ${order.orderCode} da duoc duyet. Gia cuoc chinh thuc ${formatMoney(order.finalPrice)}. He thong dang tim xe phu hop.`,
  });
}

export function mockSendCustomerZaloVehicleAssigned(order: Order) {
  return createNotificationLog({
    channel: "ZALO_CUSTOMER",
    eventType: "VEHICLE_ASSIGNED",
    orderId: order.id,
    orderCode: order.orderCode,
    recipient: order.senderPhone,
    message: `Zalo mock: Xe nhan don ${order.orderCode}: ${order.assignedDriverName || "tai xe"} - ${order.assignedDriverPhone || "dang cap nhat"} - ${order.assignedVehicleType || "xe"} ${order.assignedVehiclePlate || ""}.`,
  });
}

export function logTelegramCommand(orderCode: string, commandText: string, status: NotificationLog["status"] = "MOCK_SENT") {
  return createNotificationLog({
    channel: "TELEGRAM_ADMIN",
    eventType: "TELEGRAM_COMMAND",
    orderCode,
    recipient: process.env.TELEGRAM_ADMIN_CHAT_ID || "mock-admin-chat",
    message: commandText,
    status,
  });
}

export function notifyAdminNewOrder(orderCode: string) {
  return { success: true, channel: "mock", message: `New order ${orderCode}` };
}

export function notifyDispatchEvent(orderCode: string) {
  return { success: true, channel: "mock", message: `Dispatch event ${orderCode}` };
}

export function mockSendZaloGroupMessage(groupId: string, message: string) {
  return { success: true, groupId, message };
}
