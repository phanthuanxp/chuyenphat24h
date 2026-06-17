import React, { useState, useEffect } from "react";
import { 
  BarChart3, RefreshCw, Layers, Check, Search, Truck, ShieldAlert, 
  MessageSquare, Users, Settings, Edit, Plus, Copy, AlertTriangle, Sparkles 
} from "lucide-react";
import { Order, OrderStatus, OrderStatusLabels, Route, Driver, Vehicle } from "../types";

export default function AdminPanel() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<"orders" | "routes" | "drivers" | "pricing">("orders");
  const [searchTerm, setSearchTerm] = useState<string>("");
  
  // AI assistant helpers state
  const [selectedOrderForAI, setSelectedOrderForAI] = useState<Order | null>(null);
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [aiSuggestion, setAiSuggestion] = useState<any>(null);
  const [copidMsg, setCopiedMsg] = useState<boolean>(false);

  useEffect(() => {
    fetchSystemData();
  }, []);

  const fetchSystemData = async () => {
    setLoading(true);
    try {
      const [orderRes, routeRes, driverRes, vehicleRes] = await Promise.all([
        fetch("/api/orders"),
        fetch("/api/routes"),
        fetch("/api/drivers"),
        fetch("/api/vehicles")
      ]);
      
      const ordersData = await orderRes.json();
      const routesData = await routeRes.json();
      const driversData = await driverRes.json();
      const vehiclesData = await vehicleRes.json();

      setOrders(ordersData);
      setRoutes(routesData);
      setDrivers(driversData);
      setVehicles(vehiclesData);
    } catch (err) {
      console.error("Failed loading systems admin records:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: OrderStatus) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        // Update local list state
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAssignDriver = async (orderId: string, driverId: string) => {
    const driver = drivers.find(d => d.id === driverId);
    const updates = {
      assignedDriverId: driverId,
      assignedVehicleId: driver?.vehicleId || "",
      status: OrderStatus.ASSIGNED
    };

    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, ...updates } : o));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handlePriceChange = async (orderId: string, finalPrice: number) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ finalPrice, status: OrderStatus.QUOTED })
      });
      if (res.ok) {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, finalPrice, status: OrderStatus.QUOTED } : o));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleTriggerAISuggestion = async (order: Order) => {
    setSelectedOrderForAI(order);
    setAiLoading(true);
    setAiSuggestion(null);

    try {
      const res = await fetch("/api/ai/admin-suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order.id })
      });
      const data = await res.json();
      setAiSuggestion(data);
    } catch (err) {
      console.error(err);
    } finally {
      setAiLoading(false);
    }
  };

  const copySmsToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMsg(true);
    setTimeout(() => setCopiedMsg(false), 2000);
  };

  // Stats calculation
  const totalCompletedEarnings = orders
    .filter(o => o.status === OrderStatus.DELIVERED)
    .reduce((acc, curr) => acc + (curr.finalPrice || 0), 0);
  const totalPendingOrders = orders.filter(o => o.status === OrderStatus.NEW || o.status === OrderStatus.PENDING_CONFIRMATION).length;
  const totalDispatchedOrders = orders.filter(o => o.status === OrderStatus.IN_TRANSIT || o.status === OrderStatus.DELIVERY_IN_PROGRESS).length;

  const filteredOrders = orders.filter(o => 
    o.orderCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.senderName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.receiverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.deliveryProvince.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-slate-100">
      
      {/* Title & Stats Grid cards banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-6 border-b border-slate-800 mb-8 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-rose-400 tracking-tight flex items-center space-x-2">
            <BarChart3 className="w-7 h-7" />
            <span>Châu Đốc Điều Phối & Hành Chính</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">Hệ thống điều vận thông minh Chuyển Phát 24H miền Bắc</p>
        </div>

        <button 
          onClick={fetchSystemData}
          className="flex items-center space-x-1.5 px-3.5 py-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 font-bold text-xs sm:text-sm rounded-lg transition-all"
        >
          <RefreshCw className="w-4 h-4 animate-spin-slow" />
          <span>Làm mới dữ liệu</span>
        </button>
      </div>

      {/* Admin stats dashboard charts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-slate-950 border border-slate-800 p-5 rounded-xl">
          <span className="text-xs text-slate-500 font-black uppercase tracking-widest">Doanh thu dự thu hoàn tất</span>
          <p className="text-xl sm:text-2xl font-black text-green-400 mt-1">{totalCompletedEarnings.toLocaleString("vi-VN")} VNĐ</p>
        </div>
        <div className="bg-slate-950 border border-slate-800 p-5 rounded-xl">
          <span className="text-xs text-slate-500 font-black uppercase tracking-widest">Đơn chưa xử lý (Mới)</span>
          <p className="text-xl sm:text-2xl font-black text-amber-500 mt-1">{totalPendingOrders} đơn hàng</p>
        </div>
        <div className="bg-slate-950 border border-slate-800 p-5 rounded-xl">
          <span className="text-xs text-slate-500 font-black uppercase tracking-widest">Đơn đang trên đường</span>
          <p className="text-xl sm:text-2xl font-black text-indigo-400 mt-1">{totalDispatchedOrders} chuyến xe</p>
        </div>
        <div className="bg-slate-950 border border-slate-800 p-5 rounded-xl">
          <span className="text-xs text-slate-500 font-black uppercase tracking-widest">Tổng lượng bưu gửi</span>
          <p className="text-xl sm:text-2xl font-black text-slate-200 mt-1">{orders.length} tờ gửi</p>
        </div>
      </div>

      {/* Primary tabs container */}
      <div className="flex space-x-2 border-b border-slate-800 mb-6 bg-slate-900/60 p-1 rounded-lg">
        {[
          { tab: "orders", label: "Quản lý Đơn hàng", icon: Layers },
          { tab: "routes", label: "Tuyến xe chạy (Schedule)", icon: Truck },
          { tab: "drivers", label: "Danh sách Lái xe", icon: Users },
          { tab: "pricing", label: "Duyệt Bảng giá", icon: Settings }
        ].map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.tab}
              onClick={() => { setActiveTab(t.tab as any); setAiSuggestion(null); setSelectedOrderForAI(null); }}
              className={`flex items-center space-x-1.5 px-3 py-2 text-xs sm:text-sm font-extrabold rounded-md transition-all ${
                activeTab === t.tab 
                  ? "bg-slate-950 text-rose-400 border border-slate-800" 
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="py-24 text-center text-slate-400 text-sm">
          Đang truy vấn dữ liệu từ máy chủ trung ương...
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* TAB 1: Orders list and smart AI pairing */}
          {activeTab === "orders" && (
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
              
              {/* Left Order list table column */}
              <div className="xl:col-span-8 bg-slate-950 border border-slate-800 rounded-xl p-4 sm:p-5 shadow">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-slate-800/80 mb-4 gap-2">
                  <h3 className="font-extrabold text-sm uppercase text-slate-300">Danh Sách Bưu Gửi Nhận</h3>
                  
                  {/* search bar input */}
                  <div className="relative w-full sm:w-64">
                    <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center">
                      <Search className="w-3.5 h-3.5 text-slate-500" />
                    </span>
                    <input
                      type="text"
                      placeholder="Tìm mã đơn, tên gửi/nhận..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded py-1 pl-8 pr-3 text-xs focus:outline-none focus:ring-1 focus:ring-orange-500"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto min-h-[400px]">
                  <table className="w-full text-xs text-left text-slate-300">
                    <thead className="bg-slate-900 text-slate-500 uppercase tracking-wider text-[10px] font-black border-b border-slate-800">
                      <tr>
                        <th className="py-3 px-3">Mã đơn</th>
                        <th className="py-3 px-3">Hành trình</th>
                        <th className="py-3 px-3">Hàng hoá & Gói</th>
                        <th className="py-3 px-3">Cước phí</th>
                        <th className="py-3 px-3">Trạng thái</th>
                        <th className="py-3 px-3 text-right">Điều phối</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-900/60 font-semibold">
                      {filteredOrders.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-center py-12 text-slate-600 font-bold">Không tìm thấy yêu cầu bưu gửi tương ứng.</td>
                        </tr>
                      ) : (
                        filteredOrders.map((order) => (
                          <tr key={order.id} className="hover:bg-slate-900/40">
                            {/* Code */}
                            <td className="py-3.5 px-3">
                              <span className="text-amber-400 font-extrabold">{order.orderCode}</span>
                              <p className="text-[10px] text-slate-500 mt-0.5">{order.senderName}</p>
                            </td>

                            {/* Journey route */}
                            <td className="py-3.5 px-3 text-slate-200">
                              <span className="text-slate-400 text-[10px] uppercase font-bold">Chiều:</span> {order.pickupProvince} → {order.deliveryProvince}
                              <p className="text-[10px] text-slate-400">Nhân: {order.receiverPhone}</p>
                            </td>

                            {/* Goods & service */}
                            <td className="py-3.5 px-3 text-slate-300">
                              <p className="text-slate-200 font-bold">{order.itemType}</p>
                              <span className="text-orange-400 text-[10px] font-extrabold bg-orange-500/5 border border-orange-500/20 px-1 py-0.2 rounded mt-1 inline-block">
                                {order.serviceType}
                              </span>
                            </td>

                            {/* Total Price input adjuster */}
                            <td className="py-3.5 px-3">
                              {order.isManualQuoteRequired && !order.finalPrice ? (
                                <div className="space-y-1">
                                  <span className="text-[10px] font-bold text-red-400 bg-red-400/5 border border-red-500/10 px-1.5 py-0.5 rounded">Cần Chốt</span>
                                  <input 
                                    type="number"
                                    placeholder="Điền VNĐ"
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") {
                                        handlePriceChange(order.id, Number((e.target as HTMLInputElement).value));
                                      }
                                    }}
                                    className="w-20 bg-slate-900 border border-slate-800 text-xs text-green-400 rounded px-1 py-0.5"
                                  />
                                </div>
                              ) : (
                                <span className="text-green-400 font-black">
                                  {order.finalPrice ? `${order.finalPrice.toLocaleString("vi-VN")}đ` : "Báo giá riêng"}
                                </span>
                              )}
                            </td>

                            {/* Status selector */}
                            <td className="py-3.5 px-3">
                              <select
                                value={order.status}
                                onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value as OrderStatus)}
                                className="bg-slate-900 border border-slate-800 text-[11px] rounded p-1 text-slate-300 focus:outline-none"
                              >
                                {Object.values(OrderStatus).map((status) => (
                                  <option key={status} value={status}>{OrderStatusLabels[status]}</option>
                                ))}
                              </select>
                            </td>

                            {/* AI suggesting action block */}
                            <td className="py-3.5 px-3 text-right">
                              <div className="flex flex-col space-y-1 items-end">
                                <button
                                  onClick={() => handleTriggerAISuggestion(order)}
                                  className="bg-indigo-600/10 hover:bg-indigo-600 hover:text-white border border-indigo-500/20 px-2 py-1 rounded text-[10px] text-indigo-400 font-extrabold flex items-center space-x-1 cursor-pointer transition-all"
                                >
                                  <Sparkles className="w-3 h-3 text-indigo-400" />
                                  <span>AI Match</span>
                                </button>
                                
                                {drivers.length > 0 && (
                                  <select
                                    value={order.assignedDriverId || ""}
                                    onChange={(e) => handleAssignDriver(order.id, e.target.value)}
                                    className="bg-slate-900 border border-slate-800 text-[10px] rounded p-0.5 mt-1 text-slate-400"
                                  >
                                    <option value="">Gán tài xế...</option>
                                    {drivers.map(d => (
                                      <option key={d.id} value={d.id}>{d.name}</option>
                                    ))}
                                  </select>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Right panel side - AI dispatch match suggester output */}
              <div className="xl:col-span-4 bg-slate-950 border border-slate-800 rounded-xl p-5 shadow min-h-[400px] flex flex-col justify-start">
                <div className="pb-3 border-b border-slate-800 mb-4 flex items-center space-x-2">
                  <Sparkles className="w-5 h-5 text-indigo-400 fill-indigo-400" />
                  <span className="font-extrabold text-sm uppercase text-slate-200">Gợi Ý Giao Xe Thông Minh (AI)</span>
                </div>

                {!selectedOrderForAI ? (
                  <div className="flex-grow flex flex-col items-center justify-center text-center py-12 text-slate-600 space-y-2">
                    <Truck className="w-10 h-10 text-slate-700" />
                    <p className="text-xs font-semibold max-w-[240px]">Chọn nút "AI Match" ở bất kỳ đơn hàng nào để phân tích ghép chuyến tự động lập tức.</p>
                  </div>
                ) : aiLoading ? (
                  <div className="flex-grow flex flex-col items-center justify-center text-slate-400 text-xs py-12">
                    <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                    Hệ thống AI đang đối soát các chuyến xe bus chạy gần nhất...
                  </div>
                ) : aiSuggestion ? (
                  <div className="space-y-5 text-slate-300 text-xs sm:text-sm">
                    {/* Selected brief info */}
                    <div className="p-3 bg-slate-900/80 rounded border border-slate-800/80">
                      <span className="text-[10px] text-slate-500 uppercase font-black">Khớp đơn cho bưu vận</span>
                      <h4 className="font-bold text-yellow-400">{selectedOrderForAI.orderCode}</h4>
                      <p className="text-slate-400 text-[11px] mt-0.5">Tuyến: <strong>{selectedOrderForAI.pickupProvince} → {selectedOrderForAI.deliveryProvince}</strong></p>
                    </div>

                    {/* Logic match findings */}
                    <div className="space-y-2">
                      <span className="text-[10px] text-slate-500 uppercase font-extrabold tracking-widest">Đề xuất tuyến khuyên gán</span>
                      {aiSuggestion.suggestedRoute ? (
                        <div className="bg-green-950/20 border border-green-500/20 p-3.5 rounded text-green-400">
                          <p className="font-extrabold flex items-center">
                            <Check className="w-4 h-4 mr-1" />
                            {aiSuggestion.suggestedRoute.name}
                          </p>
                          <p className="text-slate-300 text-[11px] mt-1">Giờ xuất phát: {aiSuggestion.suggestedRoute.departureTime} ({aiSuggestion.suggestedRoute.serviceLevel})</p>
                          <p className="text-slate-400 text-[10px] mt-1">Trạng thái chỗ: Còn trống {aiSuggestion.suggestedRoute.remainingOrderSlots} chỗ gửi hàng.</p>
                        </div>
                      ) : (
                        <div className="bg-amber-950/20 border border-amber-500/20 p-3 rounded text-amber-500 flex items-start space-x-2">
                          <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="font-bold">Không tìm thấy xe limousine chạy sẵn khớp giờ</p>
                            <p className="text-slate-400 text-[10px] leading-relaxed mt-1">Đề xuất bố trí xe máy gác trung chuyển hoặc điều xe tải nhỏ (xe riêng) chở bưu thầu độc lập.</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Confidence percentage */}
                    <div className="flex justify-between items-center py-2 border-b border-t border-slate-900">
                      <span className="text-slate-500 font-bold">Chỉ số mác an toàn:</span>
                      <span className="text-slate-200 font-bold text-xs">{aiSuggestion.confidenceIndex}</span>
                    </div>

                    {/* Compiled message template */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] text-slate-500 uppercase font-extrabold tracking-widest">Mở soạn tin nhanh (SMS/Zalo/Telegram)</span>
                      <div className="p-3 bg-slate-900/60 border border-slate-800 rounded font-mono text-[10px] leading-relaxed text-slate-300 select-all max-h-[140px] overflow-y-auto">
                        {aiSuggestion.generatedSmsTemplate}
                      </div>
                      
                      <button
                        onClick={() => copySmsToClipboard(aiSuggestion.generatedSmsTemplate)}
                        className="w-full py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-bold text-[11px] rounded transition-all flex items-center justify-center space-x-1 cursor-pointer"
                      >
                        <Copy className="w-3 h-3 text-orange-400" />
                        <span>{copidMsg ? "Đã sao chép!" : "Sao chép SMS mẫu"}</span>
                      </button>
                    </div>

                    {/* Assign action button */}
                    {aiSuggestion.suggestedRoute && (
                      <button
                        onClick={() => {
                          handleAssignDriver(selectedOrderForAI.id, aiSuggestion.suggestedRoute.driverId);
                          alert("Đã gán thành công tài xế và ghép tuyến chuyến hỏa tốc theo đề xuất của AI.");
                          setAiSuggestion(null);
                          setSelectedOrderForAI(null);
                        }}
                        className="w-full py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 font-black text-xs uppercase rounded transition-all shadow hover:scale-[1.01] cursor-pointer"
                      >
                        Chấp thuật & Gán Lái Xe Ghép Chuyến
                      </button>
                    )}

                  </div>
                ) : null}
              </div>

            </div>
          )}

          {/* TAB 2: Route schedule scheduler control */}
          {activeTab === "routes" && (
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 shadow">
              <div className="pb-4 border-b border-slate-800/80 mb-6 flex justify-between items-center flex-wrap gap-2">
                <div>
                  <h3 className="font-extrabold text-sm uppercase text-slate-200">Điều phối xe rải rác ("Tuyến xe đang chạy")</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">Xác định cung hỏa khách, slot trống bưu gửi hôm nay</p>
                </div>
                
                <button 
                  onClick={() => alert("Simulation: Tạo thêm chuyến xe chạy mới hôm nay.")}
                  className="bg-indigo-600 hover:bg-indigo-500 px-3 py-1.5 rounded text-xs font-bold flex items-center space-x-1 text-white cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Thêm Chuyến Mới</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {routes.map(r => (
                  <div key={r.id} className="bg-slate-900/60 border border-slate-800 p-5 rounded-lg text-xs space-y-3 relative">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-2.5">
                      <span className="font-black text-slate-200 text-xs sm:text-sm">{r.name}</span>
                      <span className="text-amber-400 bg-amber-400/5 px-2 py-0.5 rounded font-bold uppercase tracking-wider text-[10px]">
                        {r.departureTime}
                      </span>
                    </div>

                    <div className="space-y-1 text-slate-400 font-semibold">
                      <p>Khung giờ chạy: <span className="text-slate-200">{r.estimatedDuration}</span></p>
                      <p>Còn số chỗ bưu gửi: <span className="text-slate-200">{r.remainingOrderSlots} chỗ</span></p>
                      <p>Bên rước hàng: <span className="text-slate-200">{r.originProvince} → {r.destinationProvince}</span></p>
                    </div>

                    {/* Select action details changing routeStatus */}
                    <div className="pt-3 border-t border-slate-800 flex justify-between items-center">
                      <span className="text-slate-500">Mã Lịch: {r.id}</span>
                      
                      <select
                        value={r.routeStatus}
                        onChange={async (e) => {
                          const routeStatus = e.target.value as any;
                          const res = await fetch(`/api/routes/${r.id}`, {
                            method: "PATCH",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ routeStatus })
                          });
                          if (res.ok) {
                            setRoutes(prev => prev.map(item => item.id === r.id ? { ...item, routeStatus } : item));
                          }
                        }}
                        className="bg-slate-950 border border-slate-800 rounded p-1 text-[11px] text-slate-200 focus:outline-none"
                      >
                        <option value="Sắp chạy">Sắp chạy</option>
                        <option value="Đang nhận hàng">Đang nhận hàng</option>
                        <option value="Đã xuất phát">Đã xuất phát</option>
                        <option value="Đang trên đường">Đang trên đường</option>
                        <option value="Đã đến nơi">Đã đến nơi</option>
                        <option value="Đã kết thúc">Đã kết thúc</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: Drivers listings */}
          {activeTab === "drivers" && (
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 shadow">
              <h3 className="font-extrabold text-sm uppercase text-slate-200 pb-4 border-b border-slate-800 mb-6">Đội ngũ Tài xế & Phương tiện</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {drivers.map(d => (
                  <div key={d.id} className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 flex items-start space-x-4">
                    <img 
                      src={d.avatar} 
                      alt="" 
                      className="w-12 h-12 rounded-full object-cover border border-slate-700 mt-1" 
                    />
                    
                    <div className="text-xs space-y-1 text-slate-400">
                      <h4 className="font-bold text-slate-200 text-sm">{d.name}</h4>
                      <p>SĐT: <span className="text-slate-300 font-bold">{d.phone}</span></p>
                      <p>Trạng thái: <span className="text-teal-400 font-extrabold">{d.status}</span></p>
                      <p className="italic text-[10px] mt-1 text-slate-500">{d.notes || "Không ghi"}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: Pricing parameters */}
          {activeTab === "pricing" && (
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 shadow">
              <h3 className="font-extrabold text-sm uppercase text-slate-200 pb-4 border-b border-slate-800 mb-6">Duyệt và Cấu hình Biểu phí</h3>
              
              <div className="space-y-4">
                <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-lg text-xs leading-relaxed text-slate-400 max-w-4xl">
                  Để đảm bảo tính linh hoạt tối đa cho bưu điện ngách, hệ thống hỗ trợ tắt quy tắc giá hoặc điều chỉnh mức giá tối thiểu của từng vùng. 
                  Sản phẩm xe máy hoặc cồng kềnh quá khổ sẽ tự động bật cảnh báo <strong>BÁO GIÁ THỦ CÔNG</strong> nhằm tránh sai sót tổn hao của lái xe bốc dỡ thực tế.
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="border border-slate-800 p-4 rounded-lg bg-slate-900 text-xs space-y-2">
                    <h4 className="font-extrabold text-slate-200 border-b border-slate-800 pb-1 flex justify-between">
                      <span>Cước Cố định Thư từ</span>
                      <span className="text-green-400 font-black">150.000đ</span>
                    </h4>
                    <p>Tuyến: Hà Nội ↔ Bắc Ninh, Hưng Yên hỏa tốc</p>
                    <span className="text-[10px] bg-green-500/15 text-green-400 px-2 py-0.5 rounded font-bold uppercase tracking-wider">Đang hoạt động</span>
                  </div>

                  <div className="border border-slate-800 p-4 rounded-lg bg-slate-900 text-xs space-y-2">
                    <h4 className="font-extrabold text-slate-200 border-b border-slate-800 pb-1 flex justify-between">
                      <span>Cước Shop và Bưu phẩm</span>
                      <span className="text-green-400 font-black">180.000đ</span>
                    </h4>
                    <p>Tuyến: Hà Nội ↔ Hải Phòng xe limousine ghép</p>
                    <span className="text-[10px] bg-green-500/15 text-green-400 px-2 py-0.5 rounded font-bold uppercase tracking-wider">Đang hoạt động</span>
                  </div>

                  <div className="border border-slate-800 p-4 rounded-lg bg-slate-900 text-xs space-y-2">
                    <h4 className="font-extrabold text-slate-200 border-b border-slate-800 pb-1 flex justify-between">
                      <span>Dịch vụ Vận chuyển Xe máy</span>
                      <span className="text-amber-500 font-black">850.000đ</span>
                    </h4>
                    <p>Tuyến hỏa tải Thanh Hóa, Vinh (Yêu cầu xe tải nhỏ riêng)</p>
                    <span className="text-[10px] bg-amber-500/15 text-amber-500 px-2 py-0.5 rounded font-bold uppercase tracking-wider">Xác nhận tay</span>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
