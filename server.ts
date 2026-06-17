import dotenv from "dotenv";
import express, { Request, Response } from "express";
import crypto from "node:crypto";
import path from "node:path";
import { createServer as createViteServer } from "vite";
import { mapsService } from "./src/lib/maps/mapsService";
import { classifyQuickOrder, createQuickOrderFromHomeForm } from "./src/lib/orders/quickOrderService";
import { addTimelineEvent, assignDriverToOrder, getOrders, updateOrder } from "./src/lib/orders/orderService";
import { getPublicTrackingInfo } from "./src/lib/tracking/trackingService";
import { addDispatchPreviewLog, getDispatchLogs, sendOrderToZaloGroups } from "./src/lib/dispatch/dispatchService";
import { parseDriverCommand } from "./src/lib/zalo/botCommandParser";
import { getZaloGroups } from "./src/lib/zalo/zaloGroupService";
import { getPartnerApplications, createPartnerApplication } from "./src/lib/partners/driverPartnerService";
import { createDriverCandidateFromPartner, findNearestVehicleForOrder } from "./src/lib/partners/nearestVehicleService";
import { getNotificationLogs, logTelegramCommand, mockSendCustomerZaloOrderApproved, mockSendCustomerZaloVehicleAssigned } from "./src/lib/notification/notificationService";
import { DispatchStatus, OrderStatus, Visibility } from "./src/lib/constants/enums";
import { mockRoutes } from "./src/data/mockRoutes";
import { mockPricingRules } from "./src/data/mockPricing";
import { mockPartners } from "./src/data/mockPartners";
import { seoPages } from "./src/lib/seo/seoPages";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 3000);
const adminUsername = process.env.ADMIN_USERNAME || "admin";
const adminPassword = process.env.ADMIN_PASSWORD || "change-me-now";
const sessionSecret = process.env.ADMIN_SESSION_SECRET || "cp24h-dev-session-secret";
const sessionCookieName = "cp24h_admin_session";

app.use(express.json({ limit: "10mb" }));

function findOrder(orderIdOrCode: string) {
  return getOrders().find((item) => item.id === orderIdOrCode || item.orderCode.toLowerCase() === orderIdOrCode.toLowerCase());
}

function approveOrder(orderIdOrCode: string, finalPrice: number, note?: string, actor = "admin") {
  const order = findOrder(orderIdOrCode);
  if (!order) return null;
  const updated = updateOrder(order.id, {
    finalPrice,
    status: OrderStatus.CUSTOMER_CONFIRMED,
    dispatchStatus: DispatchStatus.READY_TO_DISPATCH,
    customerTrackingNote: `Don da duoc dieu hanh duyet. Gia cuoc chinh thuc: ${finalPrice.toLocaleString("vi-VN")}d. He thong dang tim xe phu hop.`,
    internalNotes: [order.internalNotes, note].filter(Boolean).join("\n"),
  });
  addTimelineEvent(order.id, {
    eventType: "ORDER_APPROVED",
    title: "Don da duoc duyet",
    description: `Gia cuoc chinh thuc: ${finalPrice.toLocaleString("vi-VN")}d.`,
    visibility: Visibility.PUBLIC_CUSTOMER,
    createdBy: actor,
  });
  if (updated) mockSendCustomerZaloOrderApproved(updated);
  return findOrder(order.id);
}

function assignNearestVehicle(orderIdOrCode: string, actor = "admin") {
  const order = findOrder(orderIdOrCode);
  if (!order) return { order: null, vehicle: null };
  const vehicle = findNearestVehicleForOrder(order);
  if (!vehicle) {
    const updated = updateOrder(order.id, {
      dispatchStatus: DispatchStatus.NO_DRIVER_FOUND,
      customerTrackingNote: "Dieu hanh dang tiep tuc tim xe phu hop cho don hang.",
    });
    return { order: updated, vehicle: null };
  }
  const candidate = createDriverCandidateFromPartner(vehicle);
  updateOrder(order.id, { driverCandidates: [candidate, ...order.driverCandidates] });
  const assigned = assignDriverToOrder(order.id, candidate);
  if (assigned) {
    addTimelineEvent(order.id, {
      eventType: "VEHICLE_ASSIGNED",
      title: "Da co xe nhan don",
      description: `${assigned.assignedDriverName} - ${assigned.assignedVehicleType} ${assigned.assignedVehiclePlate || ""}.`,
      visibility: Visibility.PUBLIC_CUSTOMER,
      createdBy: actor,
    });
    const latest = updateOrder(order.id, {
      assignedDriverVisibleToCustomer: true,
      customerTrackingNote: "Da co xe nhan don. Thong tin xe da duoc gui qua Zalo cua khach.",
    });
    if (latest) mockSendCustomerZaloVehicleAssigned(latest);
    return { order: findOrder(order.id), vehicle };
  }
  return { order: null, vehicle };
}

