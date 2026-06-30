import "dotenv/config";
import express, { Request, Response } from "express";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { createServer as createViteServer } from "vite";
import { mapsService } from "./src/lib/maps/mapsService";
import { classifyQuickOrder, createQuickOrderFromHomeForm } from "./src/lib/orders/quickOrderService";
import { addTimelineEvent, assignDriverToOrder, getOrders, hydrateOrderStorage, updateOrder } from "./src/lib/orders/orderService";
import { getPublicTrackingInfo } from "./src/lib/tracking/trackingService";
import { addDispatchPreviewLog, getDispatchLogs, hydrateDispatchStorage, sendOrderToZaloGroups } from "./src/lib/dispatch/dispatchService";
import { parseDriverCommand } from "./src/lib/zalo/botCommandParser";
import { getZaloGroups } from "./src/lib/zalo/zaloGroupService";
import { handleZaloAdminCommand, handleZaloCustomerReply } from "./src/lib/zalo/zaloWorkflowService";
import { getPartnerApplications, createPartnerApplication, hydratePartnerStorage } from "./src/lib/partners/driverPartnerService";
import { createDriverCandidateFromPartner, findNearestVehicleForOrder } from "./src/lib/partners/nearestVehicleService";
import { getNotificationLogs, getNotificationRuntimeStatus, hydrateNotificationStorage, logTelegramCommand, mockSendCustomerZaloOrderApproved, mockSendCustomerZaloVehicleAssigned } from "./src/lib/notification/notificationService";
import { DispatchStatus, OrderStatus, STATUS_LABELS, Visibility } from "./src/lib/constants/enums";
import { mockRoutes } from "./src/data/mockRoutes";
import { mockPricingRules } from "./src/data/mockPricing";
import { mockPartners } from "./src/data/mockPartners";
import { mainSeoRoutes } from "./src/lib/seo/seoPages";
import { getSeoPages, hydrateSeoStorage, resetSeoPages, updateSeoPage, updateSeoPages } from "./src/lib/seo/seoService";
import { initializePersistentStore, isDatabaseEnabled } from "./src/lib/storage/persistentStore";
import type { Order } from "./src/lib/types";
import { getThemeSettings, hydrateThemeStorage, resetThemeSettings, updateThemeSettings } from "./src/lib/theme/themeService";

const app = express();
const PORT = Number(process.env.PORT || 3000);
const adminUsername = process.env.ADMIN_USERNAME || "admin";
const adminPassword = process.env.ADMIN_PASSWORD || "change-me-now";
const sessionSecret = process.env.ADMIN_SESSION_SECRET || "cp24h-dev-session-secret";
const sessionCookieName = "cp24h_admin_session";
const validOrderStatuses = new Set(Object.values(OrderStatus));
const editableOrderTextFields = [
  "senderName",
  "senderPhone",
  "pickupAddress",
  "receiverName",
  "receiverPhone",
  "deliveryAddress",
  "itemDescription",
  "customerTrackingNote",
] as const;
const editableOrderNumberFields = ["packageCount", "weight", "quotedPrice", "finalPrice"] as const;

app.use(express.json({ limit: "10mb" }));

function siteUrl() {
  return String(process.env.SITE_URL || "https://chuyenphat24h.com").replace(/\/+$/, "");
}

