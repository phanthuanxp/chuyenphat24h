import React, { useState, useEffect } from "react";
import { 
  User, MapPin, Package, Settings, ClipboardCheck, CheckCircle2, 
  ArrowLeft, ArrowRight, ShieldCheck, DollarSign, Image as ImageIcon, Sparkles 
} from "lucide-react";
import { PROVINCES_MAP } from "../constants";

interface BookingFormProps {
  initialData: any;
  setView: (view: string) => void;
  onOrderCreated?: (newOrder: any) => void;
}

export default function BookingForm({ initialData, setView, onOrderCreated }: BookingFormProps) {
  const [step, setStep] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [priceResult, setPriceResult] = useState<any>(null);

  // Form states
  // Step 1: Sender
  const [senderName, setSenderName] = useState<string>("Lê Minh Tuấn");
  const [senderPhone, setSenderPhone] = useState<string>("0912345678");
  const [pickupAddress, setPickupAddress] = useState<string>("12 Chùa Bộc");
  const [pickupDistrict, setPickupDistrict] = useState<string>("Đống Đa");
  const [pickupProvince, setPickupProvince] = useState<string>("Hà Nội");

  // Step 2: Receiver
  const [receiverName, setReceiverName] = useState<string>("Phạm Hùng Sơn");
  const [receiverPhone, setReceiverPhone] = useState<string>("0905111222");
  const [deliveryAddress, setDeliveryAddress] = useState<string>("124 Lạch Tray");
  const [deliveryProvince, setDeliveryProvince] = useState<string>("Hải Phòng");
  const [deliveryDistrict, setDeliveryDistrict] = useState<string>("Quận Ngô Quyền");
  const [handOverDirect, setHandOverDirect] = useState<boolean>(true);

  // Step 3: Goods
  const [itemType, setItemType] = useState<string>("Giấy tờ/chứng từ");
  const [itemDescription, setItemDescription] = useState<string>("Bì thư hỏa tốc hồ sơ công trình Hải Phòng ");
  const [weight, setWeight] = useState<number>(1);
  const [dimensions, setDimensions] = useState<string>("20x30x5 cm");
  const [declaredValue, setDeclaredValue] = useState<number>(5000000);
  const [packageCount, setPackageCount] = useState<number>(1);

  // Step 4: Service options
  const [serviceType, setServiceType] = useState<"Hỏa tốc 2-4h" | "Trong ngày" | "Gửi 24h" | "Xe riêng">("Hỏa tốc 2-4h");
  const [hasHelpers, setHasHelpers] = useState<boolean>(false);
  const [isNightTime, setIsNightTime] = useState<boolean>(false);
  const [hasInsurance, setHasInsurance] = useState<boolean>(true);
  const [photoConfirm, setPhotoConfirm] = useState<boolean>(true);
  const [codAmount, setCodAmount] = useState<number>(0);

  // Result state
  const [createdOrder, setCreatedOrder] = useState<any>(null);

  // Pre-fill fields if they come from Hero quick estimator or RoutesSlider
  useEffect(() => {
    if (initialData) {
      if (initialData.direction === "Tỉnh về Hà Nội") {
        setPickupProvince(initialData.province || "Bắc Ninh");
        setPickupDistrict(PROVINCES_MAP[initialData.province || "Bắc Ninh"]?.[0] || "");
        setDeliveryProvince("Hà Nội");
        setDeliveryDistrict("Cầu Giấy");
      } else {
        setPickupProvince("Hà Nội");
        setPickupDistrict("Đống Đa");
        setDeliveryProvince(initialData.province || "Bắc Ninh");
        setDeliveryDistrict(PROVINCES_MAP[initialData.province || "Bắc Ninh"]?.[0] || "");
      }

      if (initialData.itemType) setItemType(initialData.itemType);
      if (initialData.weight) setWeight(Number(initialData.weight));
      if (initialData.declaredValue) setDeclaredValue(Number(initialData.declaredValue));
      if (initialData.serviceType) setServiceType(initialData.serviceType);
    }
  }, [initialData]);

  // Handle nested districts selection dynamically when province changes
  useEffect(() => {
    const districts = PROVINCES_MAP[pickupProvince] || [];
    if (!districts.includes(pickupDistrict)) {
      setPickupDistrict(districts[0] || "");
    }
  }, [pickupProvince]);

  useEffect(() => {
    const districts = PROVINCES_MAP[deliveryProvince] || [];
    if (!districts.includes(deliveryDistrict)) {
      setDeliveryDistrict(districts[0] || "");
    }
  }, [deliveryProvince]);

  // Recalculate price when reaching step 5 (Báo giá)
  useEffect(() => {
    if (step === 5) {
      calculateQuotedPrice();
    }
  }, [step]);

  const calculateQuotedPrice = async () => {
    setLoading(true);
    try {
      const payload = {
        pickupProvince,
        deliveryProvince,
        itemType,
        serviceType,
        weight,
        declaredValue,
        hasHelpers,
        isNightTime
      };

      const res = await fetch("/api/pricing/estimate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      setPriceResult(data);
    } catch (err) {
      console.error("Recalculate pricing fail:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrder = async () => {
    setLoading(true);
    try {
      const payload = {
        senderName,
        senderPhone,
        pickupAddress,
        pickupDistrict,
        pickupProvince,
        receiverName,
        receiverPhone,
        deliveryAddress,
        deliveryDistrict,
        deliveryProvince,
        direction: pickupProvince === "Hà Nội" ? "Hà Nội đi Tỉnh" : "Tỉnh về Hà Nội",
        itemType,
        itemDescription,
        weight,
        dimensions,
        declaredValue,
        serviceType,
        quotedPrice: priceResult?.finalPrice || 150000,
        paymentStatus: codAmount > 0 ? "Thu hộ COD" : "Chưa thanh toán",
        isManualQuoteRequired: priceResult?.isManualQuoteRequired || false,
        assignedRouteId: initialData?.assignedRouteId || undefined
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) {
        throw new Error("Không thể khởi tạo đơn hàng bưu chính");
      }

      const data = await res.json();
      setCreatedOrder(data);
      if (onOrderCreated) {
        onOrderCreated(data);
      }
      setStep(6);
    } catch (err) {
      console.error("Failed creating order list:", err);
      alert("⚠️ Đã có sự cố xảy ra lúc liên lạc bộ phận đặt đơn. Quý khách vui lòng gọi Hotline 0345076789.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 text-slate-100">
      
      {/* Visual Step Tracker Indicator */}
      <div className="flex justify-between items-center mb-8 bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-md overflow-x-auto">
        {[
          { label: "Người gửi", icon: User },
          { label: "Người nhận", icon: MapPin },
          { label: "Hàng hóa", icon: Package },
          { label: "Tùy chọn", icon: Settings },
          { label: "Báo giá", icon: ClipboardCheck },
          { label: "Hoàn tất", icon: CheckCircle2 }
        ].map((s, idx) => {
          const sNum = idx + 1;
          const Icon = s.icon;
          return (
            <div key={idx} className="flex items-center space-x-1.5 flex-shrink-0 mx-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                step === sNum 
                  ? "bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 scale-110" 
                  : step > sNum 
                    ? "bg-green-500 text-slate-950" 
                    : "bg-slate-800 text-slate-500"
              }`}>
                <Icon className="w-4 h-4" />
              </div>
              <span className={`text-xs font-bold ${step === sNum ? "text-orange-400" : "text-slate-400"}`}>{s.label}</span>
              {idx < 5 && <span className="text-slate-700 font-light">&rarr;</span>}
            </div>
          );
        })}
      </div>

      {/* Main card body and steps controller */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8">
        
        {/* STEP 1: Sender info */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold flex items-center space-x-2 text-slate-100">
                <User className="w-5 h-5 text-orange-500" />
                <span>Bước 1: Thông tin điểm lấy hàng (Người gửi)</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">Chúng tôi sẽ cử lái xe đến địa chỉ này lấy hàng tận tay của bạn</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Họ tên người gửi *</label>
                <input
                  type="text"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 focus:ring-1 focus:ring-orange-500 rounded-lg py-2 px-3 text-slate-100 text-sm focus:outline-none"
                  placeholder="Ví dụ: Lê Minh Tuấn"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Số điện thoại liên hệ *</label>
                <input
                  type="text"
                  value={senderPhone}
                  onChange={(e) => setSenderPhone(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 focus:ring-1 focus:ring-orange-500 rounded-lg py-2 px-3 text-slate-100 text-sm focus:outline-none"
                  placeholder="Ví dụ: 0912345678"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Tỉnh / Thành phố lấy hàng *</label>
                <select
                  value={pickupProvince}
                  onChange={(e) => setPickupProvince(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 focus:ring-1 focus:ring-orange-500 rounded-lg py-2 px-3 text-slate-100 text-sm focus:outline-none text-slate-200"
                >
                  {Object.keys(PROVINCES_MAP).map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Quận / Huyện lấy hàng *</label>
                <select
                  value={pickupDistrict}
                  onChange={(e) => setPickupDistrict(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 focus:ring-1 focus:ring-orange-500 rounded-lg py-2 px-3 text-slate-100 text-sm focus:outline-none text-slate-200"
                >
                  {(PROVINCES_MAP[pickupProvince] || []).map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Địa chỉ chi tiết lấy hàng *</label>
              <input
                type="text"
                value={pickupAddress}
                onChange={(e) => setPickupAddress(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 focus:ring-1 focus:ring-orange-500 rounded-lg py-2 px-3 text-slate-100 text-sm focus:outline-none"
                placeholder="Số nhà, ngách, ngõ, tên phố (Ví dụ: 12 Chùa Bộc)"
              />
            </div>
          </div>
        )}

        {/* STEP 2: Receiver info */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold flex items-center space-x-2 text-slate-100">
                <MapPin className="w-5 h-5 text-orange-500" />
                <span>Bước 2: Thông tin địa chỉ đích nhận (Người nhận)</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">Lịch trình xe sẽ chuyển thẳng tới địa chỉ này để giao hàng</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Họ tên người nhận *</label>
                <input
                  type="text"
                  value={receiverName}
                  onChange={(e) => setReceiverName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 focus:ring-1 focus:ring-orange-500 rounded-lg py-2 px-3 text-slate-100 text-sm focus:outline-none"
                  placeholder="Họ tên người nhận"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Số điện thoại người nhận *</label>
                <input
                  type="text"
                  value={receiverPhone}
                  onChange={(e) => setReceiverPhone(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 focus:ring-1 focus:ring-orange-500 rounded-lg py-2 px-3 text-slate-100 text-sm focus:outline-none"
                  placeholder="Số điện thoại nhận hàng"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Tỉnh / Thành phố nhận *</label>
                <select
                  value={deliveryProvince}
                  onChange={(e) => setDeliveryProvince(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 focus:ring-1 focus:ring-orange-500 rounded-lg py-2 px-3 text-slate-100 text-sm focus:outline-none text-slate-200"
                >
                  {Object.keys(PROVINCES_MAP).filter((p) => p !== pickupProvince || p === "Hà Nội").map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Quận / Huyện nhận *</label>
                <select
                  value={deliveryDistrict}
                  onChange={(e) => setDeliveryDistrict(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 focus:ring-1 focus:ring-orange-500 rounded-lg py-2 px-3 text-slate-100 text-sm focus:outline-none text-slate-200"
                >
                  {(PROVINCES_MAP[deliveryProvince] || []).map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Địa chỉ chi tiết nhận hàng *</label>
              <input
                type="text"
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 focus:ring-1 focus:ring-orange-500 rounded-lg py-2 px-3 text-slate-100 text-sm focus:outline-none"
                placeholder="Số nhà, tên tòa văn phòng, showroom nhận..."
              />
            </div>

            <div className="flex items-center space-x-3 bg-slate-900/60 p-3.5 rounded-lg border border-slate-800">
              <input 
                type="checkbox" 
                id="handOver"
                checked={handOverDirect}
                onChange={(e) => setHandOverDirect(e.target.checked)}
                className="w-4.5 h-4.5 accent-orange-500 rounded"
              />
              <label htmlFor="handOver" className="text-xs sm:text-sm text-slate-300 font-semibold cursor-pointer">
                Yêu cầu giao hỏa tốc tận tay người nhận (Thích hợp cho bưu kiện tuyệt mật, hợp đồng thầu ký ngay)
              </label>
            </div>
          </div>
        )}

        {/* STEP 3: Goods info */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold flex items-center space-x-2 text-slate-100">
                <Package className="w-5 h-5 text-orange-500" />
                <span>Bước 3: Chi tiết bưu gửi (Hàng hóa & Kích cỡ)</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">Cung cấp đúng kích cỡ trọng lượng giúp khớp tuyến xe bốc dỡ phù hợp</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Phân hệ dịch vụ hàng hoá *</label>
                <select
                  value={itemType}
                  onChange={(e) => setItemType(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 focus:ring-1 focus:ring-orange-500 rounded-lg py-2 px-3 text-slate-100 text-sm focus:outline-none text-slate-200"
                >
                  <option value="Giấy tờ/chứng từ">Giấy tờ, Hợp đồng văn kiện</option>
                  <option value="Bưu phẩm nhỏ">Bưu gửi nhỏ (Dưới 5kg)</option>
                  <option value="Hàng shop">Hàng shop, thời trang online</option>
                  <option value="Hàng điện tử">Hàng công nghệ (Laptop, điện thoại)</option>
                  <option value="Hàng dễ vỡ">Hàng dễ vỡ có đóng thùng gỗ</option>
                  <option value="Xe máy">Xe máy / Xe điện liên tỉnh</option>
                  <option value="Hàng cồng kềnh">Điện tử lớn (Tivi, Tủ lạnh, Máy giặt)</option>
                  <option value="Hàng quá khổ cần báo giá riêng">Hàng hỏa tải nặng / Bao tải lớn</option>
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Số kiện hàng *</label>
                  <input
                    type="number"
                    min="1"
                    value={packageCount}
                    onChange={(e) => setPackageCount(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 focus:ring-1 focus:ring-orange-500 rounded-lg py-2 px-3 text-slate-100 text-sm focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Cân nặng (kg)</label>
                  <input
                    type="number"
                    min="1"
                    value={weight}
                    onChange={(e) => setWeight(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 focus:ring-1 focus:ring-orange-500 rounded-lg py-2 px-3 text-slate-100 text-sm focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Kích thước DxRxC (cm)</label>
                <input
                  type="text"
                  value={dimensions}
                  onChange={(e) => setDimensions(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 focus:ring-1 focus:ring-orange-500 rounded-lg py-2 px-3 text-slate-100 text-sm focus:outline-none"
                  placeholder="Ví dụ: 30x40x20 cm (Không bắt buộc)"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Giá trị hàng hóa khai báo (VNĐ)</label>
                <input
                  type="number"
                  min="0"
                  value={declaredValue || ""}
                  onChange={(e) => setDeclaredValue(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-800 focus:ring-1 focus:ring-orange-500 rounded-lg py-2 px-3 text-slate-100 text-sm focus:outline-none"
                  placeholder="Dùng để đăng ký bảo hiểm hàng"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Mô tả chi tiết và ghi chú đóng gói</label>
              <textarea
                value={itemDescription}
                onChange={(e) => setItemDescription(e.target.value)}
                rows={3}
                className="w-full bg-slate-900 border border-slate-800 focus:ring-1 focus:ring-orange-500 rounded-lg py-2 px-3 text-slate-100 text-sm focus:outline-none"
                placeholder="Nêu rõ hàng hóa bên trong (Ví dụ: 1 thùng cát tông chứa đồ linh kiện có bao bọc bọt xốp bong bóng)"
              ></textarea>
            </div>
          </div>
        )}

        {/* STEP 4: Service setup */}
        {step === 4 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold flex items-center space-x-2 text-slate-100">
                <Settings className="w-5 h-5 text-orange-500" />
                <span>Bước 4: Chọn phương án di chuyển (Dịch vụ vận chuyển)</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">Lựa chọn giải pháp thời gian khớp xe thích hợp với nhu cầu gửi</p>
            </div>

            {/* Service packages selection blocks */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { type: "Hỏa tốc 2-4h", desc: "Xếp thẳng hàng lên chuyến xe limousine đang rời bến sớm nhất. Ưu tiên giao lập tức bưu phẩm nhỏ và thư từ gấp." },
                { type: "Trong ngày", desc: "Chạy ghép gom theo các khung giờ cố định trong ngày (Giao từ 4 - 8 tiếng). Toàn diện chi phí rẻ." },
                { type: "Gửi 24h", desc: "Tối ưu hóa hành trình, giao nhận trong vòng 24 giờ. Thích hợp hàng nặng hoặc cồng kềnh gom chuyến đêm." },
                { type: "Xe riêng", desc: "Bao trọn xe bán tải, xe tải nhỏ lấy tận phòng chạy thẳng đi tỉnh giao lập tức (Giao trong 2-3 tiếng thô)." }
              ].map((serv) => (
                <div 
                  key={serv.type}
                  onClick={() => setServiceType(serv.type as any)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    serviceType === serv.type 
                      ? "bg-orange-500/10 border-orange-500/80 shadow shadow-orange-500/25" 
                      : "bg-slate-900 border-slate-800/80 hover:border-slate-700/80"
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-extrabold text-sm sm:text-base text-slate-200">{serv.type}</span>
                    <input 
                      type="radio" 
                      name="servType" 
                      checked={serviceType === serv.type} 
                      onChange={() => {}}
                      className="accent-orange-500"
                    />
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed font-medium">{serv.desc}</p>
                </div>
              ))}
            </div>

            {/* Logistics accessory attachments */}
            <div className="space-y-3 pt-4 border-t border-slate-900">
              <h3 className="font-bold text-sm text-slate-300">Dịch vụ gia tăng phụ trợ</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
                <label className="flex items-center space-x-2.5 bg-slate-900/60 p-3 rounded-lg border border-slate-800 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={hasHelpers} 
                    onChange={(e) => setHasHelpers(e.target.checked)} 
                    className="accent-orange-500 h-4 w-4"
                  />
                  <span>Cần tài xế phụ bốc xếp hàng cồng kềnh tầng lầu</span>
                </label>

                <label className="flex items-center space-x-2.5 bg-slate-900/60 p-3 rounded-lg border border-slate-800 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={isNightTime} 
                    onChange={(e) => setIsNightTime(e.target.checked)} 
                    className="accent-orange-500 h-4 w-4"
                  />
                  <span>Giao ngoài giờ hành chính (Ban đêm / Sáng sớm)</span>
                </label>

                <label className="flex items-center space-x-2.5 bg-slate-900/60 p-3 rounded-lg border border-slate-800 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={hasInsurance} 
                    onChange={(e) => setHasInsurance(e.target.checked)} 
                    className="accent-orange-500 h-4 w-4"
                  />
                  <span>Đăng ký bảo hiểm bồi thường bưu gửi 100%</span>
                </label>

                <label className="flex items-center space-x-2.5 bg-slate-900/60 p-3 rounded-lg border border-slate-800 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={photoConfirm} 
                    onChange={(e) => setPhotoConfirm(e.target.checked)} 
                    className="accent-orange-500 h-4 w-4"
                  />
                  <span>Gửi chụp ảnh biên nhận nhận giao thực tế cho tôi</span>
                </label>
              </div>

              {/* COD amount */}
              <div className="mt-4 pt-4 border-t border-slate-900/50">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center space-x-1">
                  <DollarSign className="w-4.5 h-4.5 text-orange-500" />
                  <span>Số tiền thu hộ bưu cục (COD) nếu có</span>
                </label>
                <input
                  type="number"
                  min="0"
                  max="50000000"
                  value={codAmount || ""}
                  onChange={(e) => setCodAmount(Number(e.target.value))}
                  className="w-full sm:w-1/2 bg-slate-900 border border-slate-800 focus:ring-1 focus:ring-orange-500 rounded-lg py-2 px-3 text-slate-100 text-sm focus:outline-none"
                  placeholder="Ví dụ: 1.500.000 VNĐ"
                />
              </div>

            </div>
          </div>
        )}

        {/* STEP 5: Live quotation review */}
        {step === 5 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold flex items-center space-x-2 text-slate-100">
                <ClipboardCheck className="w-5 h-5 text-orange-500" />
                <span>Bước 5: Xác nhận báo giá dịch vụ</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">Hệ thống phân tích mức cước bưu kiện dựa trên quãng đường tuyến thực tế</p>
            </div>

            {loading ? (
              <div className="py-12 text-center text-sm text-slate-400">
                <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                Đang tính toán cước hỏa tốc liên kết hệ thống xe đang chạy...
              </div>
            ) : priceResult ? (
              <div className="space-y-6">
                
                {priceResult.isManualQuoteRequired ? (
                  <div className="bg-amber-950/40 border border-amber-500/30 rounded-xl p-5 text-amber-400 space-y-3">
                    <p className="font-extrabold text-base sm:text-lg flex items-center text-amber-500">
                      ⚠️ CẦN NHÂN VIÊN GỌI BÁO GIÁ RIÊNG
                    </p>
                    <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                      Sản phẩm bưu kiện gửi của anh chị thuộc định danh hàng nặng (như xe máy, tivi điện máy lớn, hàng quá khổ). 
                      Chúng tôi không thể đóng giá tự động cố định vì giá vận tải phụ thuộc chặt chẽ vào kích thước đo đạc ròng, loại xe gác, 
                      và yêu cầu đóng đóng bọc gói bảo vệ chống sứt sát của anh chị.
                    </p>
                    <p className="text-slate-300 text-xs sm:text-sm font-semibold">
                      Sau khi quý khách bấm nút <strong className="text-orange-400">"GỬI YÊU CẦU BÁO GIÁ"</strong>, nhân viên trực hotline bàn điều vận sẽ gọi hỗ trợ thống nhất báo giá rốt rẻ nhất trong vòng 5 phút!
                    </p>
                  </div>
                ) : (
                  <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-4 shadow">
                    
                    {/* Destination details banner */}
                    <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-800 text-xs sm:text-sm">
                      <div>
                        <span className="text-slate-400">Điểm Lấy Hàng:</span>
                        <p className="font-bold text-slate-200 mt-0.5">{pickupProvince} - Quận {pickupDistrict}</p>
                      </div>
                      <div>
                        <span className="text-slate-400">Điểm Giao Hàng:</span>
                        <p className="font-bold text-slate-200 mt-0.5">{deliveryProvince} - Quận {deliveryDistrict}</p>
                      </div>
                    </div>

                    {/* Breakdown details */}
                    <div className="space-y-2 text-xs sm:text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Cước cơ bản ({itemType} - {weight} kg):</span>
                        <span className="text-slate-300 font-bold">{(priceResult.basePrice || 0).toLocaleString("vi-VN")} VNĐ</span>
                      </div>
                      {priceResult.weightPrice > 0 && (
                        <div className="flex justify-between">
                          <span className="text-slate-400">Phụ trội cân nặng thêm:</span>
                          <span className="text-slate-300 font-bold">{(priceResult.weightPrice).toLocaleString("vi-VN")} VNĐ</span>
                        </div>
                      )}
                      {priceResult.surcharges && (
                        <>
                          {priceResult.surcharges.hasHelpers > 0 && (
                            <div className="flex justify-between">
                              <span className="text-slate-400">Phụ phí bốc vác trợ giúp:</span>
                              <span className="text-slate-300 font-bold">{(priceResult.surcharges.hasHelpers).toLocaleString("vi-VN")} VNĐ</span>
                            </div>
                          )}
                          {priceResult.surcharges.isNightTime > 0 && (
                            <div className="flex justify-between">
                              <span className="text-slate-400">Surcharge giao đêm tối muộn:</span>
                              <span className="text-slate-300 font-bold">{(priceResult.surcharges.isNightTime).toLocaleString("vi-VN")} VNĐ</span>
                            </div>
                          )}
                          {priceResult.surcharges.insurance > 0 && (
                            <div className="flex justify-between">
                              <span className="text-slate-400">Phí bảo hiểm bảo vệ giá trị:</span>
                              <span className="text-slate-300 font-bold">{(priceResult.surcharges.insurance).toLocaleString("vi-VN")} VNĐ</span>
                            </div>
                          )}
                        </>
                      )}
                      
                      {codAmount > 0 && (
                        <div className="flex justify-between text-indigo-400 pt-2 border-t border-slate-800/60">
                          <span>Số tiền thu hộ tại bến (COD):</span>
                          <span className="font-extrabold">{codAmount.toLocaleString("vi-VN")} VNĐ</span>
                        </div>
                      )}
                    </div>

                    {/* Final price result */}
                    <div className="pt-4 border-t border-slate-800 flex justify-between items-center">
                      <div>
                        <span className="text-slate-400 text-xs tracking-wider uppercase font-extrabold">Cước thỏa thuận dự kiến:</span>
                        <p className="text-[10px] text-slate-500 mt-0.5">*Giá trị cuối cùng cam kết công khai không phát sinh</p>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl sm:text-3xl text-green-400 font-black">
                          {(priceResult.finalPrice || 150000).toLocaleString("vi-VN")} VNĐ
                        </span>
                        <p className="text-xs text-orange-400 font-bold uppercase mt-1">Hỏa tốc giao: {priceResult.estimatedDuration || "Trong ngày"}</p>
                      </div>
                    </div>

                  </div>
                )}

                {/* Sender/Receiver Summary box */}
                <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-800/80 text-xs sm:text-sm space-y-2">
                  <h4 className="font-bold text-slate-300 border-b border-slate-800 pb-1.5 mb-2 uppercase">Tổng hợp bưu gửi</h4>
                  <p className="text-slate-300">
                    <strong className="text-slate-400">Hành trình:</strong> Gửi từ <span className="text-slate-200 font-semibold">{senderName} ({senderPhone})</span> đến <span className="text-slate-200 font-semibold">{receiverName} ({receiverPhone})</span>
                  </p>
                  <p className="text-slate-300">
                    <strong className="text-slate-400">Hàng hoá:</strong> {itemType} ({packageCount} kiện, mô tả: {itemDescription || "Không ghi"})
                  </p>
                  <p className="text-slate-300">
                    <strong className="text-slate-400">Hệ dịch vụ hỏa tốc:</strong> {serviceType} {handOverDirect && "• Giao tận tay tận phòng thư ký thầu"}
                  </p>
                </div>

              </div>
            ) : (
              <div className="py-6 text-center text-sm text-red-400">Không thể liên kết tính cước. Hãy đi tiếp làm báo thủ công.</div>
            )}
          </div>
        )}

        {/* STEP 6: Success screen */}
        {step === 6 && createdOrder && (
          <div className="text-center space-y-6 py-6 animate-fade-in text-slate-200">
            <div className="w-16 h-16 bg-green-500/10 border border-green-500/30 rounded-full flex items-center justify-center mx-auto text-green-400 text-3xl">
              ✓
            </div>
            
            <div className="space-y-2">
              <h2 className="text-xl sm:text-3xl font-black text-slate-100">
                Gửi Yêu Cầu Chân Thành Thành Công!
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
                Chuyển Phát 24H đã tiếp nhận dữ liệu bưu gửi của anh chị. Bộ phận điều phối tại bến xe hỏa tốc đang khớp xe rải rác nhanh nhất.
              </p>
            </div>

            {/* Generated order tracking cards */}
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl max-w-md mx-auto space-y-4">
              <div>
                <span className="text-xs text-slate-500 uppercase font-extrabold tracking-widest">Mã tra cứu đơn (Order Code)</span>
                <p className="text-base sm:text-xl text-yellow-400 font-black tracking-wider mt-0.5 select-all p-2.5 bg-slate-950 rounded border border-slate-800">
                  {createdOrder.orderCode}
                </p>
              </div>

              <div className="text-left text-xs sm:text-sm space-y-2.5 text-slate-300 border-t border-slate-800/80 pt-4">
                <div className="flex justify-between">
                  <span className="text-slate-500">Người gửi:</span>
                  <span className="font-bold">{createdOrder.senderName} ({createdOrder.senderPhone})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Tỉnh nhận:</span>
                  <span className="font-bold text-slate-200">{createdOrder.deliveryProvince}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Tổng phí tạm tính:</span>
                  <span className="font-black text-green-400 text-base">
                    {createdOrder.finalPrice ? createdOrder.finalPrice.toLocaleString("vi-VN") : "Báo giá riêng"} VNĐ
                  </span>
                </div>
                <div className="flex justify-between items-center bg-amber-500/5 border border-amber-500/10 p-2.5 rounded text-[11px] sm:text-xs">
                  <span className="text-amber-400 font-extrabold">Trạng thái:</span>
                  <span className="text-slate-200 font-bold">Đã tiếp nhận — Xe điều phối chuẩn bị xuất phát</span>
                </div>
              </div>
            </div>

            {/* Recommendations or hotline calls */}
            <div className="space-y-3 pt-4">
              <p className="text-xs text-slate-500 leading-normal">
                Anh chị cần xác thực gấp, chỉnh sửa thông tin rước hàng tận nhà lấy ngay vui lòng click link điện hotline:
              </p>
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 justify-center">
                <a 
                  href="tel:0345076789" 
                  className="bg-orange-500 text-slate-950 px-6 py-3 font-extrabold text-xs sm:text-sm uppercase tracking-wide rounded hover:bg-orange-400 transition-all flex items-center justify-center space-x-1.5"
                >
                  <span>Gọi Lái Xe Xác Thực Gấp</span>
                </a>
                <button 
                  onClick={() => setView("tracking")} 
                  className="bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-300 px-6 py-3 font-semibold text-xs sm:text-sm rounded transition-all"
                >
                  Tra cứu bưu gửi trực tiếp
                </button>
              </div>
            </div>

          </div>
        )}

        {/* Dynamic button control bars */}
        {step < 6 && (
          <div className="mt-8 pt-6 border-t border-slate-900 flex justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="flex items-center space-x-1 border border-slate-700 hover:border-slate-500 hover:bg-slate-900 px-4 py-2 text-xs sm:text-sm font-bold rounded-lg text-slate-400 transition-all cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Quay lại</span>
              </button>
            ) : (
              <div></div>
            )}

            {step < 5 ? (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                className="flex items-center space-x-1 bg-slate-100 hover:bg-white text-slate-950 px-5 py-2.5 text-xs sm:text-sm font-black rounded-lg transition-all cursor-pointer shadow-lg"
              >
                <span>Tiếp tục</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleCreateOrder}
                disabled={loading}
                className="flex items-center space-x-1.5 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 text-slate-950 px-6 py-2.5 text-xs sm:text-sm font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer shadow-lg shadow-green-500/10"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>Gửi Yêu Cầu Chân Thành</span>
                    <Sparkles className="w-4 h-4 text-slate-950 fill-slate-950 animate-pulse" />
                  </>
                )}
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