function parseCookies(cookieHeader = "") {
  return cookieHeader.split(";").reduce<Record<string, string>>((cookies, pair) => {
    const [rawKey, ...rawValue] = pair.trim().split("=");
    if (!rawKey) return cookies;
    cookies[rawKey] = decodeURIComponent(rawValue.join("="));
    return cookies;
  }, {});
}

function signSession(payload: string) {
  return crypto.createHmac("sha256", sessionSecret).update(payload).digest("hex");
}

function createSessionToken(username: string) {
  const expiresAt = Date.now() + 1000 * 60 * 60 * 12;
  const payload = Buffer.from(JSON.stringify({ username, expiresAt })).toString("base64url");
  return `${payload}.${signSession(payload)}`;
}

function verifySessionToken(token?: string) {
  if (!token) return false;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return false;
  const expected = signSession(payload);
  if (signature.length !== expected.length) return false;
  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return false;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    return data.username === adminUsername && Number(data.expiresAt) > Date.now();
  } catch {
    return false;
  }
}

function setAdminCookie(res: Response, token: string) {
  const secureFlag = process.env.NODE_ENV === "production" ? "; Secure" : "";
  res.setHeader(
    "Set-Cookie",
    `${sessionCookieName}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=43200${secureFlag}`,
  );
}

function clearAdminCookie(res: Response) {
  res.setHeader("Set-Cookie", `${sessionCookieName}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`);
}

function isAdminAuthenticated(req: Request) {
  const cookies = parseCookies(req.headers.cookie);
  return verifySessionToken(cookies[sessionCookieName]);
}

function requireAdmin(req: Request, res: Response, next: () => void) {
  if (!isAdminAuthenticated(req)) {
    return res.status(401).json({ message: "Admin login required" });
  }
  next();
}

function asyncHandler<TReq extends Request = Request>(
  handler: (req: TReq, res: Response) => Promise<unknown>,
) {
  return (req: TReq, res: Response) => {
    handler(req, res).catch((error) => {
      console.error(error);
      res.status(500).json({ message: error instanceof Error ? error.message : "Internal server error" });
    });
  };
}

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    app: "Chuyen Phat 24H",
    stack: "Vite + React + Express",
    time: new Date().toISOString(),
  });
});

app.get("/api/admin/session", (req, res) => {
  res.json({ authenticated: isAdminAuthenticated(req), username: isAdminAuthenticated(req) ? adminUsername : null });
});

app.post("/api/admin/login", (req, res) => {
  const { username, password } = req.body;
  if (username !== adminUsername || password !== adminPassword) {
    return res.status(401).json({ message: "Sai tai khoan hoac mat khau admin." });
  }
  setAdminCookie(res, createSessionToken(username));
  res.json({ authenticated: true, username });
});

app.post("/api/admin/logout", (_req, res) => {
  clearAdminCookie(res);
  res.json({ authenticated: false });
});

app.get("/api/maps/autocomplete", asyncHandler(async (req, res) => {
  const query = String(req.query.q || req.query.query || "");
  res.json(await mapsService.searchAddress(query));
}));

app.get("/api/maps/place-detail", asyncHandler(async (req, res) => {
  const placeId = String(req.query.placeId || "");
  if (!placeId) return res.status(400).json({ message: "Missing placeId" });
  const detail = await mapsService.getPlaceDetails(placeId);
  if (!detail) return res.status(404).json({ message: "Place not found" });
  res.json(detail);
}));

