import crypto from "node:crypto";
import type { NotificationJob, NotificationLog, Order } from "../types";
import { readJsonArray, writeJsonArray } from "../storage/jsonStore";
import { loadPersistentCollection, persistCollection } from "../storage/persistentStore";

let notificationLogs = readJsonArray<NotificationLog>("notificationLogs.json", []);
let notificationJobs = readJsonArray<NotificationJob>("notificationJobs.json", []);
let workerRunning = false;
let workerTimer: NodeJS.Timeout | undefined;

function persistNotificationLogs() {
  writeJsonArray("notificationLogs.json", notificationLogs);
  persistCollection("notificationLogs", notificationLogs);
}

export async function hydrateNotificationStorage() {
  notificationLogs = await loadPersistentCollection<NotificationLog>("notificationLogs", notificationLogs);
  notificationJobs = await loadPersistentCollection<NotificationJob>("notificationJobs", notificationJobs);
  const now = new Date().toISOString();
  notificationJobs = notificationJobs.map((job) => job.status === "PROCESSING"
    ? { ...job, status: "QUEUED", nextAttemptAt: now, updatedAt: now }
    : job);
  persistNotificationLogs();
  persistNotificationJobs();
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

function persistNotificationJobs() {
  writeJsonArray("notificationJobs.json", notificationJobs);
  persistCollection("notificationJobs", notificationJobs);
}

function formatMoney(value?: number) {
  return value ? `${value.toLocaleString("vi-VN")}d` : "cho admin quyet dinh";
}

export function getNotificationLogs() {
  return notificationLogs;
}

export function getNotificationJobs() {
  return notificationJobs;
}

export function getNotificationRuntimeStatus() {
  return {
    telegram: isTelegramLiveEnabled() ? "live" : "mock",
    zaloAdmin: isZaloLiveEnabled() ? "live" : "mock",
    zaloCustomer: isZaloLiveEnabled() ? "live" : "mock",
  };
}

type EnqueueNotificationInput = Pick<NotificationJob, "channel" | "eventType" | "message"> &
  Partial<Pick<NotificationJob, "orderId" | "orderCode" | "recipient" | "fallbackRecipient" | "maxAttempts">>;

export function enqueueNotification(input: EnqueueNotificationInput) {
  const digest = crypto.createHash("sha256")
    .update([input.channel, input.eventType, input.orderId || "", input.recipient || "", input.message].join("|"))
    .digest("hex");
  const existing = notificationJobs.find((job) => job.idempotencyKey === digest);
  if (existing) return existing;

  const now = new Date().toISOString();
  const job: NotificationJob = {
    ...input,
    id: `NJOB-${Date.now()}-${crypto.randomBytes(3).toString("hex")}`,
    idempotencyKey: digest,
    status: "QUEUED",
    attempts: 0,
    maxAttempts: input.maxAttempts || 5,
    nextAttemptAt: now,
    createdAt: now,
    updatedAt: now,
  };
  notificationJobs = [job, ...notificationJobs];
  persistNotificationJobs();
  return job;
}

function updateNotificationJob(id: string, updates: Partial<NotificationJob>) {
  notificationJobs = notificationJobs.map((job) => job.id === id
    ? { ...job, ...updates, updatedAt: new Date().toISOString() }
    : job);
  persistNotificationJobs();
  return notificationJobs.find((job) => job.id === id);
}

async function deliverNotificationJob(job: NotificationJob) {
  if (job.channel === "TELEGRAM_ADMIN") return sendTelegramAdminMessage(job.message);
  if (job.channel === "ZALO_ADMIN") return sendZaloMessage(job.recipient || "", job.message);
  if (job.channel === "ZALO_CUSTOMER") {
    if (isZaloLiveEnabled() && !job.recipient) {
      return { ok: false, status: "FAILED" as NotificationLog["status"], error: "Customer Zalo user ID is not linked to this order" };
    }
    return sendZaloMessage(job.recipient || job.fallbackRecipient || "", job.message);
  }
  return { ok: true, status: "MOCK_SENT" as NotificationLog["status"] };
}

async function processNotificationJob(job: NotificationJob, now = new Date()) {
  const attempts = job.attempts + 1;
  updateNotificationJob(job.id, { status: "PROCESSING", attempts, lastAttemptAt: now.toISOString(), lastError: undefined });
  const result = await deliverNotificationJob(job);
  createNotificationLog({
    channel: job.channel,
    eventType: job.eventType,
    orderId: job.orderId,
    orderCode: job.orderCode,
    recipient: job.recipient || job.fallbackRecipient,
    message: result.error ? `${job.message}\n\nDelivery error: ${result.error}` : job.message,
    status: result.status,
  });

  if (result.ok) {
    return updateNotificationJob(job.id, { status: "SENT", providerStatus: result.status, lastError: undefined });
  }

  const exhausted = attempts >= job.maxAttempts;
  const retryDelayMs = Math.min(60_000 * (2 ** Math.max(0, attempts - 1)), 30 * 60_000);
  return updateNotificationJob(job.id, {
    status: exhausted ? "DEAD_LETTER" : "FAILED",
    providerStatus: result.status,
    lastError: result.error || "Notification delivery failed",
    nextAttemptAt: new Date(now.getTime() + retryDelayMs).toISOString(),
  });
}

export async function processNotificationOutbox(options: { now?: Date; maxJobs?: number; jobId?: string } = {}) {
  if (workerRunning) return [];
  workerRunning = true;
  try {
    const now = options.now || new Date();
    const dueJobs = notificationJobs
      .filter((job) => (!options.jobId || job.id === options.jobId) && ["QUEUED", "FAILED"].includes(job.status) && new Date(job.nextAttemptAt).getTime() <= now.getTime())
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
      .slice(0, options.maxJobs || 10);
    const processed: NotificationJob[] = [];
    for (const job of dueJobs) {
      const updated = await processNotificationJob(job, now);
      if (updated) processed.push(updated);
    }
    return processed;
  } finally {
    workerRunning = false;
  }
}

export function retryNotificationJob(jobId: string) {
  const job = notificationJobs.find((item) => item.id === jobId);
  if (!job) return null;
  return updateNotificationJob(jobId, {
    status: "QUEUED",
    attempts: 0,
    nextAttemptAt: new Date().toISOString(),
    lastError: undefined,
    providerStatus: undefined,
  });
}

export function startNotificationWorker() {
  if (workerTimer) return workerTimer;
  const intervalMs = Math.max(1_000, Number(process.env.NOTIFICATION_WORKER_INTERVAL_MS || 5_000));
  const runOnce = () => processNotificationOutbox().catch((error) => {
    console.error("[notification-worker] Failed processing outbox", error);
  });
  void runOnce();
  workerTimer = setInterval(() => void runOnce(), intervalMs);
  workerTimer.unref();
  return workerTimer;
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
  return enqueueNotification({
    channel: "TELEGRAM_ADMIN",
    eventType: "NEW_ORDER",
    orderId: order.id,
    orderCode: order.orderCode,
    recipient: process.env.TELEGRAM_ADMIN_CHAT_ID || "mock-admin-chat",
    message,
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
  return enqueueNotification({
    channel: "ZALO_ADMIN",
    eventType: "NEW_ORDER",
    orderId: order.id,
    orderCode: order.orderCode,
    recipient,
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
  return enqueueNotification({
    channel: "ZALO_CUSTOMER",
    eventType: "ORDER_APPROVED",
    orderId: order.id,
    orderCode: order.orderCode,
    recipient: order.customerZaloUserId,
    fallbackRecipient: order.senderPhone,
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
  return enqueueNotification({
    channel: "ZALO_CUSTOMER",
    eventType: "ORDER_QUOTED",
    orderId: order.id,
    orderCode: order.orderCode,
    recipient: order.customerZaloUserId,
    fallbackRecipient: order.senderPhone,
    message,
  });
}

export async function sendCustomerZaloConfirmation(order: Order) {
  const message = [
    `Da xac nhan gui hang ${order.orderCode}.`,
    "Dieu hanh dang sap xep xe va se gui thong tin xe van chuyen qua Zalo.",
  ].join("\n");
  return enqueueNotification({
    channel: "ZALO_CUSTOMER",
    eventType: "CUSTOMER_CONFIRMED",
    orderId: order.id,
    orderCode: order.orderCode,
    recipient: order.customerZaloUserId,
    fallbackRecipient: order.senderPhone,
    message,
  });
}

export async function sendCustomerZaloVehicleInfo(order: Order, vehicleInfo: string) {
  const message = [
    `Thong tin xe van chuyen don ${order.orderCode}:`,
    vehicleInfo,
    "",
    "Anh/chi vui long giu dien thoai de tai xe/nhan vien lien he khi lay hang.",
  ].join("\n");
  return enqueueNotification({
    channel: "ZALO_CUSTOMER",
    eventType: "VEHICLE_ASSIGNED",
    orderId: order.id,
    orderCode: order.orderCode,
    recipient: order.customerZaloUserId,
    fallbackRecipient: order.senderPhone,
    message,
  });
}

export function mockSendCustomerZaloVehicleAssigned(order: Order) {
  return enqueueNotification({
    channel: "ZALO_CUSTOMER",
    eventType: "VEHICLE_ASSIGNED",
    orderId: order.id,
    orderCode: order.orderCode,
    recipient: order.customerZaloUserId,
    fallbackRecipient: order.senderPhone,
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
