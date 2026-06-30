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

function isZaloLiveEnabled() {
  const mode = process.env.ZALO_NOTIFY_MODE || "mock";
  return mode === "live" && Boolean(process.env.ZALO_SEND_MESSAGE_ENDPOINT && process.env.ZALO_ACCESS_TOKEN);
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

async function sendZaloMessage(recipient: string, message: string) {
  if (!isZaloLiveEnabled()) {
    return { ok: true, status: "MOCK_SENT" as NotificationLog["status"] };
  }

  const endpoint = process.env.ZALO_SEND_MESSAGE_ENDPOINT;
  const token = process.env.ZALO_ACCESS_TOKEN;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), Number(process.env.ZALO_SEND_TIMEOUT_MS || 5000));
  try {
    const response = await fetch(endpoint!, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        access_token: token!,
        Authorization: `Bearer ${token}`,
      },
      signal: controller.signal,
      body: JSON.stringify({
        recipient,
        message,
      }),
    });
    if (!response.ok) {
      const errorText = await response.text();
      return { ok: false, status: "FAILED" as NotificationLog["status"], error: errorText || response.statusText };
    }
    return { ok: true, status: "SENT" as NotificationLog["status"] };
  } catch (error) {
    return { ok: false, status: "FAILED" as NotificationLog["status"], error: error instanceof Error ? error.message : "Zalo send failed" };
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
    zaloAdmin: isZaloLiveEnabled() ? "live" : "mock",
    zaloCustomer: isZaloLiveEnabled() ? "live" : "mock",
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

export async function notifyZaloAdminNewOrder(order: Order) {
  const message = [
    `LEAD MOI ${order.orderCode}`,
    `${order.pickupProvince} -> ${order.deliveryProvince}`,
    `Hang: ${order.itemType}${order.itemDescription ? ` - ${order.itemDescription}` : ""}`,
    `Khach: ${order.senderName} - ${order.senderPhone}`,
    `Lay: ${order.pickupAddress}`,
    `Giao: ${order.deliveryAddress}`,
    `Gia web: ${formatMoney(order.quotedPrice)}`,
    "",
    `Lenh: GIA ${order.orderCode} <gia> <lich_lay>`,
    `VD: GIA ${order.orderCode} 250000 14h hom nay`,
  ].join("\n");
  const recipient = process.env.ZALO_ADMIN_RECIPIENT || process.env.ZALO_ADMIN_USER_ID || "mock-zalo-admin";
  const result = await sendZaloMessage(recipient, message);

  return createNotificationLog({
    channel: "ZALO_ADMIN",
    eventType: "NEW_ORDER",
    orderId: order.id,
    orderCode: order.orderCode,
    recipient,
    message: result.error ? `${message}\n\nZalo error: ${result.error}` : message,
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

export async function sendCustomerZaloQuote(order: Order, pickupSchedule: string) {
  const message = [
    `Bao gia don ${order.orderCode}`,
    `Tuyen: ${order.routeName}`,
    `Gia: ${formatMoney(order.finalPrice || order.quotedPrice)}`,
    `Lich lay hang: ${pickupSchedule}`,
    "",
    `Neu dong y gui hang, vui long tra loi: DONG Y ${order.orderCode}`,
  ].join("\n");
  const result = await sendZaloMessage(order.senderPhone, message);
  return createNotificationLog({
    channel: "ZALO_CUSTOMER",
    eventType: "ORDER_QUOTED",
    orderId: order.id,
    orderCode: order.orderCode,
    recipient: order.senderPhone,
    message: result.error ? `${message}\n\nZalo error: ${result.error}` : message,
    status: result.status,
  });
}

export async function sendCustomerZaloConfirmation(order: Order) {
  const message = [
    `Da xac nhan gui hang ${order.orderCode}.`,
    "Dieu hanh dang sap xep xe va se gui thong tin xe van chuyen qua Zalo.",
  ].join("\n");
  const result = await sendZaloMessage(order.senderPhone, message);
  return createNotificationLog({
    channel: "ZALO_CUSTOMER",
    eventType: "CUSTOMER_CONFIRMED",
    orderId: order.id,
    orderCode: order.orderCode,
    recipient: order.senderPhone,
    message: result.error ? `${message}\n\nZalo error: ${result.error}` : message,
    status: result.status,
  });
}

export async function sendCustomerZaloVehicleInfo(order: Order, vehicleInfo: string) {
  const message = [
    `Thong tin xe van chuyen don ${order.orderCode}:`,
    vehicleInfo,
    "",
    "Anh/chi vui long giu dien thoai de tai xe/nhan vien lien he khi lay hang.",
  ].join("\n");
  const result = await sendZaloMessage(order.senderPhone, message);
  return createNotificationLog({
    channel: "ZALO_CUSTOMER",
    eventType: "VEHICLE_ASSIGNED",
    orderId: order.id,
    orderCode: order.orderCode,
    recipient: order.senderPhone,
    message: result.error ? `${message}\n\nZalo error: ${result.error}` : message,
    status: result.status,
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

export function logZaloAdminCommand(orderCode: string | undefined, commandText: string, responseMessage: string, status: NotificationLog["status"] = "MOCK_SENT") {
  return createNotificationLog({
    channel: "ZALO_ADMIN",
    eventType: "ZALO_ADMIN_COMMAND",
    orderCode,
    recipient: process.env.ZALO_ADMIN_USER_ID || "mock-zalo-admin",
    message: `${commandText}\n\n${responseMessage}`,
    status,
  });
}

export function logZaloCustomerReply(orderCode: string | undefined, sender: string, commandText: string, responseMessage: string, status: NotificationLog["status"] = "MOCK_SENT") {
  return createNotificationLog({
    channel: "ZALO_CUSTOMER",
    eventType: "ZALO_CUSTOMER_REPLY",
    orderCode,
    recipient: sender,
    message: `${commandText}\n\n${responseMessage}`,
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