app.post("/api/maps/distance", asyncHandler(async (req, res) => {
  const { origin, destination, originProvince, destinationProvince } = req.body;
  if (!origin || !destination) return res.status(400).json({ message: "Missing origin or destination" });
  res.json(await mapsService.calculateDistance({ origin, destination, originProvince, destinationProvince }));
}));

app.post("/api/orders/estimate", asyncHandler(async (req, res) => {
  res.json(await classifyQuickOrder(req.body));
}));

app.post("/api/orders/quick-create", asyncHandler(async (req, res) => {
  const order = await createQuickOrderFromHomeForm(req.body);
  res.status(201).json(order);
}));

app.get("/api/orders", requireAdmin, (_req, res) => {
  res.json(getOrders());
});

app.get("/api/notification/logs", requireAdmin, (_req, res) => {
  res.json(getNotificationLogs());
});

app.post("/api/admin/orders/:id/approve", requireAdmin, (req, res) => {
  const finalPrice = Number(req.body.finalPrice);
  if (!Number.isFinite(finalPrice) || finalPrice <= 0) {
    return res.status(400).json({ message: "finalPrice must be a positive number" });
  }
  const order = approveOrder(req.params.id, finalPrice, req.body.note, "admin");
  if (!order) return res.status(404).json({ message: "Order not found" });
  res.json(order);
});

app.post("/api/admin/orders/:id/assign-nearest-vehicle", requireAdmin, (req, res) => {
  const result = assignNearestVehicle(req.params.id, "admin");
  if (!result.order) return res.status(404).json({ message: "Order not found" });
  res.json(result);
});

app.post("/api/telegram/webhook", (req, res) => {
  const expectedSecret = process.env.TELEGRAM_WEBHOOK_SECRET;
  const receivedSecret = String(req.query.secret || req.headers["x-telegram-webhook-secret"] || "");
  if (expectedSecret && expectedSecret !== receivedSecret) {
    return res.status(401).json({ message: "Invalid Telegram webhook secret" });
  }

  const commandText = String(req.body.text || req.body.message?.text || "").trim();
  const [command, orderCode, priceText] = commandText.split(/\s+/);
  if (!command || !orderCode) {
    return res.status(400).json({ message: "Use: DUYET <orderCode> <finalPrice> or TIMXE <orderCode>" });
  }

  const normalizedCommand = command.toUpperCase();
  logTelegramCommand(orderCode, commandText);
  if (["DUYET", "GIA"].includes(normalizedCommand)) {
    const finalPrice = Number(priceText);
    if (!Number.isFinite(finalPrice) || finalPrice <= 0) {
      return res.status(400).json({ message: "Missing valid final price" });
    }
    const order = approveOrder(orderCode, finalPrice, `Telegram command: ${commandText}`, "telegram");
    if (!order) return res.status(404).json({ message: "Order not found" });
    return res.json({ ok: true, action: "APPROVED", order });
  }

  if (normalizedCommand === "TIMXE") {
    const result = assignNearestVehicle(orderCode, "telegram");
    if (!result.order) return res.status(404).json({ message: "Order not found" });
    return res.json({ ok: true, action: "VEHICLE_ASSIGNED", ...result });
  }

  return res.status(400).json({ message: "Unsupported Telegram command" });
});

app.get("/api/admin/summary", requireAdmin, (_req, res) => {
  const orders = getOrders();
  res.json({
    totalOrders: orders.length,
    pendingConfirmation: orders.filter((order) => order.status === "PENDING_CONFIRMATION").length,
    manualQuoteRequired: orders.filter((order) => order.manualQuoteRequired).length,
    readyForDispatch: orders.filter((order) => order.dispatchStatus === "NOT_DISPATCHED").length,
    dispatchedToZalo: orders.filter((order) => order.dispatchStatus === "DISPATCHED_TO_ZALO").length,
    inTransit: orders.filter((order) => ["IN_TRANSIT", "DELIVERY_IN_PROGRESS"].includes(order.status)).length,
    completed: orders.filter((order) => order.status === "DELIVERED").length,
    issues: orders.filter((order) => order.status === "ISSUE_REPORTED").length,
    zaloGroups: getZaloGroups().length,
    partners: mockPartners.length,
    pricingRules: mockPricingRules.length,
    generatedAt: new Date().toISOString(),
  });
});

