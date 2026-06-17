import React, { useEffect, useState } from "react";
import { Clock, Navigation2, CheckCircle2, Package, Sparkles } from "lucide-react";
import { Route } from "../types";

interface RoutesSliderProps {
  setView: (view: string) => void;
  onQuickBooking: (data: any) => void;
}

export default function RoutesSlider({ setView, onQuickBooking }: RoutesSliderProps) {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchRoutes();
  }, []);

  const fetchRoutes = async () => {
    try {
      const res = await fetch("/api/routes");
      const data = await res.json();
      setRoutes(data);
    } catch (err) {
      console.error("Failed to load active routes:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleBookRoute = (route: Route) => {
    onQuickBooking({
      direction: route.direction,
      province: route.destinationProvince === "Hà Nội" ? route.originProvince : route.destinationProvince,
      assignedRouteId: route.id,
      routeName: route.name,
      serviceType: route.serviceLevel.includes("2–4") ? "Hỏa tốc 2-4h" : "Trong ngày"
    });
    setView("booking");
  };

  if (loading) {
    return (
      <div className="py-12 bg-slate-900 border-b border-slate-800 text-center text-slate-400 text-sm">
        Đang tải thông tin xe chạy thực tế...
      </div>
    );
  }

  return (
    <section className="py-16 bg-slate-900 text-white relative border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="text-center space-y-3 mb-12">
          <div className="inline-flex items-center space-x-1.5 bg-green-500/10 border border-green-500/30 text-green-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-ping"></span>
            <span>Trực tiếp hôm nay</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Tuyến Xe Đang Chạy Hôm Nay
          </h2>
          <p className="text-slate-400 text-xs sm:text-base max-w-2xl mx-auto">
            Hàng hóa đi ngay theo hệ thống xe chở khách dịch vụ, xe hợp đồng đang di chuyển. 
            Không chờ chia kho trung kiểm bưu cục.
          </p>
        </div>

        {/* Routes Grid layout representing actual schedules */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {routes.map((route) => {
            const isFull = route.remainingOrderSlots === 0;
            return (
              <div 
                key={route.id} 
                className="bg-slate-950 border border-slate-800/80 hover:border-slate-700/70 p-5 rounded-xl shadow-xl transition-all duration-300 relative group flex flex-col justify-between overflow-hidden"
              >
                {/* Floating ambient glow on hover */}
                <div className="absolute top-0 right-0 w-[40px] h-[40px] bg-orange-500/5 group-hover:bg-orange-500/10 blur-[20px] transition-all"></div>
                
                <div>
                  {/* Top line badges */}
                  <div className="flex justify-between items-center mb-4">
                    <span className="inline-flex items-center space-x-1 bg-slate-900 border border-slate-800 text-slate-400 text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded">
                      <Clock className="w-3 h-3 text-orange-500" />
                      <span>Chạy: {route.departureTime}</span>
                    </span>

                    {/* Available Slot badges */}
                    {isFull ? (
                      <span className="bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] sm:text-xs font-bold px-2.5 py-0.5 rounded">
                        Đã đầy đơn
                      </span>
                    ) : (
                      <span className={`text-[10px] sm:text-xs font-bold px-2.5 py-0.5 rounded ${
                        route.remainingOrderSlots <= 2 
                          ? "bg-amber-500/10 border border-amber-500/20 text-amber-400" 
                          : "bg-green-500/10 border border-green-500/20 text-green-400"
                      }`}>
                        Còn {route.remainingOrderSlots} chỗ gửi
                      </span>
                    )}
                  </div>

                  {/* Route connection name */}
                  <div className="mb-4">
                    <h3 className="text-base sm:text-lg font-black text-slate-200 group-hover:text-amber-400 transition-colors flex items-center mb-1">
                      <Navigation2 className="w-4 h-4 text-orange-500 fill-orange-500 rotate-95 mr-1.5 flex-shrink-0" />
                      {route.name}
                    </h3>
                    <p className="text-xs text-slate-400 font-medium">Chiều đi: {route.direction}</p>
                  </div>

                  {/* Quick specs item types accepted */}
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center space-x-1.5 text-xs text-slate-300">
                      <Package className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                      <span className="font-semibold text-slate-400">Nhận:</span>
                      <span className="truncate">{route.acceptedItemTypes.join(", ")}</span>
                    </div>

                    <div className="flex items-center space-x-2 text-xs">
                      <span className="text-slate-500">Giờ vận chuyển:</span>
                      <span className="text-slate-300 font-extrabold">{route.estimatedDuration}</span>
                      <span className="text-slate-400">•</span>
                      <span className="text-amber-400 bg-amber-400/5 px-1.5 py-0.5 text-[10px] font-black uppercase tracking-wider rounded">
                        {route.serviceLevel.replace("Thời gian: ", "")}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Submitting to booking click action */}
                <button
                  onClick={() => handleBookRoute(route)}
                  disabled={isFull}
                  className={`w-full py-2.5 rounded text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
                    isFull 
                      ? "bg-slate-900 text-slate-600 border border-slate-800/50 cursor-not-allowed" 
                      : "bg-slate-900 hover:bg-orange-500 hover:text-slate-950 text-orange-400 border border-orange-500/30 group-hover:border-orange-500 shadow"
                  }`}
                >
                  <span>Gửi Hàng Tuyến Này</span>
                  <Sparkles className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Informative summary note */}
        <div className="mt-12 bg-slate-950 p-5 rounded-xl border border-slate-800 max-w-4xl mx-auto flex items-start space-x-3 text-xs sm:text-sm text-slate-300 leading-relaxed">
          <div className="w-5 h-5 bg-orange-500/10 border border-orange-500/30 rounded-full flex items-center justify-center text-orange-400 font-bold flex-shrink-0">!</div>
          <div>
            <strong className="text-orange-400">Giải thích nguyên lý khớp đơn xe đi thẳng:</strong> Với các địa điểm gần Hà Nội dưới 100km, 
            xe dịch vụ liên tỉnh khởi hành cứ sau 60 phút sẽ lập tức đưa bưu kiện của bạn theo cốp xe. 
            Giờ trả hàng bảo đảm giao thông thuận tiện cam kết tối thiểu 2-4 tiếng tận cơ quan tổ chức, bến showroom cá nhân của bạn.
          </div>
        </div>

      </div>
    </section>
  );
}
