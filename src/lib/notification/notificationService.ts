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

function isTelegramLiveEnabled() {
  const mode = process.env.TELEGRAM_NOTIFY_MODE || "auto";
  if (mode === "mock") return false;
  if (mode === "live") return Boolean(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_ADMIN_CHAT_ID);
  return Boolean(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_ADMIN_CHAT_ID);
}

function getAdminUrl(path = "/admincp") {
  const baseUrl = process.env.PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || "";
  return baseUrl ? `${baseUrl.replace(/\/$/, "")}${path}` : path;
}

async function sendTelegramAdminMessage(message: string) {
  if (!isTelegramLiveEnabled()) {
    return { ok: true, status: "MOCK_SENT" as NotificationLog["status"] };
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_ADMIN_CHAT_ID;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), Number(process.env.TELEGRAM_SEND_TIMEOUT_MS || 5000));
  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        disable_web_page_preview: true,
      }),
    });
    if (!response.ok) {
      const errorText = await response.text();
      return { ok: false, status: "FAILED" as NotificationLog["status"], error: errorText || response.statusText };
    }
    return { ok: true, status: "SENT" as NotificationLog["status"] };
  } catch (error) {
    return { ok: false, status: "FAILED" as NotificationLog["status"], error: error instanceof Error ? error.message : "Telegram send failed" };
  } finally {
    clearTimeout(timeout);
  }
}

function formatMoney(value?: number) {
  return value ? `${value.toLocaleString("vi-VN")}d` : "cho admin quyet dinh";
}

export function getNotificationLogs() {
  return notificationLogs;
}

export function getNotificationRuntimeStatus() {
  return {
    telegram: isTelegramLiveEnabled() ? "live" : "mock",
    zaloCustomer: process.env.ZALO_CUSTOMER_NOTIFY_MODE === "live" ? "live" : "mock",
  };
}

export async function notifyTelegramNewOrder(order: Order) {
  const message = [
    `DON MOI ${order.orderCode}`,
    `${order.pickupProvince} -> ${order.deliveryProvince}`,
    `Hang: ${order.itemType}${order.itemDescription ? ` - ${order.itemDescription}` : ""}`,
    `Anh san pham: ${order.itemImages?.length || 0}`,
    `Gia de xuat: ${formatMoney(order.quotedPrice)}`,
    `Khach/Zalo: ${order.senderPhone}`,
    `AdminCP: ${getAdminUrl()}`,
    `Lenh: DUYET ${order.orderCode} <gia_cuoi> | GIA ${order.orderCode} <gia_cuoi> | TIMXE ${order.orderCode}`,
  ].join("\n");
  const result = await sendTelegramAdminMessage(message);

  return createNotificationLog({
    channel: "TELEGRAM_ADMIN",
    eventType: "NEW_ORDER",
    orderId: order.id,
    orderCode: order.orderCode,
    recipient: process.env.TELEGRAM_ADMIN_CHAT_ID || "mock-admin-chat",
    message: result.error ? `${message}\n\nTelegram error: ${result.error}` : message,
    status: result.status,
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
