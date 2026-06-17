import React, { useState, useEffect } from "react";
import { 
  Truck, User, Star, Phone, MapPin, CheckCircle2, ChevronRight, 
  Camera, PlusCircle, Navigation, AlertTriangle, CloudRain 
} from "lucide-react";
import { Order, OrderStatus, OrderStatusLabels, OrderStatusColors } from "../types";

export default function DriverPanel() {
  const [selectedDriverId, setSelectedDriverId] = useState<string>("D-02");
  const [assignedOrders, setAssignedOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showPhotoUploadModal, setShowPhotoUploadModal] = useState<boolean>(false);
  const [currentActiveUploadOrderId, setCurrentActiveUploadOrderId] = useState<string | null>(null);
  const [mockPhotoSelected, setMockPhotoSelected] = useState<string>("");

  useEffect(() => {
    fetchDriverOrders();
  }, [selectedDriverId]);

  const fetchDriverOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/orders");
      const data: Order[] = await res.json();
      
      // Filter orders assigned to current simulated driver
      // For demonstration sake, if they are D-02 (Trần Văn B), they get ORD-001 (which is assigned to D-02).
      // We also map outstanding orders that are empty of drivers to let drivers self-claim them optionally!
      const filtered = data.filter(o => o.assignedDriverId === selectedDriverId || !o.assignedDriverId);
      setAssignedOrders(filtered);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleProgressStatus = async (orderId: string, currentStatus: OrderStatus) => {
    let nextStatus: OrderStatus = currentStatus;

    // Sequential workflow progression logic
    if (currentStatus === OrderStatus.ASSIGNED) {
      nextStatus = OrderStatus.PICKUP_IN_PROGRESS;
    } else if (currentStatus === OrderStatus.PICKUP_IN_PROGRESS) {
      nextStatus = OrderStatus.PICKED_UP;
    } else if (currentStatus === OrderStatus.PICKED_UP) {
      nextStatus = OrderStatus.IN_TRANSIT;
    } else if (currentStatus === OrderStatus.IN_TRANSIT) {
      nextStatus = OrderStatus.ARRIVED_DESTINATION;
    } else if (currentStatus === OrderStatus.ARRIVED_DESTINATION) {
      nextStatus = OrderStatus.DELIVERY_IN_PROGRESS;
    } else if (currentStatus === OrderStatus.DELIVERY_IN_PROGRESS) {
      // Trigger Photo upload overlay before setting to DELIVERED
      setCurrentActiveUploadOrderId(orderId);
      setMockPhotoSelected("https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=600&h=400");
      setShowPhotoUploadModal(true);
      return;
    }

    await saveStatusUpdate(orderId, nextStatus);
  };

  const saveStatusUpdate = async (orderId: string, status: OrderStatus) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        setAssignedOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleClaimOrder = async (orderId: string) => {
    const updates = {
      assignedDriverId: selectedDriverId,
      status: OrderStatus.ASSIGNED
    };

    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        setAssignedOrders(prev => prev.map(o => o.id === orderId ? { ...o, ...updates } : o));
        alert("🎉 Đã nhận lãnh bàn điều phối đơn hàng này thành công. Hãy bắt đầu hành trình ngay bấy giờ!");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const submitPhotoReceipt = async () => {
    if (currentActiveUploadOrderId) {
      await saveStatusUpdate(currentActiveUploadOrderId, OrderStatus.DELIVERED);
      setShowPhotoUploadModal(false);
      setCurrentActiveUploadOrderId(null);
      alert("🎉 Đơn hàng đã được xác định hoàn tất thành công! Ảnh biên lai rước hàng giao trả đã đồng bộ về bảng của admin.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 text-slate-100">
      
      {/* simulated auth cockpit */}
      <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl mb-8 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-xl">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 bg-teal-500/10 border border-teal-500/30 rounded-full flex items-center justify-center text-teal-400">
            <Truck className="w-6 h-6 animate-bounce" />
          </div>
          <div>
            <h2 className="font-extrabold text-base sm:text-lg text-slate-100">Đại Sảnh Thực Nghiệm Lái Xe</h2>
            <p className="text-xs text-slate-500 mt-0.5">Chọn tài khoản tài xế giả lập để xem đơn hàng được gán chuyến</p>
          </div>
        </div>

        <div>
          <select
            value={selectedDriverId}
            onChange={(e) => setSelectedDriverId(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-lg text-xs sm:text-sm font-semibold py-2 px-4 focus:outline-none focus:ring-1 focus:ring-teal-500 text-slate-200"
          >
            <option value="D-01">Tài xế Nguyễn Văn A (Hà Nội - Ninh Bình)</option>
            <option value="D-02">Tài xế Trần Văn B (Hà Nội - Hải Phòng)</option>
            <option value="D-03">Tài xế Lê Văn C (Hà Nội - Quảng Ninh)</option>
            <option value="D-04">Tài xế Phạm Văn D (Hàng Cồng Kềnh / Xe máy)</option>
            <option value="D-05">Tài xế Đỗ Văn E (Bắc Ninh / Hưng Yên)</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="py-24 text-center text-slate-400 text-sm">
          Đang nạp bưu thầu phân rải...
        </div>
      ) : (
        <div className="space-y-6">
          
          <h3 className="font-extrabold text-sm uppercase text-slate-400 tracking-wider">
            Danh sách Hành Trình Hôm Nay của Bạn ({assignedOrders.length} đơn)
          </h3>

          {assignedOrders.length === 0 ? (
            <div className="bg-slate-950 border border-slate-800/80 p-12 rounded-2xl text-center text-slate-500 space-y-2">
              <Star className="w-10 h-10 text-slate-700 mx-auto" />
              <p className="text-sm font-bold">Chưa có bưu gửi được ghép cho bạn hôm nay.</p>
              <p className="text-xs max-w-sm mx-auto">Vui lòng đợi ban điều vận tại bến xe hỏa tốc gán tuyến, hoặc theo dõi cập nhật đơn hàng mới.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {assignedOrders.map((order) => {
                const colorClass = OrderStatusColors[order.status] || "bg-slate-850 text-slate-300";
                const isClaimedByMe = order.assignedDriverId === selectedDriverId;

                return (
                  <div 
                    key={order.id} 
                    className={`bg-slate-950 border rounded-2xl p-5 shadow-lg flex flex-col justify-between transition-all ${
                      isClaimedByMe ? "border-slate-800" : "border-slate-800/40 opacity-70 border-dashed"
                    }`}
                  >
                    {/* Top connection details header */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-3 border-b border-slate-900 mb-4 gap-2">
                      <div>
                        <span className="text-yellow-400 font-extrabold text-xs sm:text-base tracking-wide">{order.orderCode}</span>
                        <p className="text-[10px] text-slate-400 mt-0.5">Sản phẩm: {order.itemType} | Trọng lượng: {order.weight}kg</p>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span className="text-slate-500 text-[10px] sm:text-xs">Tiến trình:</span>
                        <span className={`px-2.5 py-0.5 text-[10px] sm:text-xs font-bold rounded ${colorClass}`}>
                          {OrderStatusLabels[order.status]}
                        </span>
                      </div>
                    </div>

                    {/* Pickup vs Delivery coordinates */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm text-slate-300 pb-4 mb-4 border-b border-slate-900">
                      <div>
                        <span className="text-[10px] text-orange-400 uppercase font-bold tracking-wider flex items-center">
                          <MapPin className="w-3.5 h-3.5 text-orange-500 mr-1" />
                          Điểm rước lấy hàng (SĐT: {order.senderPhone})
                        </span>
                        <p className="font-bold text-slate-200 mt-1">{order.senderName}</p>
                        <p className="text-slate-400 text-xs mt-0.5">{order.pickupAddress}, Quận {order.pickupDistrict}, {order.pickupProvince}</p>
                      </div>

                      <div>
                        <span className="text-[10px] text-green-400 uppercase font-bold tracking-wider flex items-center">
                          <CheckCircle2 className="w-3.5 h-3.5 text-green-500 mr-1" />
                          Điểm giao trả hàng (SĐT: {order.receiverPhone})
                        </span>
                        <p className="font-bold text-slate-200 mt-1">{order.receiverName}</p>
                        <p className="text-slate-400 text-xs mt-0.5">{order.deliveryAddress}, Quận {order.deliveryDistrict}, {order.deliveryProvince}</p>
                      </div>
                    </div>

                    {/* Operational driver actions */}
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                      {/* client call simulation quick shortcut triggers */}
                      <div className="flex space-x-2.5 w-full sm:w-auto">
                        <a 
                          href="tel:0345076789"
                          onClick={() => alert(`Simulate: Gọi điện cho người gửi -> ${order.senderName} (${order.senderPhone})`)}
                          className="flex-grow sm:flex-grow-0 p-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded text-slate-300 transition-colors flex items-center justify-center space-x-1"
                        >
                          <Phone className="w-3.5 h-3.5 text-orange-400 fill-orange-400" />
                          <span className="text-[11px] font-bold">Gọi Người Gửi</span>
                        </a>
                        <a 
                          href="tel:0345076789"
                          onClick={() => alert(`Simulate: Gọi điện cho người nhận -> ${order.receiverName} (${order.receiverPhone})`)}
                          className="flex-grow sm:flex-grow-0 p-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded text-slate-300 transition-colors flex items-center justify-center space-x-1"
                        >
                          <Phone className="w-3.5 h-3.5 text-green-400 fill-green-400" />
                          <span className="text-[11px] font-bold">Gọi Người Nhận</span>
                        </a>
                      </div>

                      {/* Main action handler */}
                      <div className="w-full sm:w-auto text-right">
                        {isClaimedByMe ? (
                          order.status === OrderStatus.DELIVERED ? (
                            <span className="text-green-400 text-xs font-bold flex items-center justify-end">
                              <CheckCircle2 className="w-4 h-4 mr-1 text-green-400 fill-green-400" />
                              Đã hoàn thành bàn giao
                            </span>
                          ) : (
                            <button
                              onClick={() => handleProgressStatus(order.id, order.status)}
                              className="w-full sm:w-auto bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 text-slate-950 font-black text-xs uppercase tracking-wider py-2.5 px-6 rounded-lg transition-all shadow-md active:scale-95 flex items-center justify-center space-x-1.5 cursor-pointer"
                            >
                              <span>
                                {order.status === OrderStatus.ASSIGNED && "Khởi hành đi lấy bưu gửi"}
                                {order.status === OrderStatus.PICKUP_IN_PROGRESS && "Đã cầm hàng lên tay"}
                                {order.status === OrderStatus.PICKED_UP && "Bắt đầu lên cốp đi tỉnh"}
                                {order.status === OrderStatus.IN_TRANSIT && "Xếp hàng bến trả tỉnh bốc dỡ"}
                                {order.status === OrderStatus.ARRIVED_DESTINATION && "Khởi hành giao tận tay"}
                                {order.status === OrderStatus.DELIVERY_IN_PROGRESS && "Xác nhận đã giao xong"}
                              </span>
                              <ChevronRight className="w-4 h-4 text-slate-950" />
                            </button>
                          )
                        ) : (
                          <button
                            onClick={() => handleClaimOrder(order.id)}
                            className="w-full sm:w-auto bg-slate-100 hover:bg-white text-slate-950 font-black text-xs uppercase tracking-wider py-2.5 px-6 rounded-lg transition-all shadow cursor-pointer"
                          >
                            Nhận Bàn Giao Thầu Đơn Này
                          </button>
                        )}
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Simulated delivery snapshot upload modal */}
      {showPhotoUploadModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-slate-800 max-w-md w-full rounded-2xl p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-900 pb-3">
              <div className="flex items-center space-x-2">
                <Camera className="w-5 h-5 text-teal-400" />
                <span className="font-extrabold text-sm uppercase text-slate-100">Ký Giao Biên Nhận (Ảnh Số)</span>
              </div>
              <button 
                onClick={() => setShowPhotoUploadModal(false)}
                className="text-slate-500 text-sm hover:text-slate-300 font-bold"
              >
                Đóng
              </button>
            </div>

            <p className="text-xs text-slate-400 leading-normal">
              Chụp ảnh bằng camera của bạn để tải lên xác nhận trạng thái bưu kiện nguyên đai nguyên kiện cho doanh nghiệp.
            </p>

            {/* Display simulated photo */}
            {mockPhotoSelected && (
              <div className="relative rounded-lg overflow-hidden border border-slate-800 shadow-inner">
                <img src={mockPhotoSelected} alt="Simulated Snapshot" className="w-full h-42 object-cover" />
                <div className="absolute inset-x-0 bottom-0 bg-black/60 p-2 text-center text-[10px] text-green-400 font-mono font-bold">
                  ✓ Photo_Timestamp_LatLon_Simulation.jpg
                </div>
              </div>
            )}

            <button
              onClick={submitPhotoReceipt}
              className="w-full py-2.5 bg-green-500 hover:bg-green-400 text-slate-950 font-black text-xs sm:text-sm uppercase rounded transition-colors cursor-pointer"
            >
              Nộp ảnh biên lại & Bàn giao Hoàn tất
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
