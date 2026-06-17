import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  ClipboardList,
  ExternalLink,
  FileSearch,
  MapPin,
  Menu,
  MessageSquare,
  PackageCheck,
  Phone,
  Route,
  Send,
  Settings,
  ShieldCheck,
  Truck,
  Users,
  WalletCards,
  X,
} from "lucide-react";
import { ITEM_TYPE_LABELS, ItemType, STATUS_LABELS } from "./lib/constants/enums";
import type { MapsAddress, Order, PublicTrackingInfo, RouteEstimate } from "./lib/types";
import { PROVINCES_MAP } from "./lib/constants/routes";

type View = "home" | "order" | "tracking" | "routes" | "pricing" | "policy" | "contact" | "admin" | "seo";

const hotline = "0345 07 6789";

const navItems: Array<{ view: View; label: string }> = [
  { view: "home", label: "Trang chủ" },
  { view: "order", label: "Tạo đơn" },
  { view: "tracking", label: "Tra cứu đơn" },
  { view: "routes", label: "Tuyến dịch vụ" },
  { view: "pricing", label: "Bảng giá" },
  { view: "policy", label: "Chính sách" },
  { view: "contact", label: "Liên hệ" },
];

const itemOptions = Object.values(ItemType);

function App() {
  const [view, setView] = useState<View>(() => (window.location.pathname === "/" ? "home" : "seo"));
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    document.title = "Chuyển Phát 24H - Chuyển phát hỏa tốc liên tỉnh";
  }, []);

  return (
    <div className="min-h-screen bg-[#f7f8fb] text-slate-950">
      <Header view={view} setView={(next) => { setView(next); setMobileOpen(false); }} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      <main>
        {view === "home" && <HomePage setView={setView} />}
        {view === "order" && <OrderPage />}
        {view === "tracking" && <TrackingPage />}
        {view === "routes" && <RoutesPage />}
        {view === "pricing" && <PricingPage />}
        {view === "policy" && <PolicyPage />}
        {view === "contact" && <ContactPage />}
        {view === "admin" && <AdminPage />}
        {view === "seo" && <SeoPage setView={setView} />}
      </main>
      <Footer setView={setView} />
    </div>
  );
}

function Header({
  view,
  setView,
  mobileOpen,
  setMobileOpen,
}: {
  view: View;
  setView: (view: View) => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}) {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <button className="flex items-center gap-3" onClick={() => setView("home")}>
          <span className="flex h-10 w-10 items-center justify-center rounded bg-red-600 text-white">
            <Truck className="h-5 w-5" />
          </span>
          <span className="text-left">
            <span className="block text-lg font-black uppercase tracking-wide">Chuyển Phát 24H</span>
            <span className="hidden text-xs font-semibold text-slate-500 sm:block">Không chờ gom kho, hàng đi theo tuyến xe đang chạy</span>
          </span>
        </button>

        <nav className="hidden items-center gap-1 lg:flex">
          {navItems.map((item) => (
            <button
              key={item.view}
              onClick={() => setView(item.view)}
              className={`rounded px-3 py-2 text-sm font-semibold transition ${view === item.view ? "bg-slate-950 text-white" : "text-slate-700 hover:bg-slate-100"}`}
            >
              {item.label}
            </button>
          ))}
          <button onClick={() => setView("admin")} className="rounded px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50">
            Admin
          </button>
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <a className="flex items-center gap-2 text-sm font-black text-red-700" href="tel:0345076789">
            <Phone className="h-4 w-4" />
            {hotline}
          </a>
          <button onClick={() => setView("order")} className="rounded bg-amber-400 px-4 py-2 text-sm font-black text-slate-950 hover:bg-amber-300">
            Tạo đơn nhanh
          </button>
        </div>

        <button className="rounded border border-slate-200 p-2 lg:hidden" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Mở menu">
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-slate-200 bg-white px-4 py-3 lg:hidden">
          <div className="grid gap-2">
            {navItems.map((item) => (
              <button key={item.view} onClick={() => setView(item.view)} className="rounded px-3 py-2 text-left text-sm font-semibold hover:bg-slate-100">
                {item.label}
              </button>
            ))}
            <button onClick={() => setView("admin")} className="rounded px-3 py-2 text-left text-sm font-semibold text-red-700 hover:bg-red-50">
              Admin
            </button>
          </div>
        </div>
      )}
    </header>
  );
}

