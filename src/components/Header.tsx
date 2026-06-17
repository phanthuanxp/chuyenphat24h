import React from "react";
import { Phone, CheckCircle2, UserCheck, ShieldAlert, Truck } from "lucide-react";

interface HeaderProps {
  currentView: string;
  setView: (view: string) => void;
}

export default function Header({ currentView, setView }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-slate-900 border-b border-slate-800 text-white shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-20">
          {/* Logo Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setView("home")}>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-tr from-amber-500 to-rose-600 rounded-lg flex items-center justify-center shadow-lg shadow-orange-500/20">
              <Truck className="w-6 h-6 sm:w-7 sm:h-7 text-white animate-pulse" />
            </div>
            <div>
              <span className="text-lg sm:text-2xl font-black tracking-tight bg-gradient-to-r from-orange-400 via-amber-200 to-white bg-clip-text text-transparent">
                CHUYỂN PHÁT 24H
              </span>
              <p className="text-[10px] sm:text-xs text-orange-400 font-bold uppercase tracking-widest hidden sm:block">
                Hỏa Tốc Liên Tỉnh • Không Chờ Gom Kho
              </p>
            </div>
          </div>

          {/* Desktop Navigation links */}
          <nav className="hidden lg:flex items-center space-x-7 text-sm font-semibold text-slate-300">
            <button 
              onClick={() => setView("home")}
              className={`hover:text-amber-400 transition-colors ${currentView === "home" ? "text-amber-400 border-b-2 border-amber-400 pb-1" : ""}`}
            >
              Trang chủ
            </button>
            <button 
              onClick={() => setView("routes")}
              className={`hover:text-amber-400 transition-colors ${currentView === "routes" ? "text-amber-400 border-b-2 border-amber-400 pb-1" : ""}`}
            >
              Tuyến phục vụ
            </button>
            <button 
              onClick={() => setView("pricing")}
              className={`hover:text-amber-400 transition-colors ${currentView === "pricing" ? "text-amber-400 border-b-2 border-amber-400 pb-1" : ""}`}
            >
              Bảng giá
            </button>
            <button 
              onClick={() => setView("tracking")}
              className={`hover:text-amber-400 transition-colors ${currentView === "tracking" ? "text-amber-400 border-b-2 border-amber-400 pb-1" : ""}`}
            >
              Tra cứu đơn
            </button>
            <button 
              onClick={() => setView("driver")}
              className={`flex items-center space-x-1 px-3 py-1 bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 hover:text-teal-300 transition-all rounded ${currentView === "driver" ? "ring-2 ring-teal-500" : ""}`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Tài xế</span>
            </button>
            <button 
              onClick={() => setView("admin")}
              className={`flex items-center space-x-1 px-3 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 transition-all rounded ${currentView === "admin" ? "ring-2 ring-rose-500" : ""}`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Quản trị</span>
            </button>
          </nav>

          {/* Contact and Booking Action Button */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            <a 
              href="https://zalo.me/0345076789" 
              target="_blank" 
              rel="noreferrer"
              className="flex items-center space-x-1.5 px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 border border-blue-400/20 text-white text-xs sm:text-sm font-bold rounded-full shadow-lg transition-transform hover:-translate-y-0.5"
            >
              <span className="w-2 h-2 rounded-full bg-green-400 animate-ping"></span>
              <span>Zalo hỗ trợ</span>
            </a>
            
            <a 
              href="tel:0345076789"
              className="hidden md:flex items-center space-x-1.5 text-amber-400 hover:text-amber-300 transition-colors font-black text-sm"
            >
              <Phone className="w-4 h-4 text-orange-500 fill-orange-500 animate-bounce" />
              <span>0345 07 6789</span>
            </a>

            <button 
              onClick={() => setView("booking")}
              className="bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-400 hover:from-orange-600 hover:to-amber-500 text-slate-950 px-4 py-2 sm:px-6 sm:py-2.5 text-xs sm:text-sm font-black uppercase tracking-wider rounded-lg shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 hover:scale-[1.03] transition-all"
            >
              Tạo Đơn Hàng
            </button>
          </div>
        </div>

        {/* Mobile Navigation bar summary */}
        <div className="flex lg:hidden justify-around items-center py-2.5 border-t border-slate-800/80 text-xs font-bold text-slate-400 scrolling-touch">
          <button onClick={() => setView("home")} className={`hover:text-amber-400 ${currentView === "home" ? "text-amber-400" : ""}`}>Trang chủ</button>
          <button onClick={() => setView("routes")} className={`hover:text-amber-400 ${currentView === "routes" ? "text-amber-400" : ""}`}>Các Tuyến</button>
          <button onClick={() => setView("pricing")} className={`hover:text-amber-400 ${currentView === "pricing" ? "text-amber-400" : ""}`}>Bảng Giá</button>
          <button onClick={() => setView("tracking")} className={`hover:text-amber-400 ${currentView === "tracking" ? "text-amber-400" : ""}`}>Tra Cứu</button>
          <button onClick={() => setView("driver")} className={`text-teal-400 ${currentView === "driver" ? "underline decoration-2" : ""}`}>Lái Xe</button>
          <button onClick={() => setView("admin")} className={`text-rose-400 ${currentView === "admin" ? "underline decoration-2" : ""}`}>Admin</button>
        </div>
      </div>
    </header>
  );
}