function absoluteUrl(pathname = "/") {
  const normalized = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `${siteUrl()}${normalized}`;
}

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeJsonForHtml(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

function normalizePathname(rawPath = "/") {
  const pathname = rawPath.split("?")[0].split("#")[0] || "/";
  if (pathname === "/index.html") return "/";
  return pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
}

function findSeoMeta(rawPath: string) {
  const pathname = normalizePathname(rawPath);
  const routeMeta = mainSeoRoutes.find((item) => item.path === pathname);
  if (routeMeta) return { ...routeMeta, path: pathname, h1: routeMeta.title };

  const slug = pathname.replace(/^\//, "");
  const seoPage = getSeoPages().find((item) => item.slug === slug);
  if (seoPage) return { ...seoPage, path: `/${seoPage.slug}` };

  return {
    path: pathname,
    title: "Chuyển Phát 24H - Chuyển phát hỏa tốc liên tỉnh",
    description: "Chuyển Phát 24H nhận hàng tận nơi, giao tận tay theo tuyến xe đang chạy từ Hà Nội đi các tỉnh.",
    h1: "Chuyển Phát 24H",
    priority: 0.5,
    changefreq: "weekly" as const,
  };
}

function buildOrganizationSchema() {
  const theme = getThemeSettings();
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: theme.brandName,
    alternateName: theme.brandShortName,
    url: siteUrl(),
    image: absoluteUrl(theme.heroImageUrl),
    telephone: theme.hotline,
    areaServed: ["Hà Nội", "Bắc Ninh", "Hải Phòng", "Quảng Ninh", "Ninh Bình", "Thanh Hóa", "Nghệ An"],
    description: theme.footerDescription,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Hà Nội",
      addressCountry: "VN",
    },
  };
}

function buildServiceSchema(meta: ReturnType<typeof findSeoMeta>) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: meta.h1,
    serviceType: "Chuyển phát hỏa tốc liên tỉnh",
    provider: {
      "@type": "LocalBusiness",
      name: getThemeSettings().brandName,
      url: siteUrl(),
    },
    areaServed: {
      "@type": "Country",
      name: "Việt Nam",
    },
    url: absoluteUrl(meta.path),
    description: meta.description,
  };
}

