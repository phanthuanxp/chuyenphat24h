/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import Header from "./components/Header";
import Hero from "./components/Hero";
import RoutesSlider from "./components/RoutesSlider";
import BookingForm from "./components/BookingForm";
import TrackingSection from "./components/TrackingSection";
import AdminPanel from "./components/AdminPanel";
import DriverPanel from "./components/DriverPanel";
import AIChatBot from "./components/AIChatBot";

import { 
  CheckCircle, ArrowRight, ShieldCheck, HelpCircle, 
  Phone, MessageSquare, PlusSquare, MapPin, Truck, Award 
} from "lucide-react";

export default function App() {
  const [view, setView] = useState<string>("home");
  const [initialBookingData, setInitialBookingData] = useState<any>(null);
  
  // State for FAQ Accordion
  const [faqOpen, setFaqOpen] = useState<Record<number, boolean>>({
    0: true
  });

  const toggleFaq = (idx: number) => {
    setFaqOpen(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const handleQuickBooking = (data: any) => {
    setInitialBookingData(data);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col justify-between">
      
      {/* Scroll-pinned navigation header */}
      <Header currentView={view} setView={setView} />

      {/* Main interactive screen contents */}
      <main className="flex-grow pb-20 sm:pb-12">
        {view === "home" && (
          <div className="space-y-0">
            {/* Landing Hero & Calculator */}
            <Hero setView={setView} onQuickBooking={handleQuickBooking} />

            {/* Live Schedule Runs ("Tuyến xe đang chạy hôm nay") */}
            <RoutesSlider setView={setView} onQuickBooking={handleQuickBooking} />

            {/* Differential advantages blocks section */}
            <section className="py-16 bg-slate-950 border-b border-slate-800">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center space-y-3 mb-16">
                  <span className="text-orange-500 text-xs font-black uppercase tracking-widest bg-orange-500/10 border border-orange-500/20 px-3 py-1 rounded-full">
                    Sự khác biệt vượt trội
                  </span>
                  <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
                    Không Thể Ghép Kho? Có Xe Di Chuyển Ngay!
                  </h2>
                  <p className="text-slate-400 text-xs sm:text-base max-w-2xl mx-auto">
                    Thay vì buộc bưu gửi phải qua 3-4 kho bãi trung chuyển phân loại gây chậm hỏng hóc, dịch vụ của chúng tôi gá hành trình trực tiếp theo cốp xe.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-xl space-y-4">
                    <div className="w-10 h-10 bg-orange-500/10 border border-orange-500/20 rounded-lg flex items-center justify-center text-orange-400 font-bold">1</div>
                    <h3 className="font-extrabold text-sm sm:text-base text-slate-100">Rút ngắn thời gian tới 3 lần</h3>
                    <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-semibold">
                      Chuyến đi xuất bến từ Hà Nội cứ sau mỗi 1-2 tiếng. Đối với Bắc Ninh, Hưng Yên hay Hà Nam, bưu kiện được rước rải chỉ trong khoảng từ 2-4 tiếng tận cơ quan.
                    </p>
                  </div>

                  <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-xl space-y-4">
                    <div className="w-10 h-10 bg-orange-500/10 border border-orange-500/20 rounded-lg flex items-center justify-center text-orange-400 font-bold">2</div>
                    <h3 className="font-extrabold text-sm sm:text-base text-slate-100">Hàng hoá nguyên vẹn tối đa</h3>
                    <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-semibold">
                      Bởi vì bưu kiện nằm yên trong một khoang xe riêng từ gốc đến ngọn, tỷ lệ xước sát, móp méo va đập gần như bằng không. Phù hợp tuyệt vời cho tivi điện máy và xe máy.
                    </p>
                  </div>

                  <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-xl space-y-4">
                    <div className="w-10 h-10 bg-orange-500/10 border border-orange-500/20 rounded-lg flex items-center justify-center text-orange-400 font-bold">3</div>
                    <h3 className="font-extrabold text-sm sm:text-base text-slate-100">Hỗ trợ chăm sóc thật 100%</h3>
                    <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-semibold">
                      Mỗi cung đường của bạn đều có bộ phận kiểm soát tại bến xe bám sát hành trình. Có số điện thoại trực tiếp của lái xe trao đổi, không thông qua tổng đài tự động trả lời sẵn.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Support cargo catalog bento grid section */}
            <section className="py-16 bg-slate-900/70 border-b border-slate-800">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center space-y-3 mb-12">
                  <h2 className="text-2xl sm:text-4xl font-extrabold text-white">Vật Phẩm Nhận Vận Chuyển</h2>
                  <p className="text-slate-400 text-xs sm:text-base">Mọi mặt hàng hợp pháp cần vận hành hỏa tốc trong ngày</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { title: "Hồ sơ, Giấy tờ thầu", desc: "Giấy tờ đóng túi kín niêm phong chữ ký bảo mật giao nộp hỏa đơn thầu." },
                    { title: "Bưu kiện nhỏ gọn", desc: "Quà tặng, phụ kiện thời trang, áo quần phục vụ giao gấp lấy nhanh." },
                    { title: "Laptop, Đồ công nghệ", desc: "Mặt điện dung cao cấp đóng hộp đệm rơm chống xóc an toàn bưu phẩm." },
                    { title: "Vận chuyển Xe máy", desc: "Đặt xe máy liên tỉnh bọc mút bảo vệ xước sát, rút kiệt xăng phòng hộ và giao tận ngõ." },
                    { title: "Tivi, Tủ điện lớn", desc: "Có bửng nâng hạ tự động, thùng bọc nắp kín chống mưa hoàn tất an tâm." },
                    { title: "Hành lý quá khổ", desc: "Vận thầu liên kết cồng kềnh xe tải gác riêng theo lịch hẹn trước." }
                  ].map((x, idx) => (
                    <div key={idx} className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-1.5 flex flex-col justify-between">
                      <span className="text-slate-200 font-black text-sm sm:text-base flex items-center space-x-1">
                        <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mr-1.5"></span>
                        {x.title}
                      </span>
                      <p className="text-xs text-slate-400 leading-relaxed font-medium">{x.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Service steps flowchart section */}
            <section className="py-16 bg-slate-950 border-b border-slate-800">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center space-y-3 mb-16">
                  <h2 className="text-2xl sm:text-4xl font-extrabold">Quy Trình 4 Bước Hoạt Động</h2>
                  <p className="text-slate-400 text-sm">Nhanh chóng - Tiện lợi - Khép kín tuyệt đối</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
                  {[
                    { num: "01", title: "Tạo đơn", desc: "Nhập thông tin bưu kiện và địa bàn giao nhận qua app nhanh chóng và tiện lợi." },
                    { num: "02", title: "Xác nhận báo", desc: "Tài xế trung ương khớp xe đang chạy trống khoang gọi xác minh giá tối ưu." },
                    { num: "03", title: "Rước gom hàng tại nhà", desc: "Lái xe di chuyển rước tận thềm cửa hoặc bến showroom ròng rẻ." },
                    { num: "04", title: "Bàn giao tận tay", desc: "Giao tận tay người thâu chụp ảnh kỹ lưỡng đồng bộ hóa receipt an tâm." }
                  ].map((st, idx) => (
                    <div key={idx} className="text-center space-y-3.5 relative">
                      <span className="text-4xl sm:text-5xl font-black bg-gradient-to-br from-orange-500 to-rose-600 bg-clip-text text-transparent opacity-85">{st.num}</span>
                      <h4 className="font-extrabold text-slate-200 text-sm sm:text-base">{st.title}</h4>
                      <p className="text-xs text-slate-400 max-w-[200px] mx-auto leading-relaxed font-semibold">{st.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Interactive FAQs list accordion */}
            <section className="py-16 bg-slate-900/60 border-b border-slate-800">
              <div className="max-w-4xl mx-auto px-4">
                <div className="text-center space-y-3 mb-12">
                  <h2 className="text-2xl sm:text-4xl font-extrabold">Hỏi Đáp Thường Gặp (FAQs)</h2>
                  <p className="text-slate-400 text-sm">Cung cấp thông tin tường tận minh bạch bưu chính</p>
                </div>

                <div className="space-y-3">
                  {[
                    { q: "Mô hình Không Gom Kho là gì?", a: "Khác biệt hoàn toàn với bưu điện truyền thống phải gom hàng đưa về bưu cục vùng phân chọn, Chuyển Phát 24h gá trực tiếp bưu phẩm của quý khách lên thùng sau xe limousine chở khách hoặc bán tải liên tỉnh chạy cố định lăn bánh liên tiếp. Nhờ vậy thời gian chuyển phát thẳng lùi gấp 3 lần." },
                    { q: "Có nhận vận chuyển đi Điện Biên hay không?", a: "Dạ thành thực xin lỗi quý khách, để đảm bảo cam kết thời vận hỏa tốc tối đa, Chuyển Phát 24H hiện chưa triển khai phục vụ các tuyến đi/về thành phố Điện Biên và Điện Biên Phủ miền Tây Bắc xa xôi. Các cung Tây Bắc xa nhất mà chúng tôi đang phục vụ ổn định gồm Lào Cai, Sơn La và Lai Châu." },
                    { q: "Quy chuẩn bồi thường bảo hiểm thế nào?", a: "Nếu quý khách đăng ký dịch vụ bảo hành giá trị khi đóng góp, Chuyển Phát 24H cam kết chịu trách nhiệm mua bồi hoàn 100% tài sản nguyên giá thị trường khai báo nếu bưu gửi xảy ra hư hao tổn thương." },
                    { q: "Hàng hóa cồng kềnh quá cỡ có quy định gì?", a: "Với mặt hàng kích thước to lớn (Tivi, Máy giặt, Xe máy điện, Phụ tùng máy kéo Gara), hệ thống AI của website sẽ nhận dạng và chuyển giao cho tổng đài viên liên lạc ròng rào, hỗ trợ báo mức giá đặc hữu riêng để bảo đảm lái xe có bửng nâng kéo nâng hạ thích hợp." }
                  ].map((f, idx) => (
                    <div key={idx} className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden transition-all text-xs sm:text-sm">
                      <button
                        onClick={() => toggleFaq(idx)}
                        className="w-full text-left p-4 sm:p-5 font-extrabold flex justify-between items-center text-slate-200 cursor-pointer"
                      >
                        <span className="flex items-center">
                          <HelpCircle className="w-4 h-4 text-orange-500 mr-2 flex-shrink-0" />
                          {f.q}
                        </span>
                        <span className="text-orange-500 font-black">{faqOpen[idx] ? "−" : "+"}</span>
                      </button>
                      
                      {faqOpen[idx] && (
                        <div className="p-4 sm:p-5 pt-0 border-t border-slate-900 text-slate-400 leading-relaxed font-semibold">
                          {f.a}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>
        )}

        {/* STEP 2: Booking Flow tab screen */}
        {view === "booking" && (
          <BookingForm 
            initialData={initialBookingData} 
            setView={setView} 
            onOrderCreated={(o) => {
              // Redirect or store order tracking
            }}
          />
        )}

        {/* STEP 3: Tracking lookup */}
        {view === "tracking" && <TrackingSection />}

        {/* STEP 4: Detail of Provinces & leads page */}
        {view === "routes" && (
          <div className="max-w-7xl mx-auto px-4 py-12 text-slate-200">
            <div className="text-center space-y-3 mb-12">
              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">Khu Vực Tuyến Chuyển Phát 24H</h1>
              <p className="text-slate-400 text-sm max-w-xl mx-auto">Chúng tôi kết nối luân phiên liên tục mạng lưới Hà Nội và các tỉnh thành trọng yếu</p>
            </div>

            <div className="space-y-8">
              {/* Nhóm 1 */}
              <div className="bg-slate-950 border border-slate-800/80 p-5 rounded-xl space-y-4 shadow">
                <span className="inline-block text-[11px] bg-red-500/10 text-rose-400 font-black border border-red-500/20 px-3 py-1 rounded-full uppercase tracking-wider">
                  ⚡ NHÓM 1: TUYẾN SIÊU TỐC GẦN HÀ NỘI — 2 ĐẾN 4 GIỜ
                </span>
                <p className="text-slate-400 text-xs sm:text-sm">Áp dụng giao nhanh nhất cho bưu phẩm gọn, giấy thầu công ty, thư tín chuyển khoản:</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-semibold">
                  {["Bắc Ninh", "Hưng Yên", "Vĩnh Phúc", "Hà Nam", "Hải Dương", "Thái Nguyên", "Bắc Giang", "Hòa Bình"].map((item, idx) => (
                    <div key={idx} className="bg-slate-900 border border-slate-850 p-4 rounded-lg flex justify-between items-center">
                      <div>
                        <span className="font-bold text-slate-100">Hà Nội ↔ {item}</span>
                        <p className="text-[10px] text-orange-400 font-extrabold mt-0.5">Tiến trình: 2–4 giờ</p>
                      </div>
                      <button onClick={() => { handleQuickBooking({ province: item }); setView("booking"); }} className="text-[10px] bg-slate-950 hover:bg-orange-500 hover:text-slate-950 border border-orange-500/30 font-black px-2 py-1 rounded">Đặt ngay</button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Nhóm 2 */}
              <div className="bg-slate-950 border border-slate-800/80 p-5 rounded-xl space-y-4 shadow">
                <span className="inline-block text-[11px] bg-indigo-500/10 text-indigo-400 font-black border border-indigo-500/20 px-3 py-1 rounded-full uppercase tracking-wider">
                  ⏱ NHÓM 2: TUYẾN TRONG NGÀY QUANH HÀ NỘI
                </span>
                <p className="text-slate-400 text-xs sm:text-sm">Giao từ 4 đến 8 tiếng theo lịch trình cố hành trong buổi sáng chiều:</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-semibold">
                  {["Hải Phòng", "Quảng Ninh", "Ninh Bình", "Nam Định", "Thái Bình", "Phú Thọ", "Tuyên Quang", "Lạng Sơn"].map((item, idx) => (
                    <div key={idx} className="bg-slate-900 border border-slate-850 p-4 rounded-lg flex justify-between items-center">
                      <div>
                        <span className="font-bold text-slate-100">Hà Nội ↔ {item}</span>
                        <p className="text-[10px] text-amber-400 font-extrabold mt-0.5">Tiến trình: Trong ngày</p>
                      </div>
                      <button onClick={() => { handleQuickBooking({ province: item }); setView("booking"); }} className="text-[10px] bg-slate-950 hover:bg-orange-500 hover:text-slate-950 border border-orange-500/30 font-black px-2 py-1 rounded">Đặt ngay</button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Nhóm 3 */}
              <div className="bg-slate-950 border border-slate-800/80 p-5 rounded-xl space-y-4 shadow">
                <span className="inline-block text-[11px] bg-amber-500/10 text-amber-500 font-black border border-amber-500/20 px-3 py-1 rounded-full uppercase tracking-wider">
                  ⛰ NHÓM 3: TUYẾN TÂY BẮC — THEO LỊCH XE / 24H
                </span>
                <p className="text-slate-400 text-xs sm:text-sm">Cung xa khó di chuyển, bưu tá cần đối liên hệ rã xe limousine cụ thể trước:</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-semibold">
                  {["Yên Bái", "Lào Cai (Sapa)", "Sơn La", "Lai Châu"].map((item, idx) => (
                    <div key={idx} className="bg-slate-900 border border-slate-850 p-4 rounded-lg flex justify-between items-center">
                      <div>
                        <span className="font-bold text-slate-100">Hà Nội ↔ {item}</span>
                        <p className="text-[10px] text-red-400 font-extrabold mt-0.5">Cần Xác Nhận</p>
                      </div>
                      <button onClick={() => { handleQuickBooking({ province: item }); setView("booking"); }} className="text-[10px] bg-slate-950 hover:bg-orange-500 hover:text-slate-950 border border-orange-500/30 font-black px-2 py-1 rounded">Đặt ngay</button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Nhóm 4 */}
              <div className="bg-slate-950 border border-slate-800/80 p-5 rounded-xl space-y-4 shadow">
                <span className="inline-block text-[11px] bg-green-500/10 text-green-400 font-black border border-green-500/20 px-3 py-1 rounded-full uppercase tracking-wider">
                  🛣 NHÓM 4: TUYẾN PHÍA NAM / BẮC TRUNG BỘ
                </span>
                <p className="text-slate-400 text-xs sm:text-sm">Chạy dọc Quốc lộ 1A kết nối Nghệ An là mấu chốt xa nhất phía nam:</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-semibold">
                  {["Thanh Hóa", "Nghệ An"].map((item, idx) => (
                    <div key={idx} className="bg-slate-900 border border-slate-850 p-4 rounded-lg flex justify-between items-center">
                      <div>
                        <span className="font-bold text-slate-100">Hà Nội ↔ {item}</span>
                        <p className="text-[10px] text-green-400 font-extrabold mt-0.5">Tiến trình: Trong 24h</p>
                      </div>
                      <button onClick={() => { handleQuickBooking({ province: item }); setView("booking"); }} className="text-[10px] bg-slate-950 hover:bg-orange-500 hover:text-slate-950 border border-orange-500/30 font-black px-2 py-1 rounded">Đặt ngay</button>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* STEP 5: Pricing sheet details */}
        {view === "pricing" && (
          <div className="max-w-4xl mx-auto px-4 py-12 text-slate-200">
            <div className="text-center space-y-3 mb-12">
              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">Biểu Phí Chuyển Phát Hỏa Tốc</h1>
              <p className="text-slate-400 text-sm">Giao nhận minh bạch tận nơi, cước cố định cam kết không thu thêm</p>
            </div>

            <div className="space-y-6">
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 shadow">
                <h4 className="font-black text-sm uppercase text-slate-300 mb-4 pb-2 border-b border-slate-900">Bảng giá cước quy định ước tính</h4>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2.5 border-b border-slate-900 text-xs sm:text-sm">
                    <div>
                      <span className="font-bold text-slate-100">Hợp đồng, Giấy tờ thầu, Bì thư hỏa cực</span>
                      <p className="text-[10px] text-slate-500 mt-0.5">Bảo mật tuyệt đối, ưu tiên kẹp khoang lạnh chạy ngay</p>
                    </div>
                    <span className="font-black text-orange-400 text-base">Từ 120.000đ - 180.000đ</span>
                  </div>

                  <div className="flex justify-between items-center py-2.5 border-b border-slate-900 text-xs sm:text-sm">
                    <div>
                      <span className="font-bold text-slate-100">Bưu phẩm nhỏ gọn nhẹ (Dưới 5k)</span>
                      <p className="text-[10px] text-slate-500 mt-0.5">An tâm vận chuyển hộp quà, trang quần thời trang</p>
                    </div>
                    <span className="font-black text-orange-400 text-base">Từ 150.000đ - 190.000đ</span>
                  </div>

                  <div className="flex justify-between items-center py-2.5 border-b border-slate-900 text-xs sm:text-sm">
                    <div>
                      <span className="font-bold text-slate-100">Dịch vụ giao gửi Xe máy đi tỉnh</span>
                      <p className="text-[10px] text-slate-500 mt-0.5">Rút xăng ròng, bọc xốp kỹ góc dập tránh xước sát</p>
                    </div>
                    <span className="font-black text-orange-400 text-base">Từ 850.000đ (Báo chi tiết)</span>
                  </div>

                  <div className="flex justify-between items-center py-2.5 text-xs sm:text-sm text-yellow-500 font-extrabold bg-amber-500/5 p-3 rounded border border-amber-500/10">
                    <p>⚠️ GHI CHÚ QUANG TRỌNG:</p>
                    <p className="text-slate-300 font-semibold text-xs mt-1 leading-normal">
                      Các mặt hàng điện máy nặng (Tivi 55inch trở lên, Tủ lạnh đứng, Máy giặt, Cabin tủ gỗ) 
                      sẽ được ban điều vận gọi trao đổi trực tiếp thống nhất báo giá bốc xếp trước khi đưa xe đến lấy.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 6: Admin Dashboard */}
        {view === "admin" && <AdminPanel />}

        {/* STEP 7: Driver portal */}
        {view === "driver" && <DriverPanel />}
      </main>

      {/* Footer layout parameters */}
      <footer className="bg-slate-900 border-t border-slate-800 text-slate-500 py-12 text-center text-xs space-y-4">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-4 text-slate-400">
          <div>
            <span className="text-sm font-black text-slate-100">CHUYỂN PHÁT 24H CO., LTD</span>
            <p className="text-xs text-slate-500 mt-1">Dịch vụ giao xe liên tỉnh hỏa tốc không gom kho hàng đầu Việt Nam</p>
          </div>

          <div className="flex space-x-6 text-xs font-semibold">
            <button onClick={() => setView("home")} className="hover:text-amber-400">Trang chủ</button>
            <button onClick={() => setView("routes")} className="hover:text-amber-400">Các Tuyến</button>
            <button onClick={() => setView("pricing")} className="hover:text-amber-400">Cước phí</button>
            <button onClick={() => setView("tracking")} className="hover:text-amber-400">Tra cứu</button>
            <a href="tel:0345076789" className="hover:text-amber-400">Lợi ích gọi Hotline</a>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-850/80 max-w-7xl mx-auto text-[10px] text-slate-600 font-medium">
          © {new Date().getFullYear()} chuyenphat24h.vn & chuyenphat24h.com - Bản quyền được bảo vệ chặt chẽ trên toàn lãnh thổ Việt Nam. Hotline duy nhất: 0345 07 6789.
        </div>
      </footer>

      {/* Floating AI Consultant Assistant */}
      <AIChatBot />

      {/* Mobile-pinned sticky communication bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-950 border-t border-slate-850 p-2 text-slate-200 flex justify-around items-center gap-2">
        <a 
          href="tel:0345076789" 
          className="flex-1 bg-rose-600 hover:bg-rose-500 py-2.5 rounded font-black text-xs uppercase tracking-wider text-center flex items-center justify-center space-x-1"
        >
          <Phone className="w-4 h-4 text-white fill-white" />
          <span>Gọi Ngay</span>
        </a>

        <a 
          href="https://zalo.me/0345076789" 
          target="_blank" 
          rel="noreferrer"
          className="flex-1 bg-blue-600 hover:bg-blue-500 py-2.5 rounded font-black text-xs uppercase tracking-wider text-center flex items-center justify-center space-x-1"
        >
          <MessageSquare className="w-4 h-4 text-white fill-white" />
          <span>Zalo Chat</span>
        </a>

        <button 
          onClick={() => setView("booking")} 
          className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 py-2.5 rounded font-black text-xs uppercase tracking-wider text-center flex items-center justify-center space-x-1"
        >
          <PlusSquare className="w-4 h-4 text-slate-950" />
          <span>Tạo Đơn Gấp</span>
        </button>
      </div>

    </div>
  );
}
