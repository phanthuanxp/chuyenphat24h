import express, { Request, Response } from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

// Load environment variables
dotenv.config();

// Standard models and mock storage imports
import { OrderStatus, Order, Route, Driver, Vehicle, PricingRule, ChatMessage } from "./src/types";
import { 
  MOCK_ORDERS, 
  MOCK_ROUTES, 
  MOCK_DRIVERS, 
  MOCK_VEHICLES, 
  MOCK_PRICING_RULES,
  PROVINCES_MAP 
} from "./src/constants";

const app = express();
const PORT = 3000;

app.use(express.json());

// In-Memory Database State
let dbOrders: Order[] = [...MOCK_ORDERS];
let dbRoutes: Route[] = [...MOCK_ROUTES];
const dbDrivers: Driver[] = [...MOCK_DRIVERS];
const dbVehicles: Vehicle[] = [...MOCK_VEHICLES];
const dbPricingRules: PricingRule[] = [...MOCK_PRICING_RULES];

// --- LAZY GEMINI API CLIENT ---
let aiInstance: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey !== "MY_GEMINI_API_KEY" && apiKey.trim() !== "") {
      aiInstance = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    }
  }
  return aiInstance;
}

// --- API ENDPOINTS ---

// 1. Health check
app.get("/api/health", (req: Request, res: Response) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// 2. Fetch all drivers, vehicles, pricing rules
app.get("/api/drivers", (req: Request, res: Response) => {
  res.json(dbDrivers);
});

app.get("/api/vehicles", (req: Request, res: Response) => {
  res.json(dbVehicles);
});

app.get("/api/pricing-rules", (req: Request, res: Response) => {
  res.json(dbPricingRules);
});

// 3. Get routes ("Tuyến xe đang chạy")
app.get("/api/routes", (req: Request, res: Response) => {
  res.json(dbRoutes);
});

// Update route status or capacity
app.patch("/api/routes/:id", (req: Request, res: Response) => {
  const { id } = req.params;
  const { routeStatus, capacityStatus, remainingOrderSlots } = req.body;
  
  const routeIndex = dbRoutes.findIndex(r => r.id === id);
  if (routeIndex === -1) {
    return res.status(404).json({ message: "Không tìm thấy tuyến đường này" });
  }

  const route = dbRoutes[routeIndex];
  if (routeStatus !== undefined) route.routeStatus = routeStatus;
  if (capacityStatus !== undefined) route.capacityStatus = capacityStatus;
  if (remainingOrderSlots !== undefined) route.remainingOrderSlots = remainingOrderSlots;

  dbRoutes[routeIndex] = route;
  res.json(route);
});

// 4. API Orders
app.get("/api/orders", (req: Request, res: Response) => {
  res.json(dbOrders);
});

// Create new order
app.post("/api/orders", (req: Request, res: Response) => {
  const newOrderData = req.body;
  
  // Validation checks
  if (!newOrderData.senderName || !newOrderData.senderPhone || !newOrderData.receiverName || !newOrderData.receiverPhone) {
    return res.status(400).json({ message: "Thiếu thông tin người gửi hoặc người nhận" });
  }

  // Generate unique order code (CP24H-YYYYMMDD-XXXX)
  const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const seq = Math.floor(1000 + Math.random() * 9000); // 4-digit sequence
  const orderCode = `CP24H-${todayStr}-${seq}`;

  const defaultStatus = newOrderData.isManualQuoteRequired ? OrderStatus.PENDING_CONFIRMATION : OrderStatus.NEW;

  const newOrder: Order = {
    id: `ORD-${Date.now()}`,
    orderCode,
    senderName: newOrderData.senderName,
    senderPhone: newOrderData.senderPhone,
    pickupAddress: newOrderData.pickupAddress || "",
    pickupDistrict: newOrderData.pickupDistrict || "",
    pickupProvince: newOrderData.pickupProvince || "Hà Nội",
    receiverName: newOrderData.receiverName,
    receiverPhone: newOrderData.receiverPhone,
    deliveryAddress: newOrderData.deliveryAddress || "",
    deliveryDistrict: newOrderData.deliveryDistrict || "",
    deliveryProvince: newOrderData.deliveryProvince,
    direction: newOrderData.direction || "Hà Nội đi Tỉnh",
    routeName: `${newOrderData.pickupProvince} ↔ ${newOrderData.deliveryProvince}`,
    itemType: newOrderData.itemType || "Bưu phẩm nhỏ",
    itemDescription: newOrderData.itemDescription || "",
    weight: Number(newOrderData.weight) || 1,
    dimensions: newOrderData.dimensions || "",
    declaredValue: Number(newOrderData.declaredValue) || 0,
    serviceType: newOrderData.serviceType || "Trong ngày",
    expectedPickupTime: newOrderData.expectedPickupTime || "Càng sớm càng tốt",
    expectedDeliveryTime: newOrderData.expectedDeliveryTime || "Trong ngày",
    quotedPrice: newOrderData.quotedPrice,
    finalPrice: newOrderData.finalPrice || newOrderData.quotedPrice,
    status: defaultStatus,
    paymentStatus: newOrderData.paymentStatus || "Chưa thanh toán",
    internalNotes: newOrderData.internalNotes || "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  dbOrders.unshift(newOrder);

  // If assigned to a schedule route directly, reduce slots
  if (newOrderData.assignedRouteId) {
    const routeIndex = dbRoutes.findIndex(r => r.id === newOrderData.assignedRouteId);
    if (routeIndex !== -1 && dbRoutes[routeIndex].remainingOrderSlots > 0) {
      dbRoutes[routeIndex].remainingOrderSlots -= 1;
      if (dbRoutes[routeIndex].remainingOrderSlots === 0) {
        dbRoutes[routeIndex].capacityStatus = "Đã đầy";
      } else if (dbRoutes[routeIndex].remainingOrderSlots <= 2) {
        dbRoutes[routeIndex].capacityStatus = "Sắp đầy";
      }
    }
  }

  res.status(201).json(newOrder);
});

// Update order status/payment
app.patch("/api/orders/:id", (req: Request, res: Response) => {
  const { id } = req.params;
  const updates = req.body;

  const orderIndex = dbOrders.findIndex(o => o.id === id);
  if (orderIndex === -1) {
    return res.status(404).json({ message: "Không tìm thấy đơn hàng này" });
  }

  const order = dbOrders[orderIndex];
  
  if (updates.status !== undefined) order.status = updates.status as OrderStatus;
  if (updates.paymentStatus !== undefined) order.paymentStatus = updates.paymentStatus;
  if (updates.assignedDriverId !== undefined) order.assignedDriverId = updates.assignedDriverId;
  if (updates.assignedVehicleId !== undefined) order.assignedVehicleId = updates.assignedVehicleId;
  if (updates.assignedRouteId !== undefined) order.assignedRouteId = updates.assignedRouteId;
  if (updates.finalPrice !== undefined) order.finalPrice = Number(updates.finalPrice);
  if (updates.quotedPrice !== undefined) order.quotedPrice = Number(updates.quotedPrice);
  if (updates.internalNotes !== undefined) order.internalNotes = updates.internalNotes;
  
  order.updatedAt = new Date().toISOString();
  dbOrders[orderIndex] = order;

  res.json(order);
});

// Search order by code or phone
app.get("/api/orders/lookup", (req: Request, res: Response) => {
  const code = req.query.code as string;
  const phone = req.query.phone as string;

  if (!code && !phone) {
    return res.status(400).json({ message: "Vui lòng nhập mã đơn hoặc số điện thoại để tra cứu." });
  }

  let result = dbOrders;
  if (code) {
    result = result.filter(o => o.orderCode.toLowerCase().includes(code.toLowerCase()));
  }
  if (phone) {
    result = result.filter(o => o.senderPhone.includes(phone) || o.receiverPhone.includes(phone));
  }

  res.json(result);
});

// 5. Calculate Price Estimate Formula
app.post("/api/pricing/estimate", (req: Request, res: Response) => {
  const { pickupProvince, deliveryProvince, itemType, serviceType, weight, declaredValue, hasHelpers, isNightTime } = req.body;

  if (!pickupProvince || !deliveryProvince) {
    return res.status(400).json({ message: "Thiếu điểm đi hoặc điểm đến" });
  }

  // Heavy cồng kềnh, xe máy, quá khổ items require manual quote as requested
  const manualQuoteTriggerWords = ["xe máy", "tivi", "tủ lạnh", "máy giặt", "hàng cồng kềnh", "máy công nghiệp", "hàng quá khổ", "dễ vỡ giá trị cao"];
  const currItemTypeLower = (itemType || "").toLowerCase();
  const requiresManualQuote = manualQuoteTriggerWords.some(word => currItemTypeLower.includes(word)) || weight > 150;

  if (requiresManualQuote) {
    return res.json({
      isManualQuoteRequired: true,
      message: "Sản phẩm cồng kềnh hoặc quá khổ cần nhân viên gọi điện kiểm tra kích thước thực tế và báo giá trực tiếp."
    });
  }

  // Simple pricing formula based on travel distance classification
  // Identify origin and destination
  const departure = pickupProvince === "Hà Nội" ? pickupProvince : deliveryProvince;
  const destination = pickupProvince === "Hà Nội" ? deliveryProvince : pickupProvince;

  // Search if a custom pricing rule exists
  const rule = dbPricingRules.find(r => r.destinationProvince === destination || r.originProvince === departure);

  let basePrice = 120000;
  let chargePerKg = 10000;
  let bulkySurcharge = 0;

  if (rule) {
    basePrice = rule.basePrice;
    chargePerKg = rule.pricePerKg;
  } else {
    // Dynamic fallback based on city classifications
    const ultraFastGroup = ["Bắc Ninh", "Hưng Yên", "Vĩnh Phúc", "Hà Nam", "Hải Dương", "Thái Nguyên", "Bắc Giang", "Hòa Bình"];
    const midDayGroup = ["Hải Phòng", "Quảng Ninh", "Ninh Bình", "Nam Định", "Thái Bình", "Phú Thọ", "Tuyên Quang", "Lạng Sơn"];
    const northWestGroup = ["Yên Bái", "Lào Cai", "Sơn La", "Lai Châu"];
    const centralGroup = ["Thanh Hóa", "Nghệ An"];

    if (ultraFastGroup.includes(destination)) {
      basePrice = 150000;
      chargePerKg = 8000;
    } else if (midDayGroup.includes(destination)) {
      basePrice = 190000;
      chargePerKg = 12000;
    } else if (northWestGroup.includes(destination)) {
      basePrice = 250000;
      chargePerKg = 15000;
    } else if (centralGroup.includes(destination)) {
      basePrice = 220000;
      chargePerKg = 12000;
    }
  }

  // Weight additional calculations (First kg is included in basePrice)
  const taxableWeight = Math.max(0, weight - 1);
  const weightPrice = taxableWeight * chargePerKg;

  let finalQuoted = basePrice + weightPrice;

  // Service multipliers
  if (serviceType === "Hỏa tốc 2-4h") {
    finalQuoted = finalQuoted * 1.5;
  } else if (serviceType === "Xe riêng") {
    finalQuoted = Math.max(1200000, finalQuoted * 8); // Minimum 1.2M for private car charter
  }

  // Helper surcharges
  if (hasHelpers) finalQuoted += 50000;
  if (isNightTime) finalQuoted += 35000;

  // Fragile electronics care
  if (currItemTypeLower.includes("dễ vỡ") || currItemTypeLower.includes("điện tử")) {
    finalQuoted += 40000;
  }

  // Declared insurance value surcharge: 0.5%
  if (declaredValue && declaredValue > 0) {
    finalQuoted += Math.round(declaredValue * 0.005);
  }

  // Minimum pricing protection
  finalQuoted = Math.max(basePrice, Math.round(finalQuoted));

  res.json({
    isManualQuoteRequired: false,
    basePrice,
    weightPrice,
    surcharges: {
      hasHelpers: hasHelpers ? 50000 : 0,
      isNightTime: isNightTime ? 35000 : 0,
      insurance: declaredValue ? Math.round(declaredValue * 0.005) : 0,
    },
    finalPrice: finalQuoted,
    estimatedDuration: rule ? "2–4 giờ" : "Trong ngày hoặc trong 24h"
  });
});

// 6. AI Consultant chatbot with structured assistance
app.post("/api/ai/consult", async (req: Request, res: Response) => {
  const { messages } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ message: "Định dạng tin nhắn không hợp lệ" });
  }

  const client = getGeminiClient();

  // If no Gemini API Key of valid structure is injected, give a highly realistic pre-programmed expert logistics response!
  if (!client) {
    const userMessage = messages[messages.length - 1].text.toLowerCase();
    let reply = "Xin chào! Tôi là Chuyên viên điều vận ảo của Chuyển Phát 24h. Rất vui được hỗ trợ quý khách. 🚚💨\n\nChúng tôi chuyên vận chuyển hỏa tốc liên tỉnh hai chiều xuất phát từ Hà Nội đi Bắc Ninh, Hải Phòng, Ninh Bình, Quảng Ninh, Thanh Hóa, Nghệ An, Lào Cai... với đặc trưng: Hàng đi ngay theo hệ thống xe chở khách chạy liên tục trực tiếp, không chờ gom kho.\n\n";

    if (userMessage.includes("báo giá") || userMessage.includes("giá") || userMessage.includes("bao nhiêu tiền")) {
      reply += "Dưới đây là biểu phí ước tính tối ưu:\n" +
        "• Thư từ, Giấy tờ thầu, hồ sơ hỏa tốc: Khoảng từ 120.000đ - 180.000đ (Tốc độ giao nhanh 2-4 tiếng tận tay).\n" +
        "• Bưu phẩm nhỏ nhẹ gọn: Khoảng 150.000đ (Tuyến siêu tốc gần như Bắc Ninh, Hưng Yên) hoặc quanh 190.000đ (như Hải Phòng, Nam Định).\n" +
        "• Xe máy đi tỉnh hỏa tốc: Từ 850.000đ (Được chằng buộc chuyên nghiệp bằng xe tải nhỏ, bọc gói mút chống xước sát).\n\n" +
        "Anh/Chị có thể bấm vào tab **TẠO ĐƠN GỬI HÀNG** ở trên để nhập chi tiết địa chỉ nhận/giao và nhận báo giá chính xác tự động ngay lập tức đấy ạ!";
    } else if (userMessage.includes("điện biên") || userMessage.includes("điện biên phủ")) {
      reply += "⚠️ Lưu ý quan trọng: Công ty chúng tôi hiện **Chưa phục vụ** các tuyến đi/về **Điện Biên** và **Điện Biên Phủ** trong giai đoạn này để giữ vững cam kết về tốc độ hỏa tốc. Rất mong anh chị thông cảm. Tuyến Tây Bắc xa nhất mà chúng tôi đang phục vụ là Lào Cai, Lai Châu và Sơn La (theo lịch trình xe chạy thực tế hằng ngày).";
    } else if (userMessage.includes("tuyến") || userMessage.includes("đâu") || userMessage.includes("phục vụ")) {
      reply += "Hiện Chuyển Phát 24h kết nối 2 chiều siêu nhanh Hà Nội với các khu vực:\n\n" +
        "1️⃣ **Các tuyến siêu tốc (Giao từ 2–4 tiếng):** Bắc Ninh, Hưng Yên, Vĩnh Phúc, Hà Nam, Hải Dương, Thái Nguyên, Bắc Giang, Hòa Bình.\n" +
        "2️⃣ **Các tuyến giao trong ngày (4-8 tiếng):** Hải Phòng, Quảng Ninh (Vân Đồn, Móng Cái), Ninh Bình, Nam Định, Thái Bình, Phú Thọ, Tuyên Quang, Lạng Sơn.\n" +
        "3️⃣ **Các tuyến Tây Bắc (Trong 24h):** Yên Bái, Lào Cai (Sapa), Sơn La (Mộc Châu), Lai Châu.\n" +
        "4️⃣ **Các tuyến Nam Trung Bộ:** Thanh Hóa, Nghệ An (Vinh, Cửa Lò) - Đây là hai tuyến miền Trung xa nhất mà chúng tôi đang chạy dọc QL1A.\n\n" +
        "Quý khách cần gửi hàng theo tuyến xe nào đang trực tiếp lăn bánh ạ?";
    } else {
      reply += "Để tư vấn nhanh nhất phương án tối ưu, Anh/Chị vui lòng chia sẻ giúp:\n" +
        "1. Điểm gửi (Ví dụ Hà Nội) đi tỉnh nào?\n" +
        "2. Loại mặt hàng cần gửi (Giấy tờ, quần áo shop, xe máy, đồ điện tử...)?\n" +
        "3. Số điện thoại nhận hỗ trợ nhanh nhất?\n\n" +
        "Tôi sẽ tính toán gợi ý tuyến xe đang chạy trống khoang gần nhất ứng với giờ anh chị yêu cầu!";
    }

    // Delay simulation to make response feel real
    await new Promise((resolve) => setTimeout(resolve, 800));
    return res.json({ text: reply });
  }

  try {
    // Compile history
    const contextHistory = messages.map((m: any) => ({
      role: m.sender === "user" ? "user" : "model",
      parts: [{ text: m.text }]
    }));

    // Add setup dynamic system instructions
    const systemPrompt = `Bạn là Chuyên gia tư vấn logistics cao cấp kiêm Trợ lý ảo của thương hiệu "CHUYỂN PHÁT 24H" (website: chuyenphat24h.vn, hotline/Zalo: 0345 07 6789).
Dịch vụ của chúng tôi là "Chuyển phát liên tỉnh hỏa tốc — nhận tận nơi, giao tận tay trong 2–4 giờ" xuất phát từ Hà Nội đi các tỉnh hoặc ngược lại (2 chiều).
ĐIỂM ĐẶC BIỆT LỚN NHẤT: "Không chờ gom kho — hàng đi theo tuyến xe đang chạy". Chúng tôi tận dụng hệ thống xe dịch vụ, xe hợp đồng, xe riêng limousine chạy liên tục để gửi ghép hàng nhanh nhất.

QUY TẮC PHẠM VI DỊCH VỤ BẮT BUỘC:
- Hà Nội đi các tỉnh Miền Bắc, Thanh Hóa, Nghệ An (2 chiều).
- KHÔNG phục vụ tuyến Hà Nội ↔ Điện Biên hoặc Điện Biên Phủ. (Nếu khách hỏi, từ chối lịch sự và tư vấn rằng tuyến Tây Bắc xa nhất là Lào Cai, Sơn La, Lai Châu).
- Tuyến phía Nam/Bắc Trung Bộ xa nhất phục vụ là Nghệ An (TP Vinh, Diễn Châu, Cửa Lò...).
- Tuyến SIÊU TỐC GẦN (2-4 giờ): Bắc Ninh, Hưng Yên, Vĩnh Phúc, Hà Nam, Hải Dương, Thái Nguyên, Bắc Giang, Hòa Bình.
- Tuyến TRONG NGÀY (4-8 giờ): Hải Phòng, Quảng Ninh (Hạ Long, Cẩm Phả..), Ninh Bình, Nam Định, Thái Bình, Phú Thọ, Tuyên Quang, Lạng Sơn.
- Tuyến Tây Bắc (Trong vòng 24h & cần xác nhận lịch xe trước): Yên Bái, Lào Cai (Sapa), Sơn La, Lai Châu.

QUY TẮC BÁO GIÁ:
- Hồ sơ giấy tờ hỏa tốc: Từ 120k đến 180k.
- Hàng nhỏ nhẹ gọn: 100k - 190k.
- Hàng cồng kềnh, xe máy, tivi, tủ lạnh, hàng quá khổ: "Cần nhân viên hỗ trợ gọi điện báo giá riêng dựa trên kích cỡ cân nặng thực tế".

Hãy phản hồi lịch sự, ngắn gọn, giàu nhiệt huyết, chuẩn tiếng Việt bưu vận. Nhắc nhở người dùng có thể sắm ngay gói dịch vụ bằng nút "Tạo đơn gửi hàng" ở menu trên cùng để đội xe gọi rước hàng ngay lập tức! `;

    const chatResponse = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [
        { role: "user", parts: [{ text: systemPrompt }] },
         ...contextHistory
      ],
      config: {
        temperature: 0.7,
      }
    });

    res.json({ text: chatResponse.text });
  } catch (error: any) {
    console.error("Gemini API Error in consult:", error);
    res.status(500).json({ message: "Có vấn đề phát sinh lúc kết nối AI. Vui lòng chat lại.", error: error.message });
  }
});

