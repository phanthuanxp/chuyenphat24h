import React, { useState } from "react";
import { Search, MapPin, Truck, Calendar, UserCheck, CheckCircle2, PhoneCall, Navigation, ShieldCheck } from "lucide-react";
import { Order, OrderStatus, OrderStatusLabels, OrderStatusColors } from "../types";

export default function TrackingSection() {
  const [searchInput, setSearchInput] = useState<string>("CP24H-20260616-0130");
  const [results, setResults] = useState<Order[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput.trim()) return;

    setLoading(true);
    setError(null);
    setResults(null);

    try {
      // Determine if search query is likely a phone number or order code
      const isPhone = /^[0-9+() \-]{7,15}$/.test(searchInput.trim());
      const paramName = isPhone ? "phone" : "code";
      
      const res = await fetch(`/api/orders/lookup?${paramName}=${encodeURIComponent(searchInput.trim())}`);
      if (!res.ok) {
        throw new Error("Không thể liên lạc hệ thống tra cứu");
      }

      const data = await res.json();
      if (data && data.length > 0) {
        setResults(data);
      } else {
        setError(`⚠️ Không tìm thấy dữ liệu bưu gửi tương thích với từ khóa "${searchInput}". Vui lòng thử mã đơn dạng CP24H- YYYYMMDD-XXXX hoặc số điện thoại người gửi.`);
      }
    } catch (err: any) {
      console.error(err);
      setError("⚠️ Có lỗi máy chủ phát sinh. Vui lòng liên hệ Hotline 0345.07.6789 để kiểm tra trực tiếp.");
    } finally {
      setLoading(false);
    }
  };

  // Helper map status values into chronological timeline checkpoints
  const getTimelineSteps = (status: OrderStatus) => {
    const steps = [
      { key: "NEW", label: "Tiếp nhận", desc: "Hệ thống ghi nhận đơn mới", active: true },
      { key: "CONFIRMED", label: "Xác nhận", desc: "Đã chốt giá & duyệt hành trình", active: false },
      { key: "PICKED", label: "Đã gom hàng", desc: "Tài xế đã nhận hàng thực tế", active: false },
      { key: "TRANSIT", label: "Vận chuyển", desc: "Hàng đi theo cốp xe thẳng tỉnh", active: false },
      { key: "ARRIVED", label: "Tỉnh nhận", desc: "Hàng đã tập kết đích ở khu vực nhận", active: false },
      { key: "DELIVERED", label: "Hoàn tất", desc: "Đã giao tận tay người nhận", active: false }
    ];

    // Mark steps active according to chronological status thresholds
    if (status === OrderStatus.NEW || status === OrderStatus.PENDING_CONFIRMATION) {
      steps[0].active = true;
    } else if (status === OrderStatus.QUOTED || status === OrderStatus.CUSTOMER_CONFIRMED) {
      steps[1].active = true;
    } else if (status === OrderStatus.ASSIGNING_DRIVER || status === OrderStatus.ASSIGNED || status === OrderStatus.PICKUP_IN_PROGRESS) {
      steps[1].active = true;
    } else if (status === OrderStatus.PICKED_UP) {
      steps[1].active = true;
      steps[2].active = true;
    } else if (status === OrderStatus.IN_TRANSIT) {
      steps[1].active = true;
      steps[2].active = true;
      steps[3].active = true;
    } else if (status === OrderStatus.ARRIVED_DESTINATION || status === OrderStatus.DELIVERY_IN_PROGRESS) {
      steps[1].active = true;
      steps[2].active = true;
      steps[3].active = true;
      steps[4].active = true;
    } else if (status === OrderStatus.DELIVERED) {
      steps.forEach(s => s.active = true);
    }

    return steps;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 text-slate-100">
      <div className="text-center space-y-4 mb-8">
        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
          Tra Cứu Bưu Gửi Siêu Tốc
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm max-w-xl mx-auto">
          Nhập mã vận đơn dạng <strong className="text-amber-400">CP24H-2026xxxx-xxxx</strong> hoặc <strong className="text-amber-400">Số điện thoại gửi hàng</strong> để cập nhật checkpoint thực tế lộ trình bến xe.
        </p>

        {/* Input box */}
        <form onSubmit={handleSearch} className="max-w-xl mx-auto mt-6 flex space-x-2">
          <div className="relative flex-grow">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
              <Search className="h-4.5 w-4.5 text-slate-500" />
            </span>
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 focus:ring-1 focus:ring-orange-500 hover:border-slate-700/85 rounded-lg py-3 pl-10 pr-4 text-slate-100 text-sm focus:outline-none"
              placeholder="Ví dụ: CP24H-20260616-0130 hoặc 0912345678"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs sm:text-sm px-6 rounded-lg transition-transform active:scale-95 shadow cursor-pointer flex items-center justify-center space-x-1"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <span>Tra cứu ngay</span>
            )}
          </button>
        </form>
      </div>

      {/* Render Error */}
      {error && (
        <div className="p-4 bg-red-950/20 border border-red-500/20 rounded-xl text-red-400 text-center text-xs sm:text-sm leading-relaxed max-w-2xl mx-auto animate-fade-in mb-8">
          {error}
        </div>
      )}

      {/* Render list of matched lookup orders */}
      {results && results.map((order) => {
        const timeline = getTimelineSteps(order.status);
        const colorClass = OrderStatusColors[order.status] || "bg-slate-800 text-slate-200 border-slate-700";

        return (
          <div key={order.id} className="bg-slate-950 border border-slate-800 rounded-2xl shadow-xl p-5 sm:p-7 mb-8 animate-fade-in">
            {/* Header section code and status label */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-800 pb-4 mb-6">
              <div>
                <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest">Mã vận đơn bưu ký</span>
                <h3 className="text-lg sm:text-xl font-black text-amber-400 tracking-wide mt-0.5">{order.orderCode}</h3>
              </div>
              
              <div className="flex items-center space-x-2 mt-3 sm:mt-0">
                <span className="text-slate-400 text-xs font-semibold">Trạng thái:</span>
                <span className={`px-3 py-1 text-xs font-bold rounded-full border ${colorClass}`}>
                  {OrderStatusLabels[order.status]}
                </span>
              </div>
            </div>

            {/* Checked Progress Timeline design */}
            <div className="pb-8 border-b border-slate-900 mb-6">
              <h4 className="font-extrabold text-sm uppercase text-slate-400 tracking-wider mb-8">Checkpoint Hành Trình Đội Xe</h4>
              
              <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                {timeline.map((step, idx) => (
                  <div key={idx} className="flex flex-col items-center text-center relative">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                      step.active 
                        ? "bg-gradient-to-tr from-green-500 to-emerald-600 border border-green-400 text-slate-950 shadow-lg shadow-green-500/10 scale-110" 
                        : "bg-slate-900 border border-slate-800 text-slate-600"
                    }`}>
                      {step.active ? "✓" : idx + 1}
                    </div>
                    <span className={`text-xs font-extrabold mt-3.5 ${step.active ? "text-slate-200" : "text-slate-600"}`}>{step.label}</span>
                    <p className={`text-[10px] leading-relaxed mt-1 hidden md:block max-w-[120px] ${step.active ? "text-slate-400" : "text-slate-700"}`}>
                      {step.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Body breakdown blocks contact information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 mb-6 border-b border-slate-900 text-xs sm:text-sm text-slate-300">
              {/* Left detail card */}
              <div className="space-y-3.5 bg-slate-900/40 p-4 rounded-xl border border-slate-800">
                <h5 className="font-extrabold text-xs text-orange-400 uppercase tracking-widest pb-1 border-b border-slate-800/80 mb-2">
                  Đặc điểm bưu phẩm
                </h5>
                <div className="flex justify-between">
                  <span className="text-slate-500">Người gửi thắt:</span>
                  <span className="font-bold">{order.senderName} ({order.senderPhone})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Lấy tận cơ sở:</span>
                  <span className="font-bold text-slate-200 text-right">{order.pickupAddress}, Q.{order.pickupDistrict}, {order.pickupProvince}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Mặt hàng vận:</span>
                  <span className="font-semibold text-slate-200">{order.itemType} (~{order.weight}kg)</span>
                </div>
                <div className="flex justify-between text-indigo-400">
                  <span>Trạng thanh toán:</span>
                  <span className="font-bold">{order.paymentStatus}</span>
                </div>
              </div>

              {/* Right dest block */}
              <div className="space-y-3.5 bg-slate-900/40 p-4 rounded-xl border border-slate-800">
                <h5 className="font-extrabold text-xs text-orange-400 uppercase tracking-widest pb-1 border-b border-slate-800/80 mb-2">
                  Người nhận & Điểm Đích
                </h5>
                <div className="flex justify-between">
                  <span className="text-slate-500">Thụ hưởng nhận:</span>
                  <span className="font-bold">{order.receiverName} ({order.receiverPhone})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Nơi giao tận nơi:</span>
                  <span className="font-bold text-slate-200 text-right">{order.deliveryAddress}, Q.{order.deliveryDistrict}, {order.deliveryProvince}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Gói thời gian:</span>
                  <span className="font-extrabold text-yellow-400">{order.serviceType}</span>
                </div>
                <div className="flex justify-between text-green-400">
                  <span>Giá cước niêm yết:</span>
                  <span className="font-extrabold text-base">
                    {order.finalPrice ? `${order.finalPrice.toLocaleString("vi-VN")} VNĐ` : "Chờ báo giá riêng"}
                  </span>
                </div>
              </div>
            </div>

            {/* Check if driver is assigned */}
            {order.assignedDriverId ? (
              <div className="bg-slate-900/80 border border-slate-800/60 p-4 sm:p-5 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <img
                      src="https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&q=80&w=80&h=80"
                      alt="Tài xế"
                      className="w-12 h-12 rounded-full object-cover border border-slate-700 shadow"
                    />
                    <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border border-slate-950 rounded-full"></span>
                  </div>

                  <div>
                     <span className="text-[10px] text-slate-500 uppercase font-black">Lái Xe Điều Phối</span>
                     <h5 className="font-extrabold text-sm text-slate-200">Đội trưởng lái xe - Bùi Quốc Khánh</h5>
                     <p className="text-xs text-slate-400 mt-1">Biển liên bang: <strong className="text-slate-300">29C-555.23 (Bán tải cabin đậy)</strong></p>
                  </div>
                </div>

                <div className="flex space-x-3 w-full sm:w-auto">
                  <a
                    href="tel:0345076789"
                    className="flex-grow sm:flex-grow-0 bg-orange-500 text-slate-950 hover:bg-orange-400 font-extrabold py-2 px-5 rounded text-xs uppercase tracking-wide text-center flex items-center justify-center space-x-1.5"
                  >
                    <PhoneCall className="w-4 h-4" />
                    <span>Gọi lái xe</span>
                  </a>

                  <button
                    onClick={() => alert("Simulation: Mở bản đồ theo dõi GPS của lái xe.")}
                    className="flex-grow sm:flex-grow-0 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold py-2 px-5 rounded text-xs text-center flex items-center justify-center space-x-1.5"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Xem định vị</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-slate-900/20 border border-slate-800/60 p-4 rounded-xl flex items-center space-x-3 text-xs sm:text-sm text-slate-400 leading-normal">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping flex-shrink-0"></div>
                <span>Hệ thống đang điều động tài xế chạy tuyến rảnh xe gần rào lấy nhất. Quý khách vui lòng lưu lại mã vận đơn.</span>
              </div>
            )}

          </div>
        );
      })}

    </div>
  );
}
