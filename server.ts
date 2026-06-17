import dotenv from "dotenv";
import express, { Request, Response } from "express";
import path from "node:path";
import { createServer as createViteServer } from "vite";
import { mapsService } from "./src/lib/maps/mapsService";
import { classifyQuickOrder, createQuickOrderFromHomeForm } from "./src/lib/orders/quickOrderService";
import { getOrders, updateOrder } from "./src/lib/orders/orderService";
import { getPublicTrackingInfo } from "./src/lib/tracking/trackingService";
import { addDispatchPreviewLog, getDispatchLogs, sendOrderToZaloGroups } from "./src/lib/dispatch/dispatchService";
import { parseDriverCommand } from "./src/lib/zalo/botCommandParser";
import { getZaloGroups } from "./src/lib/zalo/zaloGroupService";
import { getPartnerApplications, createPartnerApplication } from "./src/lib/partners/driverPartnerService";
import { mockRoutes } from "./src/data/mockRoutes";
import { mockPricingRules } from "./src/data/mockPricing";
import { mockPartners } from "./src/data/mockPartners";
import { seoPages } from "./src/lib/seo/seoPages";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 3000);

app.use(express.json({ limit: "2mb" }));

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

app.get("/api/orders", (_req, res) => {
  res.json(getOrders());
});

app.patch("/api/orders/:id", (req, res) => {
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

app.get("/api/orders/lookup", (req, res) => {
  const code = String(req.query.code || "").toLowerCase();
  const phone = String(req.query.phone || "");
  const orders = getOrders().filter((order) =>
    (!code || order.orderCode.toLowerCase().includes(code)) &&
    (!phone || order.senderPhone.includes(phone) || order.receiverPhone.includes(phone)),
  );
  res.json(orders);
});

app.post("/api/dispatch/preview", (req, res) => {
  const order = getOrders().find((item) => item.id === req.body.orderId || item.orderCode === req.body.orderCode);
  if (!order) return res.status(404).json({ message: "Order not found" });
  res.json(addDispatchPreviewLog(order));
});

app.post("/api/dispatch/send", (req, res) => {
  const order = getOrders().find((item) => item.id === req.body.orderId || item.orderCode === req.body.orderCode);
  if (!order) return res.status(404).json({ message: "Order not found" });
  const result = sendOrderToZaloGroups(order, "ADMIN");
  updateOrder(order.id, result.updates);
  res.json(result);
});

app.get("/api/dispatch/logs", (_req, res) => {
  res.json(getDispatchLogs());
});

app.post("/api/bot/parse", (req, res) => {
  res.json(parseDriverCommand(String(req.body.commandText || "")));
});

app.get("/api/zalo-groups", (_req, res) => {
  res.json(getZaloGroups());
});

app.get("/api/routes", (_req, res) => {
  res.json(mockRoutes);
});

app.get("/api/pricing-rules", (_req, res) => {
  res.json(mockPricingRules);
});

app.get("/api/partners", (_req, res) => {
  res.json(mockPartners);
});

app.get("/api/partner-applications", (_req, res) => {
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