// 7. AI Smart dispatching and pricing for Admin Dashboard
app.post("/api/ai/admin-suggest", async (req: Request, res: Response) => {
  const { orderId } = req.body;
  const order = dbOrders.find(o => o.id === orderId);

  if (!order) {
    return res.status(404).json({ message: "Không tìm thấy đơn hàng cần phân tích" });
  }

  // Smart Matching logic
  // Look for route that has same origin and destination province or travel direction
  // Look for driver that runs the destination
  const matches = dbRoutes.filter(r => 
    r.destinationProvince === order.deliveryProvince && 
    r.routeStatus === "Đang nhận hàng" &&
    r.remainingOrderSlots > 0
  );

  let suggestedRoute = matches[0] || null;
  let clientMessage = "";

  if (suggestedRoute) {
    clientMessage = `Kính gửi anh/chị ${order.senderName}, đơn hàng hỏa tốc ${order.orderCode} (chuyển đi ${order.deliveryProvince}) đã được Chuyển Phát 24H xếp chuyến hành trình tốc hành lúc ${suggestedRoute.departureTime}. Đội ngũ tài xế xe sẽ liên hệ lấy hàng trong vòng 15-30 phút tới. Hotline hỗ trợ 24/7: 0345076789.`;
  } else {
    // Generate private/charter warning message
    clientMessage = `Chuyển Phát 24H kính chào anh/chị ${order.senderName}. Đơn hàng ${order.orderCode} đi tuyến xa ${order.deliveryProvince} dạng ${order.serviceType} đang được nhân viên phối hợp điều động xe hỏa tốc hoặc ghép với lái xe limousine chuyên tỉnh sớm nhất. Hotline phản hồi: 0345076789.`;
  }

  res.json({
    orderStatus: order.status,
    routeMatches: matches,
    suggestedRoute,
    suggestedPrice: order.quotedPrice || 150000,
    generatedSmsTemplate: clientMessage,
    confidenceIndex: suggestedRoute ? "Cao (Có tuyến xe thật chạy ghép ngay)" : "Trung bình (Cần nhân viên liên hệ xe riêng/hợp đồng)"
  });
});

// --- Telegram Webhook Placeholder ---
app.post("/api/telegram/webhook", (req: Request, res: Response) => {
  const { message } = req.body;
  console.log(`[Telegram Broadcast Bot Simulate]: Sending telegram dispatch payload -> ${JSON.stringify(message)}`);
  res.json({ success: true, logged: true });
});

// Production and Development build serving configurations
let appSetup = async () => {
  if (process.env.NODE_ENV !== "production") {
    // Mounting Vite middleware
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server Chuyển Phát 24h operational on http://localhost:${PORT}`);
  });
};

appSetup();