function buildWebsiteSchema() {
  const theme = getThemeSettings();
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: theme.brandName,
    url: siteUrl(),
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteUrl()}/tra-cuu?ma-don={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

function renderSeoHtml(template: string, requestPath: string) {
  const meta = findSeoMeta(requestPath);
  const canonicalUrl = absoluteUrl(meta.path);
  const theme = getThemeSettings();
  const imageUrl = absoluteUrl(theme.heroImageUrl);
  const schema = meta.path === "/"
    ? [buildOrganizationSchema(), buildWebsiteSchema()]
    : [buildOrganizationSchema(), buildServiceSchema(meta)];
  const metaTags = [
    `<title>${escapeHtml(meta.title)}</title>`,
    `<meta name="description" content="${escapeHtml(meta.description)}" />`,
    `<meta name="robots" content="${meta.path === "/admincp" ? "noindex,nofollow" : "index,follow"}" />`,
    `<link rel="canonical" href="${escapeHtml(canonicalUrl)}" />`,
    `<meta property="og:site_name" content="${escapeHtml(theme.brandName)}" />`,
    `<meta property="og:type" content="${meta.path === "/" ? "website" : "article"}" />`,
    `<meta property="og:title" content="${escapeHtml(meta.title)}" />`,
    `<meta property="og:description" content="${escapeHtml(meta.description)}" />`,
    `<meta property="og:url" content="${escapeHtml(canonicalUrl)}" />`,
    `<meta property="og:image" content="${escapeHtml(imageUrl)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${escapeHtml(meta.title)}" />`,
    `<meta name="twitter:description" content="${escapeHtml(meta.description)}" />`,
    `<meta name="twitter:image" content="${escapeHtml(imageUrl)}" />`,
    `<script type="application/ld+json">${escapeJsonForHtml(schema)}</script>`,
  ].join("\n    ");

  const withoutExistingTitle = template.replace(/<title>[\s\S]*?<\/title>/i, "");
  return withoutExistingTitle.replace("</head>", `    ${metaTags}\n  </head>`);
}

function sitemapEntries() {
  return [
    ...mainSeoRoutes,
    ...getSeoPages().map((page) => ({
      path: `/${page.slug}`,
      priority: page.priority,
      changefreq: page.changefreq,
    })),
  ];
}

function normalizeText(value: unknown) {
  return String(value || "").trim().toLowerCase();
}

function firstQueryValue(value: unknown) {
  return Array.isArray(value) ? String(value[0] || "") : String(value || "");
}

function filterOrders(orders: Order[], query: Request["query"]) {
  const keyword = normalizeText(firstQueryValue(query.q || query.query));
  const status = firstQueryValue(query.status);
  const dispatch = firstQueryValue(query.dispatch);
  const route = normalizeText(firstQueryValue(query.route));
  const phone = normalizeText(firstQueryValue(query.phone));
  const dateFrom = firstQueryValue(query.dateFrom);
  const dateTo = firstQueryValue(query.dateTo);

  return orders.filter((order) => {
    const orderDate = order.createdAt?.slice(0, 10) || "";
    const routeHaystack = [
      order.routeName,
      order.pickupProvince,
      order.deliveryProvince,
      order.pickupAddress,
      order.deliveryAddress,
    ].map(normalizeText).join(" ");
    const phoneHaystack = [order.senderPhone, order.receiverPhone].map(normalizeText).join(" ");
    const keywordHaystack = [
      order.orderCode,
      order.senderName,
      order.senderPhone,
      order.receiverName,
      order.receiverPhone,
      order.routeName,
      order.pickupAddress,
      order.deliveryAddress,
      order.itemDescription,
      order.assignedDriverName,
      order.assignedDriverPhone,
      order.internalNotes,
    ].map(normalizeText).join(" ");

    return (
      (!keyword || keywordHaystack.includes(keyword)) &&
      (!status || status === "all" || order.status === status) &&
      (!dispatch || dispatch === "all" || order.dispatchStatus === dispatch) &&
      (!route || routeHaystack.includes(route)) &&
      (!phone || phoneHaystack.includes(phone)) &&
      (!dateFrom || orderDate >= dateFrom) &&
      (!dateTo || orderDate <= dateTo)
    );
  });
}

function csvCell(value: unknown) {
  const text = String(value ?? "").replace(/\r?\n/g, " ");
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function ordersToCsv(orders: Order[]) {
  const headers = [
    "Ma don",
    "Ngay tao",
    "Khach gui",
    "SDT gui",
    "Nguoi nhan",
    "SDT nhan",
    "Tuyen",
    "Tinh di",
    "Tinh den",
    "Loai hang",
    "Trang thai",
    "Dieu phoi",
    "Gia de xuat",
    "Gia da duyet",
    "Tai xe",
    "SDT tai xe",
    "Ghi chu noi bo",
  ];
  const rows = orders.map((order) => [
    order.orderCode,
    order.createdAt ? new Date(order.createdAt).toLocaleString("vi-VN") : "",
    order.senderName,
    order.senderPhone,
    order.receiverName,
    order.receiverPhone,
    order.routeName,
    order.pickupProvince,
    order.deliveryProvince,
    order.itemType,
    STATUS_LABELS[order.status] || order.status,
    order.dispatchStatus,
    order.quotedPrice || "",
    order.finalPrice || "",
    order.assignedDriverName || "",
    order.assignedDriverPhone || "",
    order.internalNotes || "",
  ]);

  return [headers, ...rows].map((row) => row.map(csvCell).join(",")).join("\n");
}

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

function updateAdminOrder(orderIdOrCode: string, payload: Record<string, unknown>, actor = "admin") {
  const order = findOrder(orderIdOrCode);
  if (!order) return { order: null, error: "Order not found" };

  const updates: Record<string, unknown> = {};
  const changedFields: string[] = [];

  for (const field of editableOrderTextFields) {
    if (!(field in payload)) continue;
    const nextValue = String(payload[field] ?? "").trim();
    if (nextValue !== String(order[field] ?? "")) {
      updates[field] = nextValue || undefined;
      changedFields.push(field);
    }
  }

  for (const field of editableOrderNumberFields) {
    if (!(field in payload)) continue;
    const rawValue = payload[field];
    const nextValue = rawValue === "" || rawValue === null || rawValue === undefined ? undefined : Number(rawValue);
    if (nextValue !== undefined && (!Number.isFinite(nextValue) || nextValue < 0)) {
      return { order: null, error: `${field} must be a valid number` };
    }
    if (field === "packageCount" && nextValue !== undefined && nextValue < 1) {
      return { order: null, error: "packageCount must be at least 1" };
    }
    if (nextValue !== order[field]) {
      updates[field] = nextValue;
      changedFields.push(field);
    }
  }

  const nextStatus = typeof payload.status === "string" ? payload.status : undefined;
  if (nextStatus) {
    if (!validOrderStatuses.has(nextStatus as OrderStatus)) {
      return { order: null, error: "Invalid order status" };
    }
    if (nextStatus !== order.status) {
      updates.status = nextStatus;
      changedFields.push("status");
    }
  }

  const operationNote = String(payload.operationNote || "").trim();
  if (operationNote) {
    const noteLine = `[${new Date().toLocaleString("vi-VN")}] ${actor}: ${operationNote}`;
    updates.internalNotes = [order.internalNotes, noteLine].filter(Boolean).join("\n");
    changedFields.push("internalNotes");
  }

  if (!changedFields.length) {
    return { order, error: null };
  }

  const updated = updateOrder(order.id, updates);
  if (!updated) return { order: null, error: "Order not found" };

  if (updates.status) {
    addTimelineEvent(order.id, {
      eventType: "ORDER_STATUS_UPDATED",
      title: "Cap nhat trang thai don",
      description: `Trang thai moi: ${STATUS_LABELS[updates.status as OrderStatus] || updates.status}.`,
      visibility: Visibility.PUBLIC_CUSTOMER,
      createdBy: actor,
    });
  }

  if (operationNote) {
    addTimelineEvent(order.id, {
      eventType: "INTERNAL_NOTE_ADDED",
      title: "Them ghi chu noi bo",
      description: operationNote,
      visibility: Visibility.ADMIN_ONLY,
      createdBy: actor,
    });
  } else if (changedFields.some((field) => field !== "status")) {
    addTimelineEvent(order.id, {
      eventType: "ORDER_ADMIN_EDITED",
      title: "Cap nhat thong tin don",
      description: `Da cap nhat: ${changedFields.filter((field) => field !== "status").join(", ")}.`,
      visibility: Visibility.ADMIN_ONLY,
      createdBy: actor,
    });
  }

  return { order: findOrder(order.id), error: null };
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

function extractZaloWebhookText(body: Record<string, unknown>) {
  const message = body.message as Record<string, unknown> | undefined;
  const event = body.event as Record<string, unknown> | undefined;
  return String(
    body.text ||
    body.commandText ||
    message?.text ||
    event?.text ||
    (message?.message as Record<string, unknown> | undefined)?.text ||
    "",
  ).trim();
}

function extractZaloSender(body: Record<string, unknown>) {
  const sender = body.sender as Record<string, unknown> | undefined;
  const message = body.message as Record<string, unknown> | undefined;
  const event = body.event as Record<string, unknown> | undefined;
  return String(
    body.senderId ||
    body.user_id ||
    sender?.id ||
    sender?.user_id ||
    message?.from ||
    event?.user_id ||
    body.phone ||
    "",
  ).trim();
}

function isZaloAdminSender(sender: string) {
  const ids = String(process.env.ZALO_ADMIN_USER_IDS || process.env.ZALO_ADMIN_USER_ID || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  return ids.length ? ids.includes(sender) : false;
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
    storage: isDatabaseEnabled() ? "postgres" : "json",
    notifications: getNotificationRuntimeStatus(),
    time: new Date().toISOString(),
  });
});

app.get("/robots.txt", (_req, res) => {
  res.type("text/plain").send([
    "User-agent: *",
    "Allow: /",
    "Disallow: /admincp",
    "Disallow: /api/",
    `Sitemap: ${absoluteUrl("/sitemap.xml")}`,
    "",
  ].join("\n"));
});

app.get("/sitemap.xml", (_req, res) => {
  const today = new Date().toISOString().slice(0, 10);
  const urls = sitemapEntries().map((entry) => [
    "  <url>",
    `    <loc>${escapeHtml(absoluteUrl(entry.path))}</loc>`,
    `    <lastmod>${today}</lastmod>`,
    `    <changefreq>${entry.changefreq}</changefreq>`,
    `    <priority>${entry.priority.toFixed(2)}</priority>`,
    "  </url>",
  ].join("\n"));
  res.type("application/xml").send([
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls,
    "</urlset>",
    "",
  ].join("\n"));
});

app.get("/api/admin/session", (req, res) => {
  res.json({ authenticated: isAdminAuthenticated(req), username: isAdminAuthenticated(req) ? adminUsername : null });
});

app.get("/api/theme-settings", (_req, res) => {
  res.json(getThemeSettings());
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

app.get("/api/admin/orders/export.csv", requireAdmin, (req, res) => {
  const orders = filterOrders(getOrders(), req.query);
  const dateLabel = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename="chuyenphat24h-orders-${dateLabel}.csv"`);
  res.send(`\uFEFF${ordersToCsv(orders)}`);
});

app.get("/api/notification/logs", requireAdmin, (_req, res) => {
  res.json(getNotificationLogs());
});

app.get("/api/admin/theme-settings", requireAdmin, (_req, res) => {
  res.json(getThemeSettings());
});

app.put("/api/admin/theme-settings", requireAdmin, (req, res) => {
  res.json(updateThemeSettings(req.body));
});

app.post("/api/admin/theme-settings/reset", requireAdmin, (_req, res) => {
  res.json(resetThemeSettings());
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

app.patch("/api/admin/orders/:id/edit", requireAdmin, (req, res) => {
  const result = updateAdminOrder(req.params.id, req.body, "admin");
  if (result.error) {
    return res.status(result.error === "Order not found" ? 404 : 400).json({ message: result.error });
  }
  res.json(result.order);
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

app.post("/api/zalo/webhook", asyncHandler(async (req, res) => {
  const expectedSecret = process.env.ZALO_WEBHOOK_SECRET;
  const receivedSecret = String(req.query.secret || req.headers["x-zalo-webhook-secret"] || "");
  if (expectedSecret && expectedSecret !== receivedSecret) {
    return res.status(401).json({ message: "Invalid Zalo webhook secret" });
  }

  const text = extractZaloWebhookText(req.body);
  const sender = extractZaloSender(req.body);
  if (!text) return res.status(400).json({ message: "Missing Zalo message text" });

  const isAdmin = isZaloAdminSender(sender) || req.body.role === "admin" || req.body.isAdmin === true;
  const result = isAdmin
    ? await handleZaloAdminCommand(text, sender || "zalo-admin")
    : await handleZaloCustomerReply(text, sender || "zalo-customer");
  res.json({ ok: result.ok, sender, isAdmin, ...result });
}));

app.post("/api/zalo/admin-command", requireAdmin, asyncHandler(async (req, res) => {
  const text = String(req.body.commandText || req.body.text || "").trim();
  if (!text) return res.status(400).json({ message: "Missing commandText" });
  res.json(await handleZaloAdminCommand(text, "admincp-test"));
}));

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
    seoPages: getSeoPages(),
    dispatchLogs: getDispatchLogs(),
  });
});

app.patch("/api/orders/:id", requireAdmin, (req, res) => {
  const result = updateAdminOrder(req.params.id, req.body, "admin");
  if (result.error) {
    return res.status(result.error === "Order not found" ? 404 : 400).json({ message: result.error });
  }
  res.json(result.order);
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
  res.json(getSeoPages());
});

app.get("/api/admin/seo-pages", requireAdmin, (_req, res) => {
  res.json(getSeoPages());
});

app.put("/api/admin/seo-pages", requireAdmin, (req, res) => {
  res.json(updateSeoPages(req.body));
});

app.patch("/api/admin/seo-pages/:slug", requireAdmin, (req, res) => {
  const page = updateSeoPage(req.params.slug, req.body);
  if (!page) return res.status(404).json({ message: "SEO page not found" });
  res.json(page);
});

app.post("/api/admin/seo-pages/reset", requireAdmin, (_req, res) => {
  res.json(resetSeoPages());
});

async function setupApp() {
  await initializePersistentStore();
  await Promise.all([
    hydrateOrderStorage(),
    hydrateDispatchStorage(),
    hydrateNotificationStorage(),
    hydratePartnerStorage(),
    hydrateThemeStorage(),
    hydrateSeoStorage(),
  ]);

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    const indexHtmlPath = path.join(distPath, "index.html");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      const template = fs.readFileSync(indexHtmlPath, "utf8");
      res.type("html").send(renderSeoHtml(template, req.path));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Chuyen Phat 24H running on http://localhost:${PORT}`);
  });
}

setupApp();
