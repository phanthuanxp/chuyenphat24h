import React, { useState } from "react";
import { ArrowRightLeft, ShieldCheck, Flame, Scale, Calculator, PhoneCall, Check, Sparkles } from "lucide-react";
import { PROVINCES_MAP } from "../constants";

interface HeroProps {
  setView: (view: string) => void;
  onQuickBooking: (data: any) => void;
}

export default function Hero({ setView, onQuickBooking }: HeroProps) {
  const [direction, setDirection] = useState<"Hà Nội đi Tỉnh" | "Tỉnh về Hà Nội">("Hà Nội đi Tỉnh");
  const [province, setProvince] = useState<string>("Bắc Ninh");
  const [itemType, setItemType] = useState<string>("Bưu phẩm nhỏ");
  const [weight, setWeight] = useState<number>(1);
  const [declaredValue, setDeclaredValue] = useState<number>(0);
  const [estimateResult, setEstimateResult] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // List of provinces excluding Hà Nội to use for provincial targets
  const destProvinces = Object.keys(PROVINCES_MAP).filter((p) => p !== "Hà Nội");

  const handleEstimate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setEstimateResult(null);

    const payload = {
      pickupProvince: direction === "Hà Nội đi Tỉnh" ? "Hà Nội" : province,
      deliveryProvince: direction === "Hà Nội đi Tỉnh" ? province : "Hà Nội",
      itemType,
      serviceType: "Trong ngày",
      weight,
      declaredValue,
      hasHelpers: false,
      isNightTime: false
    };

    try {
      const res = await fetch("/api/pricing/estimate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      setEstimateResult(data);
    } catch (err) {
      console.error("Pricing estimation failure:", err);
    } finally {
      setLoading(false);
    }
  };

  const startBookingWithQuickData = () => {
    onQuickBooking({
      direction,
      province,
      itemType,
      weight,
      declaredValue,
      quotedPrice: estimateResult?.finalPrice || 0,
      isManualQuoteRequired: estimateResult?.isManualQuoteRequired || false
    });
    setView("booking");
  };

  return (
    <div className="relative bg-slate-950 text-white overflow-hidden py-14 sm:py-24 border-b border-slate-800">
      {/* Dynamic graphic absolute grid background layout */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(249,115,22,0.18),rgba(255,255,255,0))]"></div>
      <div className="absolute top-1/2 left-0 right-0 h-[100px] bg-sky-500/5 blur-[120px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Brand Introduction Text Left Side */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-8">
            <div className="inline-flex items-center space-x-2 bg-orange-500/10 border border-orange-500/30 text-orange-400 px-3 py-1.5 rounded-full text-xs sm:text-sm font-bold tracking-wide animate-pulse">
              <Flame className="w-4 h-4 fill-orange-400" />
              <span>Chuyển phát 2 chiều siêu tăng tốc miền Bắc</span>
            </div>
            
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black leading-tight sm:leading-none tracking-tight">
              Chuyển phát hỏa tốc <br />
              <span className="bg-gradient-to-r from-orange-500 via-amber-400 to-yellow-300 bg-clip-text text-transparent">
                liên tỉnh trong 2-4h
              </span>
            </h1>

            <p className="text-slate-300 text-sm sm:text-lg max-w-2xl leading-relaxed">
              Nhận tận nhà, giao tận tay các loại giấy tờ, bưu phẩm, xe máy hay thiết bị cồng kềnh. 
              Mô hình vận tải <strong className="text-amber-400">Không Gom Kho</strong>, hàng đi theo chuyến xe limousine liên tỉnh đang chạy lăn bánh thật giúp rút ngắn thời gian gấp 3 lần chuyển phát thường.
            </p>

            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
              <button 
                onClick={() => setView("booking")} 
                className="bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 font-black px-8 py-3.5 text-center text-sm uppercase rounded-lg shadow-lg hover:shadow-orange-500/20 active:scale-[0.98] transition-all flex items-center justify-center space-x-2"
              >
                <span>Tạo đơn nhận ngay</span>
                <Calculator className="w-4 h-4" />
              </button>
              
              <a 
                href="tel:0345076789"
                className="bg-slate-900 border border-slate-700 text-amber-400 font-bold px-8 py-3.5 text-center text-sm rounded-lg hover:bg-slate-800 transition-all flex items-center justify-center space-x-2"
              >
                <PhoneCall className="w-4 h-4 text-orange-400" />
                <span>Gọi Lái Xe: 0345.07.6789</span>
              </a>
            </div>

            {/* Quick trust micro badges */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-4 border-t border-slate-900">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-4.5 h-4.5 text-orange-500" />
                <span className="text-slate-300 text-xs sm:text-sm font-semibold">An toàn tuyệt đối</span>
              </div>
              <div className="flex items-center space-x-2">
                <ArrowRightLeft className="w-4.5 h-4.5 text-orange-500" />
                <span className="text-slate-300 text-xs sm:text-sm font-semibold">Trả hàng 2 chiều</span>
              </div>
              <div className="flex items-center space-x-2">
                <Scale className="w-4.5 h-4.5 text-orange-500" />
                <span className="text-slate-300 text-xs sm:text-sm font-semibold">Xử lý cồng kềnh</span>
              </div>
            </div>
          </div>

          {/* Pricing Estimation Widget Card on Right Side */}
          <div className="lg:col-span-5 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-rose-600 rounded-2xl blur-[30px] opacity-10 pointer-events-none"></div>
            
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-2xl relative">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
                <div className="flex items-center space-x-2">
                  <Calculator className="w-5 h-5 text-orange-500" />
                  <span className="font-extrabold text-sm uppercase tracking-wider text-slate-100">Tính giá tham khảo</span>
                </div>
                <div className="text-[11px] font-semibold text-slate-400 bg-slate-800/60 border border-slate-700/50 px-2 py-0.5 rounded">
                  Chỉ trong 5 giây
                </div>
              </div>

              <form onSubmit={handleEstimate} className="space-y-4">
                {/* Direction choice */}
                <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1.5 rounded-lg border border-slate-800">
                  <button
                    type="button"
                    onClick={() => setDirection("Hà Nội đi Tỉnh")}
                    className={`py-1.5 rounded text-xs font-bold transition-all ${direction === "Hà Nội đi Tỉnh" ? "bg-orange-500 text-slate-950 shadow" : "text-slate-400 hover:text-slate-200"}`}
                  >
                    Hà Nội → Tỉnh
                  </button>
                  <button
                    type="button"
                    onClick={() => setDirection("Tỉnh về Hà Nội")}
                    className={`py-1.5 rounded text-xs font-bold transition-all ${direction === "Tỉnh về Hà Nội" ? "bg-orange-500 text-slate-950 shadow" : "text-slate-400 hover:text-slate-200"}`}
                  >
                    Tỉnh → Hà Nội
                  </button>
                </div>

                {/* Province choices */}
                <div>
                  <label className="block text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Tỉnh liên quan</label>
                  <select
                    value={province}
                    onChange={(e) => setProvince(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-orange-500 scrollbar-thin text-slate-200"
                  >
                    {destProvinces.map((prov) => (
                      <option key={prov} value={prov}>{prov}</option>
                    ))}
                  </select>
                </div>

                {/* Grid inputs for product and dimensions */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Loại hàng</label>
                    <select
                      value={itemType}
                      onChange={(e) => setItemType(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 px-2 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-orange-500 text-slate-200"
                    >
                      <option value="Giấy tờ/chứng từ">Hồ sơ / Thầu thầu</option>
                      <option value="Bưu phẩm nhỏ">Bưu phẩm dưới 5kg</option>
                      <option value="Hàng shop">Hàng shop, thời trang</option>
                      <option value="Hàng điện tử">Đồ công nghệ, laptop</option>
                      <option value="Hàng dễ vỡ">Đồ thủy tinh, gốm</option>
                      <option value="Xe máy">Xe máy / Mô tô</option>
                      <option value="Hàng cồng kềnh">Tivi, điện máy lớn</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Nặng ước tính (kg)</label>
                    <input
                      type="number"
                      min="1"
                      max="1000"
                      value={weight}
                      onChange={(e) => setWeight(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-orange-500 text-slate-200"
                    />
                  </div>
                </div>

                {/* Declared Value for insurance */}
                <div>
                  <label className="block text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Khai báo giá trị (VNĐ)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="Không bắt buộc (Dùng đóng bảo hiểm)"
                    value={declaredValue || ""}
                    onChange={(e) => setDeclaredValue(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-orange-500 text-slate-200"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-slate-100 hover:bg-white text-slate-950 font-black uppercase text-xs sm:text-sm py-3 rounded-lg shadow-lg active:scale-[0.98] transition-all flex items-center justify-center space-x-2 cursor-pointer"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <span>Ước Tính Chi Phí Ngay</span>
                      <Sparkles className="w-4 h-4 text-orange-500 fill-orange-500" />
                    </>
                  )}
                </button>
              </form>

              {/* Estimate calculation output */}
              {estimateResult && (
                <div className="mt-5 p-4 bg-slate-950 border border-slate-800 rounded-lg animate-fade-in text-xs sm:text-sm">
                  {estimateResult.isManualQuoteRequired ? (
                    <div className="space-y-2 text-amber-500">
                      <p className="font-bold">⚠️ Trạng thái: Cần xác nhận giá riêng</p>
                      <p className="text-slate-300 leading-relaxed text-xs">
                        Hàng xe máy, máy giặt, tivi hoặc kích thước cồng kềnh vượt khung tiêu chuẩn. Hãy bấm "Gửi đơn" hoặc chat Zalo 
                        để điều xe vận chuyển chuyên ngách báo giá qua hình ảnh thực tế tốt hơn.
                      </p>
                      <button 
                        onClick={startBookingWithQuickData}
                        className="w-full mt-2 py-1.5 bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/30 text-xs font-bold rounded"
                      >
                        Gửi thông tin cho Admin gọi lại ngay
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                        <span className="text-slate-400">Tuyến phục vụ:</span>
                        <span className="text-amber-400 font-bold">
                          {direction === "Hà Nội đi Tỉnh" ? `Hà Nội ↔ ${province}` : `${province} ↔ Hà Nội`}
                        </span>
                      </div>
                      <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                        <span className="text-slate-400">Thời gian đi dự kiến:</span>
                        <span className="text-slate-200 font-extrabold">{estimateResult.estimatedDuration || "Trong ngày (3 - 6h)"}</span>
                      </div>
                      <div className="flex justify-between items-center pt-1 font-black">
                        <span className="text-slate-300 text-xs uppercase">Cước phí ước tính:</span>
                        <span className="text-xl sm:text-2xl text-green-400">
                          {estimateResult.finalPrice ? estimateResult.finalPrice.toLocaleString("vi-VN") : "0"} VNĐ
                        </span>
                      </div>
                      <button 
                        onClick={startBookingWithQuickData}
                        className="w-full text-center bg-green-500 text-slate-950 py-2.5 rounded font-black text-xs sm:text-sm hover:bg-green-400 hover:scale-[1.01] transition-all cursor-pointer"
                      >
                        Tiến Hành Đặt Tuyến Xe Này
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