function HomePage({ setView }: { setView: (view: View) => void }) {
  return (
    <>
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8 lg:py-14">
          <div className="flex flex-col justify-center">
            <div className="mb-5 inline-flex w-fit items-center gap-2 rounded border border-red-200 bg-red-50 px-3 py-1 text-xs font-black uppercase tracking-wide text-red-700">
              <PackageCheck className="h-4 w-4" />
              Chuyển phát liên tỉnh 2 chiều
            </div>
            <h1 className="text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
              Chuyển Phát 24H
            </h1>
            <p className="mt-4 max-w-xl text-base font-medium leading-7 text-slate-600">
              Nhận tận nơi, giao tận tay từ Hà Nội đi các tỉnh và từ tỉnh về Hà Nội. Hàng đi theo tuyến xe dịch vụ đang chạy, không chờ gom kho.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <button onClick={() => setView("order")} className="inline-flex items-center justify-center gap-2 rounded bg-red-600 px-5 py-3 text-sm font-black text-white hover:bg-red-700">
                Tạo đơn gửi hàng
                <ArrowRight className="h-4 w-4" />
              </button>
              <a href="https://zalo.me/0345076789" target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 rounded border border-slate-300 bg-white px-5 py-3 text-sm font-black text-slate-900 hover:bg-slate-50">
                Zalo {hotline}
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
            <div className="mt-8 grid grid-cols-3 gap-4 border-t border-slate-200 pt-6 text-sm">
              <Metric value="2-4h" label="Tuyến gần Hà Nội" />
              <Metric value="24h" label="Tuyến xa đến Nghệ An" />
              <Metric value="Mock" label="Maps + Zalo MVP" />
            </div>
          </div>
          <QuickOrderForm compact />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            ["Không chờ gom kho", "Đơn được phân tuyến theo xe dịch vụ đang chạy, giảm thời gian trung chuyển."],
            ["Điều phối thật", "Admin xác nhận giá, gợi ý group Zalo, duyệt tài xế nhận đơn."],
            ["Tra cứu công khai", "Khách chỉ thấy trạng thái public, không lộ group Zalo hay ghi chú nội bộ."],
          ].map(([title, desc]) => (
            <div key={title} className="rounded border border-slate-200 bg-white p-5">
              <CheckCircle2 className="mb-4 h-6 w-6 text-emerald-600" />
              <h3 className="font-black">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <DriverJoinSection />
    </>
  );
}

function Metric({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="text-2xl font-black text-slate-950">{value}</div>
      <div className="mt-1 text-xs font-bold uppercase tracking-wide text-slate-500">{label}</div>
    </div>
  );
}

function OrderPage() {
  return (
    <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-3xl font-black">Tạo đơn chuyển phát nhanh</h1>
        <p className="mt-2 text-sm font-medium text-slate-600">Form đầy đủ cho MVP đang dùng Maps Adapter mock và service tạo đơn nội bộ.</p>
      </div>
      <QuickOrderForm />
    </section>
  );
}

function QuickOrderForm({ compact = false }: { compact?: boolean }) {
  const [pickupQuery, setPickupQuery] = useState("Cau Giay, Ha Noi");
  const [deliveryQuery, setDeliveryQuery] = useState("TP Bac Ninh, Bac Ninh");
  const [pickupSuggestions, setPickupSuggestions] = useState<MapsAddress[]>([]);
  const [deliverySuggestions, setDeliverySuggestions] = useState<MapsAddress[]>([]);
  const [pickupPlaceId, setPickupPlaceId] = useState("mock-cau-giay");
  const [deliveryPlaceId, setDeliveryPlaceId] = useState("mock-bac-ninh");
  const [itemType, setItemType] = useState<ItemType>(ItemType.DOCUMENT);
  const [expectedDeliveryTime, setExpectedDeliveryTime] = useState("Trong 2-4 giờ");
  const [customerPhone, setCustomerPhone] = useState("0912345678");
  const [estimate, setEstimate] = useState<RouteEstimate | null>(null);
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/maps/autocomplete?q=${encodeURIComponent(pickupQuery)}`).then((res) => res.json()).then(setPickupSuggestions).catch(() => undefined);
  }, [pickupQuery]);

  useEffect(() => {
    fetch(`/api/maps/autocomplete?q=${encodeURIComponent(deliveryQuery)}`).then((res) => res.json()).then(setDeliverySuggestions).catch(() => undefined);
  }, [deliveryQuery]);

  async function estimateRoute() {
    setLoading(true);
    setError("");
    setCreatedOrder(null);
    try {
      const res = await fetch("/api/orders/estimate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pickupAddress: pickupQuery,
          pickupPlaceId,
          deliveryAddress: deliveryQuery,
          deliveryPlaceId,
          itemType,
          expectedDeliveryTime,
          customerPhone,
        }),
      });
      if (!res.ok) throw new Error("Không thể ước tính tuyến");
      setEstimate(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  }

  async function createOrder() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/orders/quick-create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pickupAddress: pickupQuery,
          pickupPlaceId,
          deliveryAddress: deliveryQuery,
          deliveryPlaceId,
          itemType,
          expectedDeliveryTime,
          customerPhone,
        }),
      });
      if (!res.ok) throw new Error("Không thể tạo đơn");
      setCreatedOrder(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={`rounded border border-slate-200 bg-white p-5 shadow-sm ${compact ? "" : "p-6"}`}>
      <div className="mb-5">
        <h2 className="text-xl font-black">Tạo đơn chuyển phát nhanh</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Nhập điểm lấy và điểm giao, hệ thống sẽ tự xác định tuyến, thời gian dự kiến và phương án xử lý phù hợp.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <AddressInput label="Điểm lấy hàng" value={pickupQuery} onChange={setPickupQuery} suggestions={pickupSuggestions} onSelect={(address) => { setPickupQuery(address.label); setPickupPlaceId(address.placeId); }} />
        <AddressInput label="Điểm giao hàng" value={deliveryQuery} onChange={setDeliveryQuery} suggestions={deliverySuggestions} onSelect={(address) => { setDeliveryQuery(address.label); setDeliveryPlaceId(address.placeId); }} />
        <label className="block">
          <span className="text-xs font-black uppercase tracking-wide text-slate-500">Loại hàng</span>
          <select value={itemType} onChange={(event) => setItemType(event.target.value as ItemType)} className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm font-semibold">
            {itemOptions.map((type) => (
              <option key={type} value={type}>{ITEM_TYPE_LABELS[type]}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-xs font-black uppercase tracking-wide text-slate-500">Thời gian cần giao</span>
          <select value={expectedDeliveryTime} onChange={(event) => setExpectedDeliveryTime(event.target.value)} className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm font-semibold">
            <option>Càng sớm càng tốt</option>
            <option>Trong 2-4 giờ</option>
            <option>Trong ngày</option>
            <option>Trong 24h</option>
            <option>Theo lịch hẹn</option>
          </select>
        </label>
        <label className="block sm:col-span-2">
          <span className="text-xs font-black uppercase tracking-wide text-slate-500">Số điện thoại/Zalo khách</span>
          <input value={customerPhone} onChange={(event) => setCustomerPhone(event.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm font-semibold" />
        </label>
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <button onClick={estimateRoute} disabled={loading} className="inline-flex items-center justify-center gap-2 rounded bg-slate-950 px-4 py-2.5 text-sm font-black text-white disabled:opacity-60">
          <Route className="h-4 w-4" />
          Ước tính tuyến & tạo đơn
        </button>
        {estimate && (
          <button onClick={createOrder} disabled={loading} className="inline-flex items-center justify-center gap-2 rounded bg-red-600 px-4 py-2.5 text-sm font-black text-white disabled:opacity-60">
            <Send className="h-4 w-4" />
            {estimate.ctaText}
          </button>
        )}
      </div>

      {error && <p className="mt-4 rounded border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p>}
      {estimate && <RouteEstimateCard estimate={estimate} />}
      {createdOrder && <OrderCreatedCard order={createdOrder} />}
    </div>
  );
}

function AddressInput({
  label,
  value,
  onChange,
  suggestions,
  onSelect,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  suggestions: MapsAddress[];
  onSelect: (address: MapsAddress) => void;
}) {
  return (
    <label className="block">
      <span className="text-xs font-black uppercase tracking-wide text-slate-500">{label}</span>
      <input value={value} onChange={(event) => onChange(event.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm font-semibold" />
      <div className="mt-2 flex flex-wrap gap-2">
        {suggestions.slice(0, 3).map((address) => (
          <button key={address.placeId} type="button" onClick={() => onSelect(address)} className="rounded border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-bold text-slate-700 hover:bg-amber-50">
            {address.label}
          </button>
        ))}
      </div>
    </label>
  );
}

function RouteEstimateCard({ estimate }: { estimate: RouteEstimate }) {
  return (
    <div className="mt-5 rounded border border-amber-200 bg-amber-50 p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-wide text-amber-700">RouteEstimateCard</p>
          <h3 className="mt-1 text-lg font-black">{estimate.routeName}</h3>
          <p className="mt-1 text-sm font-semibold text-slate-700">{estimate.publicMessage}</p>
        </div>
        <span className="rounded bg-white px-3 py-1 text-xs font-black text-slate-800">{estimate.statusText}</span>
      </div>
      <div className="mt-4 grid gap-3 text-sm sm:grid-cols-4">
        <Info label="Chiều vận chuyển" value={estimate.direction} />
        <Info label="Thời gian dự kiến" value={estimate.serviceLevel} />
        <Info label="Khoảng cách" value={estimate.distanceKm ? `${estimate.distanceKm} km` : "Đang kiểm tra"} />
        <Info label="Giá tạm tính" value={estimate.estimatedPrice ? `${estimate.estimatedPrice.toLocaleString("vi-VN")}đ` : "Báo giá thủ công"} />
      </div>
    </div>
  );
}

function OrderCreatedCard({ order }: { order: Order }) {
  return (
    <div className="mt-5 rounded border border-emerald-200 bg-emerald-50 p-4">
      <h3 className="text-lg font-black text-emerald-800">Đã tiếp nhận yêu cầu gửi hàng</h3>
      <p className="mt-2 text-sm font-semibold text-slate-700">Mã đơn: <span className="font-black">{order.orderCode}</span></p>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="rounded border border-emerald-300 bg-white px-4 py-2 text-sm font-black text-emerald-800">
          Tra cứu đơn
        </button>
        <a href="tel:0345076789" className="rounded bg-emerald-700 px-4 py-2 text-center text-sm font-black text-white">
          Gọi/Zalo {hotline}
        </a>
      </div>
    </div>
  );
}

function Info({ label, value }: { key?: React.Key; label: string; value?: React.ReactNode }) {
  return (
    <div className="rounded border border-slate-200 bg-white p-3">
      <div className="text-xs font-black uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-1 font-black text-slate-950">{value || "-"}</div>
    </div>
  );
}

function RoutesPage() {
  const groups = [
    ["Tuyến gần Hà Nội - 2-4 giờ", ["Bắc Ninh", "Hưng Yên", "Vĩnh Phúc", "Hà Nam", "Hải Dương", "Thái Nguyên", "Bắc Giang", "Hòa Bình"]],
    ["Tuyến trong ngày / 24h", ["Hải Phòng", "Quảng Ninh", "Ninh Bình", "Nam Định", "Thái Bình", "Phú Thọ", "Tuyên Quang", "Lạng Sơn"]],
    ["Tuyến Tây Bắc - cần xác nhận lịch xe", ["Yên Bái", "Lào Cai", "Sơn La", "Lai Châu"]],
    ["Thanh Hóa / Nghệ An - trong ngày / 24h", ["Thanh Hóa", "Nghệ An"]],
  ];
  return (
    <PageShell title="Tuyến dịch vụ" desc="Chỉ phục vụ các tuyến 2 chiều từ Hà Nội đi tỉnh và từ tỉnh về Hà Nội trong danh sách. Không có tuyến Hà Nội - Điện Biên.">
      <div className="grid gap-4">
        {groups.map(([title, provinces]) => (
          <div key={title as string} className="rounded border border-slate-200 bg-white p-5">
            <h2 className="font-black">{title}</h2>
            <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {(provinces as string[]).map((province) => (
                <div key={province} className="rounded border border-slate-200 bg-slate-50 p-3 text-sm font-bold">
                  Hà Nội ↔ {province}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </PageShell>
  );
}

function PricingPage() {
  return (
    <PageShell title="Bảng giá" desc="Giá dưới đây là ước tính MVP. Hàng cồng kềnh, xe máy, tivi, tủ lạnh, máy giặt và hàng quá khổ luôn cần báo giá thủ công.">
      <div className="grid gap-4 md:grid-cols-3">
        <Price title="Giấy tờ / hồ sơ" price="Từ 150.000đ" desc="Tuyến gần có thể 2-4 giờ." />
        <Price title="Hàng nhỏ / hàng shop" price="Từ 190.000đ" desc="Tuyến trong ngày hoặc 24h." />
        <Price title="Xe máy / hàng cồng kềnh" price="Báo giá thủ công" desc="Admin xác nhận kích thước, xe phù hợp và lịch bốc dỡ." />
      </div>
    </PageShell>
  );
}

function Price({ title, price, desc }: { title: string; price: string; desc: string }) {
  return (
    <div className="rounded border border-slate-200 bg-white p-5">
      <WalletCards className="mb-4 h-6 w-6 text-red-600" />
      <h2 className="font-black">{title}</h2>
      <p className="mt-3 text-2xl font-black">{price}</p>
      <p className="mt-2 text-sm leading-6 text-slate-600">{desc}</p>
    </div>
  );
}

function TrackingPage() {
  const [orderCode, setOrderCode] = useState("CP24H-20260617-0130");
  const [phone, setPhone] = useState("0912345678");
  const [tracking, setTracking] = useState<PublicTrackingInfo | null>(null);
  const [message, setMessage] = useState("");

  async function lookup() {
    setMessage("");
    setTracking(null);
    const res = await fetch("/api/orders/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderCode, phone }),
    });
    const data = await res.json();
    if (!res.ok) return setMessage(data.message || "Không tìm thấy đơn");
    setTracking(data);
  }

  return (
    <PageShell title="Tra cứu đơn" desc="Khách chỉ thấy thông tin public: trạng thái, timeline, hotline và tài xế nếu admin cho phép.">
      <div className="rounded border border-slate-200 bg-white p-5">
        <div className="grid gap-4 sm:grid-cols-3">
          <input value={orderCode} onChange={(event) => setOrderCode(event.target.value)} className="rounded border border-slate-300 px-3 py-2 text-sm font-semibold sm:col-span-1" placeholder="Mã đơn" />
          <input value={phone} onChange={(event) => setPhone(event.target.value)} className="rounded border border-slate-300 px-3 py-2 text-sm font-semibold sm:col-span-1" placeholder="Số điện thoại" />
          <button onClick={lookup} className="rounded bg-slate-950 px-4 py-2 text-sm font-black text-white">Tra cứu</button>
        </div>
        {message && <p className="mt-4 rounded border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">{message}</p>}
        {tracking && (
          <div className="mt-5 rounded border border-slate-200 bg-slate-50 p-4">
            <div className="flex flex-col justify-between gap-3 sm:flex-row">
              <div>
                <h2 className="text-xl font-black">{tracking.orderCode}</h2>
                <p className="mt-1 text-sm font-semibold text-slate-600">{tracking.routeName} · {tracking.itemType}</p>
              </div>
              <span className="h-fit rounded bg-emerald-100 px-3 py-1 text-sm font-black text-emerald-800">{tracking.statusLabel}</span>
            </div>
            <div className="mt-5 grid gap-3">
              {tracking.publicTimeline.map((event) => (
                <div key={event.id} className="rounded border border-slate-200 bg-white p-3">
                  <div className="font-black">{event.title}</div>
                  <p className="mt-1 text-sm text-slate-600">{event.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </PageShell>
  );
}

function AdminPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState("");
  const [preview, setPreview] = useState<any[]>([]);
  const selectedOrder = useMemo(() => orders.find((order) => order.id === selectedOrderId), [orders, selectedOrderId]);

  useEffect(() => {
    fetch("/api/orders").then((res) => res.json()).then((data) => {
      setOrders(data);
      setSelectedOrderId(data[0]?.id || "");
    });
  }, []);

  async function previewDispatch() {
    if (!selectedOrder) return;
    const res = await fetch("/api/dispatch/preview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId: selectedOrder.id }),
    });
    setPreview(await res.json());
  }

  async function sendDispatch() {
    if (!selectedOrder) return;
    await fetch("/api/dispatch/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId: selectedOrder.id }),
    });
    const refreshed = await fetch("/api/orders").then((res) => res.json());
    setOrders(refreshed);
    await previewDispatch();
  }

  const stats = [
    ["Tổng đơn hôm nay", orders.length],
    ["Chờ xác nhận", orders.filter((order) => order.status === "PENDING_CONFIRMATION").length],
    ["Sẵn sàng bán Zalo", orders.filter((order) => order.dispatchStatus === "NOT_DISPATCHED").length],
    ["Đang giao", orders.filter((order) => ["IN_TRANSIT", "DELIVERY_IN_PROGRESS"].includes(order.status)).length],
  ];

  return (
    <section className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[260px_1fr] lg:px-8">
      <aside className="rounded border border-slate-200 bg-white p-4">
        {["Dashboard", "Đơn hàng", "Điều phối Zalo", "Nhóm Zalo tuyến", "Tuyến xe", "Đối tác đội xe", "Khách hàng", "Bảng giá", "Nội dung SEO", "Cài đặt"].map((item) => (
          <div key={item} className="rounded px-3 py-2 text-sm font-black text-slate-700 hover:bg-slate-50">{item}</div>
        ))}
      </aside>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-black">Admin Dashboard</h1>
          <p className="mt-2 text-sm font-medium text-slate-600">Quản lý đơn, điều phối Zalo mock, đối tác và dữ liệu vận hành MVP.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-4">
          {stats.map(([label, value]) => <Info key={label as string} label={label as string} value={String(value)} />)}
        </div>
        <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
          <div className="rounded border border-slate-200 bg-white p-5">
            <h2 className="mb-4 flex items-center gap-2 font-black"><ClipboardList className="h-5 w-5 text-red-600" /> Đơn hàng</h2>
            <div className="grid gap-3">
              {orders.map((order) => (
                <button key={order.id} onClick={() => setSelectedOrderId(order.id)} className={`rounded border p-3 text-left text-sm ${selectedOrderId === order.id ? "border-red-300 bg-red-50" : "border-slate-200 bg-white"}`}>
                  <div className="font-black">{order.orderCode}</div>
                  <div className="mt-1 text-slate-600">{order.routeName} · {STATUS_LABELS[order.status]}</div>
                </button>
              ))}
            </div>
          </div>
          <div className="rounded border border-slate-200 bg-white p-5">
            <h2 className="mb-4 flex items-center gap-2 font-black"><Bot className="h-5 w-5 text-red-600" /> Điều phối Zalo</h2>
            {selectedOrder ? (
              <div>
                <div className="rounded border border-slate-200 bg-slate-50 p-3 text-sm">
                  <div className="font-black">{selectedOrder.orderCode}</div>
                  <div className="mt-1 text-slate-600">{selectedOrder.pickupProvince} → {selectedOrder.deliveryProvince}</div>
                  <div className="mt-1 text-slate-600">Suggested groups: {selectedOrder.suggestedZaloGroups.join(", ") || "Đang tạo preview"}</div>
                </div>
                <div className="mt-4 flex gap-3">
                  <button onClick={previewDispatch} className="rounded border border-slate-300 px-4 py-2 text-sm font-black">Preview tin bot</button>
                  <button onClick={sendDispatch} className="rounded bg-red-600 px-4 py-2 text-sm font-black text-white">Gửi vào group Zalo</button>
                </div>
                {preview[0] && (
                  <pre className="mt-4 max-h-96 overflow-auto whitespace-pre-wrap rounded bg-slate-950 p-4 text-xs leading-5 text-slate-100">
                    {preview[0].messageContent}
                  </pre>
                )}
              </div>
            ) : <p className="text-sm text-slate-500">Chưa có đơn.</p>}
          </div>
        </div>
      </div>
    </section>
  );
}

function DriverJoinSection() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    vehicleType: "Xe 7 chỗ",
    vehiclePlate: "",
    usualRoutes: "Ha Noi <-> Bac Ninh",
    provinces: "Bac Ninh",
    canCarryBulkyGoods: false,
    note: "",
  });

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    await fetch("/api/partner-applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSubmitted(true);
  }

  return (
    <section className="border-y border-slate-200 bg-slate-950 text-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_420px] lg:px-8">
        <div>
          <p className="text-xs font-black uppercase tracking-wide text-amber-300">Tham Gia Đội Xe Chuyển Phát 24H</p>
          <h2 className="mt-3 text-3xl font-black">Có xe chạy tuyến tỉnh? Cùng Chuyển Phát 24H nhận thêm đơn mỗi ngày</h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">
            Chúng tôi đang mở rộng mạng lưới đối tác xe dịch vụ, xe hợp đồng, xe bán tải, xe tải nhỏ và tài xế thường xuyên chạy tuyến Hà Nội ↔ các tỉnh. Đơn hàng được gửi vào nhóm Zalo theo từng tuyến để tài xế khớp hành trình chủ động nhận đơn.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {["Không cần chờ khách lẻ", "Tận dụng chuyến xe đang chạy", "Nhận đơn theo tuyến quen thuộc", "Có điều phối hỗ trợ", "Bot AI gửi đơn qua Zalo", "Phù hợp xe 4 chỗ, 7 chỗ, bán tải, tải nhỏ"].map((item) => (
              <div key={item} className="flex items-center gap-2 text-sm font-bold text-slate-200">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                {item}
              </div>
            ))}
          </div>
        </div>
        <form onSubmit={submit} className="rounded border border-slate-700 bg-slate-900 p-5">
          {submitted ? (
            <div className="rounded border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm font-bold text-emerald-200">Đã tiếp nhận đăng ký đối tác đội xe.</div>
          ) : (
            <div className="grid gap-3">
              {[
                ["name", "Họ tên"],
                ["phone", "Số điện thoại/Zalo"],
                ["vehicleType", "Loại xe"],
                ["vehiclePlate", "Biển số"],
                ["usualRoutes", "Tuyến thường chạy"],
                ["provinces", "Tỉnh/khu vực nhận đơn"],
              ].map(([key, label]) => (
                <input key={key} value={(form as any)[key]} onChange={(event) => setForm({ ...form, [key]: event.target.value })} className="rounded border border-slate-700 bg-slate-950 px-3 py-2 text-sm font-semibold text-white" placeholder={label} />
              ))}
              <label className="flex items-center gap-2 text-sm font-bold">
                <input type="checkbox" checked={form.canCarryBulkyGoods} onChange={(event) => setForm({ ...form, canCarryBulkyGoods: event.target.checked })} />
                Có nhận hàng cồng kềnh
              </label>
              <textarea value={form.note} onChange={(event) => setForm({ ...form, note: event.target.value })} className="rounded border border-slate-700 bg-slate-950 px-3 py-2 text-sm font-semibold text-white" placeholder="Ghi chú" />
              <button className="rounded bg-amber-400 px-4 py-2 text-sm font-black text-slate-950">Gửi đăng ký</button>
            </div>
          )}
        </form>
      </div>
    </section>
  );
}

function PolicyPage() {
  return (
    <PageShell title="Chính sách" desc="Quy định vận hành MVP cho dịch vụ chuyển phát hỏa tốc liên tỉnh.">
      <div className="rounded border border-slate-200 bg-white p-5 text-sm leading-7 text-slate-700">
        <p>Không nhận hàng cấm, hàng vi phạm pháp luật. Hàng giá trị cao cần khai báo và có thể yêu cầu bảo hiểm.</p>
        <p className="mt-3">Hàng cồng kềnh, xe máy, tivi, tủ lạnh, máy giặt và hàng quá khổ phải báo giá thủ công.</p>
      </div>
    </PageShell>
  );
}

function ContactPage() {
  return (
    <PageShell title="Liên hệ" desc="Đội điều phối hỗ trợ báo giá, tạo đơn và kiểm tra tuyến.">
      <div className="grid gap-4 md:grid-cols-3">
        <Contact icon={<Phone />} title="Hotline/Zalo" value={hotline} />
        <Contact icon={<MapPin />} title="Khu vực chính" value="Hà Nội đi tỉnh và tỉnh về Hà Nội" />
        <Contact icon={<MessageSquare />} title="Điều phối" value="Mock Zalo group theo tuyến" />
      </div>
    </PageShell>
  );
}

function Contact({ icon, title, value }: { icon: React.ReactNode; title: string; value: string }) {
  return (
    <div className="rounded border border-slate-200 bg-white p-5">
      <div className="mb-3 h-6 w-6 text-red-600">{icon}</div>
      <h2 className="font-black">{title}</h2>
      <p className="mt-2 text-sm font-semibold text-slate-600">{value}</p>
    </div>
  );
}

function SeoPage({ setView }: { setView: (view: View) => void }) {
  return (
    <PageShell title="Chuyển phát hỏa tốc liên tỉnh" desc="Trang SEO placeholder cho các slug dịch vụ. Nội dung dùng chung trong MVP và có thể tách thành từng landing page khi triển khai SEO thật.">
      <div className="rounded border border-slate-200 bg-white p-5">
        <p className="text-sm leading-7 text-slate-700">
          Chuyển Phát 24H nhận tận nơi, giao tận tay theo tuyến xe đang chạy từ Hà Nội đi Bắc Ninh, Hải Phòng, Quảng Ninh, Ninh Bình, Thanh Hóa, Nghệ An và các tỉnh trong danh sách phục vụ.
        </p>
        <button onClick={() => setView("order")} className="mt-5 rounded bg-red-600 px-4 py-2 text-sm font-black text-white">Tạo đơn ngay</button>
      </div>
    </PageShell>
  );
}

function PageShell({ title, desc, children }: { title: string; desc: string; children: React.ReactNode }) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-3xl font-black">{title}</h1>
        <p className="mt-2 max-w-3xl text-sm font-medium leading-6 text-slate-600">{desc}</p>
      </div>
      {children}
    </section>
  );
}

function Footer({ setView }: { setView: (view: View) => void }) {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 text-sm text-slate-600 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div>
          <div className="font-black text-slate-950">CHUYỂN PHÁT 24H</div>
          <div>chuyenphat24h.com · chuyenphat24h.vn · Hotline/Zalo {hotline}</div>
        </div>
        <div className="flex flex-wrap gap-3">
          <button onClick={() => setView("order")} className="font-bold hover:text-red-700">Tạo đơn</button>
          <button onClick={() => setView("tracking")} className="font-bold hover:text-red-700">Tra cứu đơn</button>
          <a href="tel:0345076789" className="font-bold hover:text-red-700">Gọi/Zalo {hotline}</a>
        </div>
      </div>
    </footer>
  );
}

export default App;