app.get("/api/admin/workspace", requireAdmin, (_req, res) => {
  res.json({
    orders: getOrders(),
    zaloGroups: getZaloGroups(),
    routes: mockRoutes,
    pricingRules: mockPricingRules,
    partners: mockPartners,
    partnerApplications: getPartnerApplications(),
    seoPages,
    dispatchLogs: getDispatchLogs(),
  });
});

app.patch("/api/orders/:id", requireAdmin, (req, res) => {
  const order = updateOrder(req.params.id, req.body);
  if (!order) return res.status(404).json({ message: "Order not found" });
  res.json(order);
});

app.post("/api/orders/track", (req, res) => {
  const { orderCode, phone } = req.body;
  if (!orderCode || !phone) {
    return res.status(400).json({ message: "Nhap ma don va so dien thoai de tra cuu." });
  }
  const tracking = getPublicTrackingInfo(getOrders(), orderCode, phone);
  if (!tracking) return res.status(404).json({ message: "Khong tim thay don phu hop." });
  res.json(tracking);
});

app.get("/api/orders/lookup", requireAdmin, (req, res) => {
  const code = String(req.query.code || "").toLowerCase();
  const phone = String(req.query.phone || "");
  const orders = getOrders().filter((order) =>
    (!code || order.orderCode.toLowerCase().includes(code)) &&
    (!phone || order.senderPhone.includes(phone) || order.receiverPhone.includes(phone)),
  );
  res.json(orders);
});

app.post("/api/dispatch/preview", requireAdmin, (req, res) => {
  const order = getOrders().find((item) => item.id === req.body.orderId || item.orderCode === req.body.orderCode);
  if (!order) return res.status(404).json({ message: "Order not found" });
  res.json(addDispatchPreviewLog(order));
});

app.post("/api/dispatch/send", requireAdmin, (req, res) => {
  const order = getOrders().find((item) => item.id === req.body.orderId || item.orderCode === req.body.orderCode);
  if (!order) return res.status(404).json({ message: "Order not found" });
  const result = sendOrderToZaloGroups(order, "ADMIN");
  updateOrder(order.id, result.updates);
  res.json(result);
});

app.get("/api/dispatch/logs", requireAdmin, (_req, res) => {
  res.json(getDispatchLogs());
});

app.post("/api/bot/parse", requireAdmin, (req, res) => {
  res.json(parseDriverCommand(String(req.body.commandText || "")));
});

app.get("/api/zalo-groups", requireAdmin, (_req, res) => {
  res.json(getZaloGroups());
});

app.get("/api/routes", (_req, res) => {
  res.json(mockRoutes);
});

app.get("/api/pricing-rules", requireAdmin, (_req, res) => {
  res.json(mockPricingRules);
});

app.get("/api/partners", requireAdmin, (_req, res) => {
  res.json(mockPartners);
});

app.get("/api/partner-applications", requireAdmin, (_req, res) => {
  res.json(getPartnerApplications());
});

app.post("/api/partner-applications", (req, res) => {
  const { name, phone, vehicleType, vehiclePlate, usualRoutes, provinces, canCarryBulkyGoods, note } = req.body;
  if (!name || !phone || !vehicleType) {
    return res.status(400).json({ message: "Missing required partner application fields" });
  }
  res.status(201).json(createPartnerApplication({
    name,
    phone,
    vehicleType,
    vehiclePlate,
    usualRoutes: Array.isArray(usualRoutes) ? usualRoutes : String(usualRoutes || "").split(",").map((item) => item.trim()).filter(Boolean),
    provinces: Array.isArray(provinces) ? provinces : String(provinces || "").split(",").map((item) => item.trim()).filter(Boolean),
    canCarryBulkyGoods: Boolean(canCarryBulkyGoods),
    note,
  }));
});

app.get("/api/seo-pages", (_req, res) => {
  res.json(seoPages);
});

async function setupApp() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Chuyen Phat 24H running on http://localhost:${PORT}`);
  });
}

setupApp();
