import React, { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Bot,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Clock3,
  Download,
  ExternalLink,
  FileSearch,
  ImagePlus,
  Layers3,
  LayoutDashboard,
  Lock,
  MapPin,
  Menu,
  MessageSquare,
  PackageCheck,
  Phone,
  Route as RouteIcon,
  Search,
  Send,
  Settings,
  ShieldCheck,
  Sparkles,
  Truck,
  UserRoundCheck,
  Users,
  WalletCards,
  X,
} from "lucide-react";
import { ITEM_TYPE_LABELS, ItemType, OrderStatus, STATUS_LABELS } from "./lib/constants/enums";
import type { MapsAddress, Order, PublicTrackingInfo, RouteEstimate } from "./lib/types";
import { ThemeLanding } from "./components/ThemeLanding";
import { defaultThemeSettings, SiteThemeSettings } from "./lib/theme/themeTypes";
import { seoPages as defaultSeoPages, type SeoPage as SeoPageConfig } from "./lib/seo/seoPages";

type View = "home" | "order" | "tracking" | "routes" | "pricing" | "policy" | "contact" | "admin" | "seo";
type AdminModule = "dashboard" | "orders" | "dispatch" | "zalo" | "routes" | "partners" | "customers" | "pricing" | "seo" | "theme" | "settings";
type AdminOrderEditPayload = Partial<
  Pick<
    Order,
    | "senderName"
    | "senderPhone"
    | "pickupAddress"
    | "receiverName"
    | "receiverPhone"
    | "deliveryAddress"
    | "itemDescription"
    | "packageCount"
    | "weight"
    | "quotedPrice"
    | "finalPrice"
    | "customerTrackingNote"
  >
> & {
  status?: OrderStatus;
  operationNote?: string;
};

const hotline = "0345 07 6789";
const heroImage =
  "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=1400&q=80";

const navItems: Array<{ view: View; label: string }> = [
  { view: "home", label: "Trang chủ" },
  { view: "order", label: "Tạo đơn" },
  { view: "tracking", label: "Tra cứu" },
  { view: "routes", label: "Tuyến dịch vụ" },
  { view: "pricing", label: "Bảng giá" },
  { view: "policy", label: "Chính sách" },
  { view: "contact", label: "Liên hệ" },
];

const adminModules: Array<{ id: AdminModule; label: string; icon: React.ElementType }> = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "orders", label: "Đơn hàng", icon: ClipboardList },
  { id: "dispatch", label: "Điều phối Zalo", icon: Bot },
  { id: "zalo", label: "Nhóm Zalo tuyến", icon: MessageSquare },
  { id: "routes", label: "Tuyến xe", icon: RouteIcon },
  { id: "partners", label: "Đối tác đội xe", icon: UserRoundCheck },
  { id: "customers", label: "Khách hàng", icon: Users },
  { id: "pricing", label: "Bảng giá", icon: WalletCards },
  { id: "seo", label: "Nội dung SEO", icon: FileSearch },
  { id: "settings", label: "Cài đặt", icon: Settings },
];

const itemOptions = Object.values(ItemType);
adminModules.splice(adminModules.length - 1, 0, { id: "theme", label: "Theme web", icon: Sparkles });
const adminOrderStatusOptions = Array.from(new Set(Object.values(OrderStatus)));
const phoneHref = "tel:0345076789";
const viewPathMap: Record<string, View> = {
  "/": "home",
  "/tao-don": "order",
  "/tra-cuu": "tracking",
  "/tuyen-chuyen-phat": "routes",
  "/bang-gia": "pricing",
  "/chinh-sach": "policy",
  "/lien-he": "contact",
};

function getInitialView(): View {
  if (window.location.pathname === "/admincp") {
    return "admin";
  }

  return viewPathMap[window.location.pathname] || "seo";
}

function App() {
  const [view, setView] = useState<View>(getInitialView);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [themeSettings, setThemeSettings] = useState<SiteThemeSettings>(defaultThemeSettings);
  const [seoPageList, setSeoPageList] = useState<SeoPageConfig[]>(defaultSeoPages);
  const usesThemeLanding = view === "home";
  const usesPublicChrome = view !== "home" && view !== "admin";

  useEffect(() => {
    let active = true;
    fetch("/api/theme-settings")
      .then((res) => res.json())
      .then((theme: SiteThemeSettings) => {
        if (!active) return;
        const nextTheme = { ...defaultThemeSettings, ...theme };
        setThemeSettings(nextTheme);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    document.title = "Chuyển Phát 24H - Hỏa tốc liên tỉnh từ Hà Nội";
  }, []);

  useEffect(() => {
    let active = true;
    fetch("/api/seo-pages")
      .then((res) => res.json())
      .then((pages: SeoPageConfig[]) => {
        if (!active) return;
        if (Array.isArray(pages) && pages.length) setSeoPageList(pages);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const currentSeoPage = seoPageList.find((page) => `/${page.slug}` === window.location.pathname);
    const pageTitles: Record<View, string> = {
      home: `${themeSettings.brandName} - Chuyển phát hỏa tốc liên tỉnh`,
      order: `Tạo đơn chuyển phát - ${themeSettings.brandName}`,
      tracking: `Tra cứu đơn hàng - ${themeSettings.brandName}`,
      routes: `Tuyến chuyển phát - ${themeSettings.brandName}`,
      pricing: `Bảng giá chuyển phát - ${themeSettings.brandName}`,
      policy: `Chính sách dịch vụ - ${themeSettings.brandName}`,
      contact: `Liên hệ - ${themeSettings.brandName}`,
      admin: `AdminCP - ${themeSettings.brandName}`,
      seo: currentSeoPage?.title || `${themeSettings.brandName} - Chuyển phát hỏa tốc liên tỉnh`,
    };
    document.title = pageTitles[view];
  }, [seoPageList, themeSettings.brandName, view]);

  return (
    <div
      className="min-h-screen bg-[#f6f8fb] text-slate-950"
      style={{
        fontFamily: "'Be Vietnam Pro', system-ui, sans-serif",
        "--cp24h-primary": themeSettings.primaryColor,
        "--cp24h-secondary": themeSettings.secondaryColor,
        "--cp24h-accent": themeSettings.accentColor,
      } as React.CSSProperties}
    >
      {usesPublicChrome && (
        <Header
          view={view}
          theme={themeSettings}
          setView={(next) => {
            setView(next);
            setMobileOpen(false);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          mobileOpen={mobileOpen}
          setMobileOpen={setMobileOpen}
        />
      )}
      <main>
        {view === "home" && <ThemeLanding setView={setView} theme={themeSettings} />}
        {view === "order" && <OrderPage />}
        {view === "tracking" && <TrackingPage />}
        {view === "routes" && <RoutesPage />}
        {view === "pricing" && <PricingPage />}
        {view === "policy" && <PolicyPage />}
        {view === "contact" && <ContactPage />}
        {view === "admin" && <AdminPage theme={themeSettings} onThemeChange={setThemeSettings} seoPages={seoPageList} onSeoPagesChange={setSeoPageList} />}
        {view === "seo" && <SeoPage setView={setView} seoPages={seoPageList} />}
      </main>
      {usesPublicChrome && <Footer setView={setView} theme={themeSettings} />}
    </div>
  );
}

function Header({
  view,
  theme,
  setView,
  mobileOpen,
  setMobileOpen,
}: {
  view: View;
  theme: SiteThemeSettings;
  setView: (view: View) => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}) {
  const themedPhoneHref = `tel:${theme.hotline.replace(/\D/g, "")}`;
  const ctaGradient = `linear-gradient(180deg, #ff1b24, ${theme.primaryColor})`;
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 text-white shadow-[0_10px_30px_rgba(7,19,41,.18)] backdrop-blur" style={{ backgroundColor: `${theme.secondaryColor}f2` }}>
      <div className="mx-auto flex h-[78px] max-w-[1480px] items-center px-4 sm:px-6 lg:px-[10%]">
        <button className="mr-7 flex flex-none items-center gap-2 text-left" onClick={() => setView("home")}>
          <span className="flex h-[38px] w-[38px] flex-none items-center justify-center rounded-[10px] shadow-[0_6px_16px_rgba(0,87,184,.22)]" style={{ background: `linear-gradient(135deg, ${theme.accentColor}, ${theme.secondaryColor})` }}>
            <Truck className="h-6 w-6 text-white" />
          </span>
          <span className="text-left">
            <span className="block text-base font-extrabold tracking-wide text-white">{theme.brandShortName}</span>
            <span className="hidden text-xs font-semibold text-[#aebbcd] sm:block">{theme.tagline}</span>
          </span>
        </button>

        <nav className="hidden min-w-0 flex-1 items-center gap-1 text-[13px] font-medium lg:flex">
          {navItems.map((item) => (
            <button
              key={item.view}
              onClick={() => setView(item.view)}
              className={`rounded-md px-2.5 py-1.5 transition ${view === item.view ? "font-bold text-white" : "text-[#d0daea] hover:bg-white/10 hover:text-white"}`}
              style={view === item.view ? { backgroundColor: `${theme.primaryColor}33` } : undefined}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="ml-auto hidden flex-none items-center gap-3 lg:flex">
          <a className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/15 bg-white/10 transition hover:bg-white/15" href={themedPhoneHref} aria-label="Gọi hotline">
            <Phone className="h-4 w-4" style={{ color: theme.primaryColor }} />
          </a>
          <button onClick={() => setView("order")} className="rounded-lg px-4 py-2 text-xs font-bold tracking-wide text-white shadow-[0_8px_20px_rgba(227,6,19,.24)] transition hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(227,6,19,.34)]" style={{ background: ctaGradient }}>
            {theme.ctaPrimary}
          </button>
        </div>

        <button className="ml-auto rounded-lg border border-white/15 bg-white/10 p-2 lg:hidden" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Mở menu">
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-white/10 px-4 py-3 lg:hidden" style={{ backgroundColor: theme.secondaryColor }}>
          <div className="grid gap-2">
            {navItems.map((item) => (
              <button key={item.view} onClick={() => setView(item.view)} className={`rounded-lg px-3 py-2 text-left text-sm font-semibold ${view === item.view ? "text-white" : "text-[#d0daea] hover:bg-white/10"}`} style={view === item.view ? { backgroundColor: `${theme.primaryColor}33` } : undefined}>
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}

function HomePage({ setView }: { setView: (view: View) => void }) {
  return (
    <>
      <section className="bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_460px] lg:px-8 lg:py-12">
          <div className="overflow-hidden rounded border border-slate-200 bg-slate-950 text-white">
            <div className="grid min-h-[560px] lg:grid-cols-[1.05fr_0.95fr]">
              <div className="flex flex-col justify-between p-6 sm:p-8 lg:p-10">
                <div>
                  <div className="mb-5 inline-flex items-center gap-2 rounded border border-amber-300/30 bg-amber-300/10 px-3 py-1 text-xs font-black uppercase tracking-wide text-amber-200">
                    <Sparkles className="h-4 w-4" />
                    Không gom kho, không chờ trung chuyển
                  </div>
                  <h1 className="max-w-2xl text-4xl font-black leading-tight tracking-tight sm:text-5xl lg:text-6xl">
                    Chuyển phát hỏa tốc liên tỉnh từ Hà Nội
                  </h1>
                  <p className="mt-5 max-w-xl text-base font-medium leading-7 text-slate-300">
                    Nhận tận nơi, giao tận tay theo tuyến xe dịch vụ đang chạy. Tuyến gần có thể 2-4 giờ, tuyến xa trong ngày hoặc 24h, hàng đặc biệt được báo giá thủ công.
                  </p>
                  <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                    <button onClick={() => setView("order")} className="inline-flex items-center justify-center gap-2 rounded bg-red-600 px-5 py-3 text-sm font-black text-white hover:bg-red-500">
                      Tạo đơn gửi hàng
                      <ArrowRight className="h-4 w-4" />
                    </button>
                    <button onClick={() => setView("tracking")} className="inline-flex items-center justify-center gap-2 rounded border border-slate-600 bg-white/5 px-5 py-3 text-sm font-black text-white hover:bg-white/10">
                      Tra cứu đơn
                      <Search className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="mt-8 grid grid-cols-3 gap-3">
                  <HeroMetric value="2-4h" label="Bắc Ninh, Hưng Yên..." />
                  <HeroMetric value="24h" label="Xa nhất đến Nghệ An" />
                  <HeroMetric value="Zalo" label="Điều phối theo group" />
                </div>
              </div>
              <div className="relative min-h-[260px] border-t border-slate-800 lg:border-l lg:border-t-0">
                <img src={heroImage} alt="Xe tải giao hàng liên tỉnh" className="h-full w-full object-cover" />
                <div className="absolute bottom-4 left-4 right-4 rounded border border-white/20 bg-slate-950/80 p-4 backdrop-blur">
                  <div className="text-xs font-black uppercase tracking-wide text-amber-300">Đang ưu tiên</div>
                  <div className="mt-1 text-lg font-black">Hồ sơ, hàng shop, linh kiện, xe máy</div>
                  <p className="mt-2 text-xs leading-5 text-slate-300">Hàng cồng kềnh hoặc giá trị cao được chuyển sang báo giá thủ công.</p>
                </div>
              </div>
            </div>
          </div>
          <QuickOrderForm compact />
        </div>
      </section>

      <section className="border-y border-slate-200 bg-[#eef2f6]">
        <div className="mx-auto grid max-w-7xl gap-4 px-4 py-8 sm:px-6 md:grid-cols-4 lg:px-8">
          <ValueCard icon={Clock3} title="Giao nhanh đúng tuyến" desc="Tuyến gần Hà Nội có thể đi ngay trong 2-4 giờ." />
          <ValueCard icon={ShieldCheck} title="Không lộ dữ liệu nội bộ" desc="Tracking public chỉ hiển thị thông tin khách được phép xem." />
          <ValueCard icon={Bot} title="Gợi ý Zalo group" desc="AI mock phân loại tuyến và tạo nội dung bán đơn." />
          <ValueCard icon={UserRoundCheck} title="Admin duyệt tài xế" desc="Tài xế nhận đơn qua Zalo, admin là người duyệt cuối." />
        </div>
      </section>

      <RoutesPreview setView={setView} />
      <OperatingFlow />
      <DriverJoinSection />
    </>
  );
}

function HeroMetric({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded border border-slate-800 bg-white/5 p-3">
      <div className="text-2xl font-black text-white">{value}</div>
      <div className="mt-1 text-xs font-semibold leading-4 text-slate-400">{label}</div>
    </div>
  );
}

function ValueCard({ icon: Icon, title, desc }: { icon: React.ElementType; title: string; desc: string }) {
  return (
    <div className="rounded-2xl border border-[#eaeef4] bg-white p-5 shadow-[0_12px_34px_rgba(12,35,73,.06)]">
      <Icon className="h-6 w-6 text-[#0057b8]" />
      <h3 className="mt-3 font-extrabold text-[#0c2349]">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{desc}</p>
    </div>
  );
}

function RoutesPreview({ setView }: { setView: (view: View) => void }) {
  const lanes = [
    { name: "Tuyến gần", time: "2-4 giờ", routes: ["Bắc Ninh", "Hưng Yên", "Hà Nam", "Hải Dương"] },
    { name: "Trong ngày", time: "Trong ngày / 24h", routes: ["Hải Phòng", "Quảng Ninh", "Ninh Bình", "Nam Định"] },
    { name: "Tây Bắc", time: "Cần xác nhận lịch xe", routes: ["Yên Bái", "Lào Cai", "Sơn La", "Lai Châu"] },
  ];
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <SectionTitle eyebrow="Mạng lưới tuyến" title="Tập trung tuyến Hà Nội đi tỉnh và chiều về" desc="Không mở lan man. Hệ thống ưu tiên các tuyến đã có nhóm Zalo và đối tác xe phù hợp." />
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {lanes.map((lane) => (
          <div key={lane.name} className="rounded border border-slate-200 bg-white p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-black">{lane.name}</h3>
                <p className="mt-1 text-sm font-bold text-red-700">{lane.time}</p>
              </div>
              <RouteIcon className="h-5 w-5 text-slate-400" />
            </div>
            <div className="mt-4 grid gap-2">
              {lane.routes.map((route) => (
                <div key={route} className="flex items-center justify-between rounded bg-slate-50 px-3 py-2 text-sm font-bold">
                  <span>Hà Nội ↔ {route}</span>
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <button onClick={() => setView("routes")} className="mt-5 rounded border border-slate-300 bg-white px-4 py-2 text-sm font-black hover:bg-slate-50">
        Xem toàn bộ tuyến
      </button>
    </section>
  );
}

function OperatingFlow() {
  const steps = [
    ["Khách tạo đơn", "Website chuẩn hóa địa chỉ và phân loại tuyến."],
    ["Admin xác nhận", "Báo giá, kiểm tra hàng đặc biệt, duyệt xử lý."],
    ["Bán group Zalo", "Bot tạo nội dung, admin gửi vào group đúng tuyến."],
    ["Tài xế nhận đơn", "Admin duyệt tài xế và cập nhật tracking public."],
  ];
  return (
    <section className="border-y border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <SectionTitle eyebrow="Luồng vận hành" title="Thiết kế cho điều phối thật, không phải app tài xế phức tạp" desc="MVP giữ mô hình Zalo group theo tuyến, admin là trung tâm kiểm soát đơn và duyệt tài xế." />
        <div className="mt-7 grid gap-4 md:grid-cols-4">
          {steps.map(([title, desc], index) => (
            <div key={title} className="rounded border border-slate-200 bg-[#f8fafc] p-5">
              <div className="flex h-9 w-9 items-center justify-center rounded bg-slate-950 text-sm font-black text-white">{index + 1}</div>
              <h3 className="mt-4 font-black">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SectionTitle({ eyebrow, title, desc }: { eyebrow: string; title: string; desc: string }) {
  return (
    <div>
      <p className="text-xs font-black uppercase tracking-wide text-red-700">{eyebrow}</p>
      <h2 className="mt-2 max-w-3xl text-3xl font-black tracking-tight text-slate-950">{title}</h2>
      <p className="mt-3 max-w-2xl text-sm font-medium leading-6 text-slate-600">{desc}</p>
    </div>
  );
}

function OrderPage() {
  return (
    <PageShell title="Tạo đơn chuyển phát nhanh" desc="Tạo yêu cầu gửi hàng, ước tính tuyến, đánh dấu báo giá thủ công cho hàng đặc biệt.">
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <QuickOrderForm />
        <SidePanel
          title="Trước khi gửi đơn"
          items={[
            "Điện Biên và Điện Biên Phủ hiện chưa khai thác.",
            "Xe máy, tivi, tủ lạnh, máy giặt cần báo giá thủ công.",
            "Tuyến Tây Bắc cần xác nhận lịch xe trước khi cam kết.",
            "Hotline/Zalo hỗ trợ nhanh: 0345 07 6789.",
          ]}
        />
      </div>
    </PageShell>
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
  const [itemDescription, setItemDescription] = useState("Ho so can giao gap");
  const [packageCount, setPackageCount] = useState(1);
  const [weight, setWeight] = useState(1);
  const [itemImages, setItemImages] = useState<string[]>([]);
  const [estimate, setEstimate] = useState<RouteEstimate | null>(null);
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleImageUpload(files: FileList | null) {
    if (!files?.length) return;
    const selectedFiles = Array.from(files).slice(0, 4 - itemImages.length);
    const encodedImages = await Promise.all(
      selectedFiles.map((file) => new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(new Error("Khong doc duoc anh san pham"));
        reader.readAsDataURL(file);
      })),
    );
    setItemImages((current) => [...current, ...encodedImages].slice(0, 4));
  }

  const orderPayload = {
    pickupAddress: pickupQuery,
    pickupPlaceId,
    deliveryAddress: deliveryQuery,
    deliveryPlaceId,
    itemType,
    expectedDeliveryTime,
    customerPhone,
    itemDescription,
    packageCount,
    weight,
    itemImages,
  };

  useEffect(() => {
    fetch(`/api/maps/autocomplete?q=${encodeURIComponent(pickupQuery)}`)
      .then((res) => res.json())
      .then(setPickupSuggestions)
      .catch(() => undefined);
  }, [pickupQuery]);

  useEffect(() => {
    fetch(`/api/maps/autocomplete?q=${encodeURIComponent(deliveryQuery)}`)
      .then((res) => res.json())
      .then(setDeliverySuggestions)
      .catch(() => undefined);
  }, [deliveryQuery]);

  async function estimateRoute() {
    setLoading(true);
    setError("");
    setCreatedOrder(null);
    try {
      const res = await fetch("/api/orders/estimate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
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
        body: JSON.stringify(orderPayload),
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
    <div className={`rounded-2xl border border-[#eaeef4] bg-white shadow-[0_16px_40px_rgba(12,35,73,.08)] ${compact ? "p-5" : "p-6"}`}>
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-wide text-[#e30613]">Tạo đơn nhanh</p>
          <h2 className="mt-1 text-xl font-extrabold text-[#0c2349]">Tạo đơn chuyển phát nhanh</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Nhập điểm lấy và điểm giao, hệ thống sẽ tự xác định tuyến, thời gian dự kiến và phương án xử lý phù hợp.
          </p>
        </div>
        <PackageCheck className="hidden h-7 w-7 text-[#0057b8] sm:block" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <AddressInput label="Điểm lấy hàng" value={pickupQuery} onChange={setPickupQuery} suggestions={pickupSuggestions} onSelect={(address) => { setPickupQuery(address.label); setPickupPlaceId(address.placeId); }} />
        <AddressInput label="Điểm giao hàng" value={deliveryQuery} onChange={setDeliveryQuery} suggestions={deliverySuggestions} onSelect={(address) => { setDeliveryQuery(address.label); setDeliveryPlaceId(address.placeId); }} />
        <label className="block">
          <FieldLabel>Loại hàng</FieldLabel>
          <select value={itemType} onChange={(event) => setItemType(event.target.value as ItemType)} className="mt-1 h-[48px] w-full rounded-[11px] border-[1.5px] border-[#e2e7ee] bg-[#fbfcfd] px-3 text-sm font-semibold text-[#14233f] outline-none transition focus:border-[#0057b8]">
            {itemOptions.map((type) => (
              <option key={type} value={type}>{ITEM_TYPE_LABELS[type]}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <FieldLabel>Thời gian cần giao</FieldLabel>
          <select value={expectedDeliveryTime} onChange={(event) => setExpectedDeliveryTime(event.target.value)} className="mt-1 h-[48px] w-full rounded-[11px] border-[1.5px] border-[#e2e7ee] bg-[#fbfcfd] px-3 text-sm font-semibold text-[#14233f] outline-none transition focus:border-[#0057b8]">
            <option>Càng sớm càng tốt</option>
            <option>Trong 2-4 giờ</option>
            <option>Trong ngày</option>
            <option>Trong 24h</option>
            <option>Theo lịch hẹn</option>
          </select>
        </label>
        <label className="block sm:col-span-2">
          <FieldLabel>Số điện thoại/Zalo khách</FieldLabel>
          <input value={customerPhone} onChange={(event) => setCustomerPhone(event.target.value)} className="mt-1 h-[48px] w-full rounded-[11px] border-[1.5px] border-[#e2e7ee] bg-[#fbfcfd] px-3 text-sm font-semibold text-[#14233f] outline-none transition focus:border-[#0057b8]" />
        </label>
        <label className="block sm:col-span-2">
          <FieldLabel>Mo ta hang hoa</FieldLabel>
          <textarea value={itemDescription} onChange={(event) => setItemDescription(event.target.value)} rows={3} className="mt-1 w-full rounded-[11px] border-[1.5px] border-[#e2e7ee] bg-[#fbfcfd] px-3 py-2 text-sm font-semibold text-[#14233f] outline-none transition focus:border-[#0057b8]" />
        </label>
        <label className="block">
          <FieldLabel>So kien</FieldLabel>
          <input type="number" min={1} value={packageCount} onChange={(event) => setPackageCount(Number(event.target.value) || 1)} className="mt-1 h-[48px] w-full rounded-[11px] border-[1.5px] border-[#e2e7ee] bg-[#fbfcfd] px-3 text-sm font-semibold text-[#14233f] outline-none transition focus:border-[#0057b8]" />
        </label>
        <label className="block">
          <FieldLabel>Can nang uoc tinh (kg)</FieldLabel>
          <input type="number" min={0.1} step={0.1} value={weight} onChange={(event) => setWeight(Number(event.target.value) || 1)} className="mt-1 h-[48px] w-full rounded-[11px] border-[1.5px] border-[#e2e7ee] bg-[#fbfcfd] px-3 text-sm font-semibold text-[#14233f] outline-none transition focus:border-[#0057b8]" />
        </label>
        <div className="sm:col-span-2">
          <FieldLabel>Hinh anh san pham</FieldLabel>
          <label className="mt-1 flex cursor-pointer items-center justify-center gap-2 rounded-[11px] border border-dashed border-[#bfd6ef] bg-[#f3f8ff] px-4 py-4 text-sm font-black text-[#003b73] hover:bg-[#eaf4ff]">
            <ImagePlus className="h-4 w-4" />
            Tai anh hang hoa (toi da 4 anh)
            <input type="file" accept="image/*" multiple onChange={(event) => handleImageUpload(event.target.files)} className="sr-only" />
          </label>
          {itemImages.length > 0 && (
            <div className="mt-3 grid grid-cols-4 gap-2">
              {itemImages.map((image, index) => (
                <div key={image.slice(0, 40)} className="relative aspect-square overflow-hidden rounded border border-slate-200 bg-white">
                  <img src={image} alt={`Anh san pham ${index + 1}`} className="h-full w-full object-cover" />
                  <button type="button" onClick={() => setItemImages((current) => current.filter((_, imageIndex) => imageIndex !== index))} className="absolute right-1 top-1 rounded bg-white/90 px-2 py-1 text-xs font-black text-red-700 shadow">
                    Xoa
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <button onClick={estimateRoute} disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-[11px] bg-[#0c2349] px-4 py-2.5 text-sm font-black text-white shadow-[0_8px_18px_rgba(12,35,73,.18)] disabled:opacity-60">
          <RouteIcon className="h-4 w-4" />
          Ước tính tuyến
        </button>
        {estimate && (
          <button onClick={createOrder} disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-[11px] bg-gradient-to-b from-[#ff1b24] to-[#e30613] px-4 py-2.5 text-sm font-black text-white shadow-[0_8px_18px_rgba(227,6,19,.26)] disabled:opacity-60">
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

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <span className="text-xs font-black uppercase tracking-wide text-[#7c8696]">{children}</span>;
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
      <FieldLabel>{label}</FieldLabel>
      <input value={value} onChange={(event) => onChange(event.target.value)} className="mt-1 h-[48px] w-full rounded-[11px] border-[1.5px] border-[#e2e7ee] bg-[#fbfcfd] px-3 text-sm font-semibold text-[#14233f] outline-none transition focus:border-[#0057b8]" />
      <div className="mt-2 flex flex-wrap gap-2">
        {suggestions.slice(0, 3).map((address) => (
          <button key={address.placeId} type="button" onClick={() => onSelect(address)} className="rounded-full border border-[#eaeef4] bg-[#f6f8fb] px-3 py-1 text-xs font-bold text-[#4a5868] hover:border-[#0057b8]/40 hover:bg-[#eef7ff]">
            {address.label}
          </button>
        ))}
      </div>
    </label>
  );
}

function RouteEstimateCard({ estimate }: { estimate: RouteEstimate }) {
  return (
    <div className="mt-5 rounded-[14px] border border-[#bfd6ef] bg-[#f3f8ff] p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-wide text-[#e30613]">Kết quả phân tuyến</p>
          <h3 className="mt-1 text-lg font-black text-[#0c2349]">{estimate.routeName}</h3>
          <p className="mt-1 text-sm font-semibold text-slate-700">{estimate.publicMessage}</p>
        </div>
        <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-[#0c2349]">{estimate.statusText}</span>
      </div>
      <div className="mt-4 grid gap-3 text-sm sm:grid-cols-4">
        <Info label="Chiều vận chuyển" value={estimate.direction} />
        <Info label="Thời gian dự kiến" value={estimate.serviceLevel} />
        <Info label="Khoảng cách" value={estimate.distanceKm ? `${estimate.distanceKm} km` : "Đang kiểm tra"} />
        <Info label="Giá đề xuất" value={estimate.estimatedPrice ? `${estimate.estimatedPrice.toLocaleString("vi-VN")}đ` : "Chờ điều hành duyệt"} />
      </div>
    </div>
  );
}

function OrderCreatedCard({ order }: { order: Order }) {
  return (
    <div className="mt-5 rounded-[14px] border border-emerald-200 bg-emerald-50 p-4">
      <h3 className="text-lg font-black text-emerald-800">Đã tiếp nhận yêu cầu gửi hàng</h3>
      <p className="mt-2 text-sm font-semibold text-slate-700">Mã đơn: <span className="font-black">{order.orderCode}</span></p>
      <p className="mt-2 text-sm font-semibold leading-6 text-slate-700">
        Don da duoc gui ve bot Telegram cho dieu hanh. Gia tren website la gia de xuat; khi duyet gia va co xe nhan don, he thong se gui thong tin qua Zalo cua khach.
      </p>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <a href={`tel:${hotline.replace(/\s/g, "")}`} className="rounded-[11px] bg-[#0c2349] px-4 py-2 text-center text-sm font-black text-white">
          Gọi/Zalo {hotline}
        </a>
      </div>
    </div>
  );
}

function Info({ label, value }: { key?: React.Key; label: string; value?: React.ReactNode }) {
  return (
    <div className="rounded-[11px] border border-[#eaeef4] bg-white p-3">
      <div className="text-xs font-black uppercase tracking-wide text-[#7c8696]">{label}</div>
      <div className="mt-1 break-words font-black text-[#0c2349]">{value || "-"}</div>
    </div>
  );
}

function SidePanel({ title, items }: { title: string; items: string[] }) {
  return (
    <aside className="h-fit rounded-2xl border border-[#eaeef4] bg-white p-5 shadow-[0_16px_40px_rgba(12,35,73,.06)]">
      <h2 className="font-extrabold text-[#0c2349]">{title}</h2>
      <div className="mt-4 grid gap-3">
        {items.map((item) => (
          <div key={item} className="flex gap-3 text-sm font-semibold leading-6 text-slate-700">
            <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-600" />
            <span>{item}</span>
          </div>
        ))}
      </div>
    </aside>
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
          <div key={title as string} className="rounded-2xl border border-[#eaeef4] bg-white p-5 shadow-[0_12px_34px_rgba(12,35,73,.06)]">
            <h2 className="font-extrabold text-[#0c2349]">{title}</h2>
            <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {(provinces as string[]).map((province) => (
                <div key={province} className="rounded-[11px] border border-[#eaeef4] bg-[#f6f8fb] p-3 text-sm font-bold text-[#0c2349]">
                  Hà Nội <span className="text-[#e30613]">↔</span> {province}
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
      <div className="mt-5 overflow-hidden rounded-2xl border border-[#eaeef4] bg-white shadow-[0_12px_34px_rgba(12,35,73,.06)]">
        {[
          ["Nhóm tuyến", "Loại hàng", "Thời gian", "Xử lý"],
          ["Gần Hà Nội", "Giấy tờ, hàng nhỏ, hàng shop", "2-4 giờ", "Có thể tạo đơn ngay"],
          ["Trong ngày", "Hồ sơ, hàng shop, linh kiện", "Trong ngày / 24h", "Tạo đơn hoặc xác nhận thêm"],
          ["Tây Bắc", "Hàng nhỏ, giấy tờ", "Cần xác nhận lịch xe", "Admin kiểm tra thủ công"],
          ["Hàng đặc biệt", "Xe máy, tivi, tủ lạnh, quá khổ", "Theo điều phối", "Báo giá thủ công"],
        ].map((row, idx) => (
          <div key={row.join("-")} className={`grid grid-cols-4 gap-3 px-4 py-3 text-sm ${idx === 0 ? "bg-[#0c2349] font-black text-white" : "border-t border-[#eef1f6] font-semibold text-[#4a5868]"}`}>
            {row.map((cell) => <div key={cell}>{cell}</div>)}
          </div>
        ))}
      </div>
    </PageShell>
  );
}

function Price({ title, price, desc }: { title: string; price: string; desc: string }) {
  return (
    <div className="rounded-2xl border border-[#eaeef4] bg-white p-5 shadow-[0_12px_34px_rgba(12,35,73,.06)]">
      <WalletCards className="mb-4 h-6 w-6 text-[#0057b8]" />
      <h2 className="font-extrabold text-[#0c2349]">{title}</h2>
      <p className="mt-3 text-2xl font-extrabold text-[#e30613]">{price}</p>
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
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="rounded-2xl border border-[#eaeef4] bg-white p-5 shadow-[0_16px_40px_rgba(12,35,73,.08)]">
          <div className="grid gap-4 sm:grid-cols-3">
            <input value={orderCode} onChange={(event) => setOrderCode(event.target.value)} className="h-[48px] rounded-[11px] border-[1.5px] border-[#e2e7ee] bg-[#fbfcfd] px-3 text-sm font-semibold text-[#14233f] outline-none transition focus:border-[#0057b8]" placeholder="Mã đơn" />
            <input value={phone} onChange={(event) => setPhone(event.target.value)} className="h-[48px] rounded-[11px] border-[1.5px] border-[#e2e7ee] bg-[#fbfcfd] px-3 text-sm font-semibold text-[#14233f] outline-none transition focus:border-[#0057b8]" placeholder="Số điện thoại" />
            <button onClick={lookup} className="rounded-[11px] bg-gradient-to-b from-[#ff1b24] to-[#e30613] px-4 py-2 text-sm font-black text-white shadow-[0_8px_18px_rgba(227,6,19,.26)]">Tra cứu</button>
          </div>
          {message && <p className="mt-4 rounded border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">{message}</p>}
          {tracking && (
            <div className="mt-5 rounded-[14px] border border-[#eaeef4] bg-[#f6f8fb] p-4">
              <div className="flex flex-col justify-between gap-3 sm:flex-row">
                <div>
                  <h2 className="text-xl font-black">{tracking.orderCode}</h2>
                  <p className="mt-1 text-sm font-semibold text-slate-600">{tracking.routeName} · {tracking.itemType}</p>
                </div>
                <span className="h-fit rounded-full bg-emerald-100 px-3 py-1 text-sm font-black text-emerald-800">{tracking.statusLabel}</span>
              </div>
              <div className="mt-5 grid gap-3">
                {tracking.publicTimeline.map((event) => (
                  <div key={event.id} className="rounded-[11px] border border-[#eaeef4] bg-white p-3">
                    <div className="font-black">{event.title}</div>
                    <p className="mt-1 text-sm text-slate-600">{event.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <SidePanel title="Dữ liệu không hiển thị cho khách" items={["Link group Zalo", "Danh sách tài xế ứng viên", "Ghi chú nội bộ", "Log bot điều phối", "Phí tài xế"]} />
      </div>
    </PageShell>
  );
}

function AdminPage({
  theme,
  onThemeChange,
  seoPages,
  onSeoPagesChange,
}: {
  theme: SiteThemeSettings;
  onThemeChange: (theme: SiteThemeSettings) => void;
  seoPages: SeoPageConfig[];
  onSeoPagesChange: (pages: SeoPageConfig[]) => void;
}) {
  const [authenticated, setAuthenticated] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState("");
  const [preview, setPreview] = useState<Array<{ targetGroupName: string; messageContent: string }>>([]);
  const [activeModule, setActiveModule] = useState<AdminModule>("dashboard");
  const selectedOrder = useMemo(() => orders.find((order) => order.id === selectedOrderId), [orders, selectedOrderId]);

  useEffect(() => {
    fetch("/api/admin/session")
      .then((res) => res.json())
      .then((session) => {
        setAuthenticated(Boolean(session.authenticated));
        if (session.authenticated) {
          loadOrders();
        }
      })
      .finally(() => setCheckingSession(false));
  }, []);

  function handleUnauthorized() {
    setAuthenticated(false);
    setOrders([]);
    setPreview([]);
  }

  async function loadOrders() {
    const res = await fetch("/api/orders");
    if (res.status === 401) return handleUnauthorized();
    const data: Order[] = await res.json();
    setOrders(data);
    setSelectedOrderId((current) => current || data[0]?.id || "");
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    handleUnauthorized();
  }

  async function previewDispatch() {
    if (!selectedOrder) return;
    const res = await fetch("/api/dispatch/preview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId: selectedOrder.id }),
    });
    if (res.status === 401) return handleUnauthorized();
    setPreview(await res.json());
  }

  async function sendDispatch() {
    if (!selectedOrder) return;
    const sendRes = await fetch("/api/dispatch/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId: selectedOrder.id }),
    });
    if (sendRes.status === 401) return handleUnauthorized();
    await loadOrders();
    await previewDispatch();
  }

  async function approveSelectedOrder(finalPrice: number, note: string) {
    if (!selectedOrder) return;
    const res = await fetch(`/api/admin/orders/${selectedOrder.id}/approve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ finalPrice, note }),
    });
    if (res.status === 401) return handleUnauthorized();
    await loadOrders();
  }

  async function assignNearestVehicleToSelectedOrder() {
    if (!selectedOrder) return;
    const res = await fetch(`/api/admin/orders/${selectedOrder.id}/assign-nearest-vehicle`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    if (res.status === 401) return handleUnauthorized();
    await loadOrders();
  }

  async function saveSelectedOrder(updates: AdminOrderEditPayload) {
    if (!selectedOrder) return;
    const res = await fetch(`/api/admin/orders/${selectedOrder.id}/edit`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    if (res.status === 401) {
      handleUnauthorized();
      return;
    }
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || "Khong luu duoc don hang.");
    }
    const updatedOrder = data as Order;
    setOrders((current) => current.map((order) => (order.id === updatedOrder.id ? updatedOrder : order)));
    setSelectedOrderId(updatedOrder.id);
  }

  if (checkingSession) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded border border-slate-200 bg-white p-8 text-sm font-bold text-slate-600">Đang kiểm tra phiên AdminCP...</div>
      </section>
    );
  }

  if (!authenticated) {
    return <AdminLogin onLoggedIn={() => { setAuthenticated(true); loadOrders(); }} />;
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-5 flex flex-col justify-between gap-3 rounded border border-slate-200 bg-white p-5 md:flex-row md:items-center">
        <div>
          <p className="text-xs font-black uppercase tracking-wide text-red-700">AdminCP v2</p>
          <h1 className="mt-1 text-2xl font-black">Trung tâm điều hành Chuyển Phát 24H</h1>
          <p className="mt-1 text-sm font-medium text-slate-600">Dashboard, đơn hàng, điều phối Zalo, đối tác, bảng giá và nội dung SEO trong một khu quản trị rõ ràng.</p>
        </div>
        <button onClick={logout} className="flex items-center gap-2 rounded border border-slate-300 px-3 py-2 text-xs font-black text-slate-700 hover:bg-slate-50">
          <Lock className="h-4 w-4" />
          Đăng xuất AdminCP
        </button>
      </div>

      <div className="grid gap-5 lg:grid-cols-[260px_1fr]">
        <aside className="h-fit rounded border border-slate-200 bg-white p-3">
          {adminModules.map((module) => {
            const Icon = module.icon;
            return (
              <button
                key={module.id}
                onClick={() => setActiveModule(module.id)}
                className={`mb-1 flex w-full items-center gap-3 rounded px-3 py-2 text-left text-sm font-black ${activeModule === module.id ? "bg-slate-950 text-white" : "text-slate-700 hover:bg-slate-50"}`}
              >
                <Icon className="h-4 w-4" />
                {module.label}
              </button>
            );
          })}
        </aside>

        <div className="min-w-0">
          {activeModule === "theme" && <AdminThemeEditor theme={theme} onThemeChange={onThemeChange} onUnauthorized={handleUnauthorized} />}
          {activeModule === "dashboard" && <AdminDashboard orders={orders} />}
          {activeModule === "orders" && <AdminOrders orders={orders} selectedOrderId={selectedOrderId} setSelectedOrderId={setSelectedOrderId} selectedOrder={selectedOrder} onApprove={approveSelectedOrder} onAssignVehicle={assignNearestVehicleToSelectedOrder} onSave={saveSelectedOrder} onUnauthorized={handleUnauthorized} />}
          {activeModule === "dispatch" && <AdminDispatch selectedOrder={selectedOrder} preview={preview} previewDispatch={previewDispatch} sendDispatch={sendDispatch} />}
          {activeModule === "zalo" && <AdminPlaceholder title="Nhóm Zalo tuyến" icon={MessageSquare} rows={["CP24H Hà Nội - Bắc Ninh", "CP24H Hà Nội - Hải Phòng", "CP24H Tây Bắc - Lào Cai", "CP24H Hàng cồng kềnh / xe máy"]} />}
          {activeModule === "routes" && <AdminPlaceholder title="Tuyến xe" icon={RouteIcon} rows={["Tuyến gần Hà Nội", "Tuyến trong ngày", "Tuyến Tây Bắc cần xác nhận", "Thanh Hóa / Nghệ An 24h"]} />}
          {activeModule === "partners" && <AdminPlaceholder title="Đối tác đội xe" icon={UserRoundCheck} rows={["Nguyễn Văn An - xe 7 chỗ", "Trần Văn Bình - xe 16 chỗ", "Ứng tuyển mới cần duyệt"]} />}
          {activeModule === "customers" && <AdminPlaceholder title="Khách hàng" icon={Users} rows={["Shop online", "Khách cá nhân", "Doanh nghiệp gửi hồ sơ"]} />}
          {activeModule === "pricing" && <AdminPlaceholder title="Bảng giá" icon={WalletCards} rows={["Giấy tờ tuyến gần từ 150.000đ", "Hàng shop trong ngày từ 190.000đ", "Xe máy / hàng cồng kềnh báo giá thủ công"]} />}
          {activeModule === "seo" && <AdminSeoPanel pages={seoPages} onPagesChange={onSeoPagesChange} onUnauthorized={handleUnauthorized} />}
          {activeModule === "settings" && <AdminPlaceholder title="Cài đặt hệ thống" icon={Settings} rows={["MAPS_PROVIDER=mock", "ZALO dispatch mock", "PostgreSQL storage qua DATABASE_URL"]} />}
        </div>
      </div>
    </section>
  );
}

function AdminThemeEditor({
  theme,
  onThemeChange,
  onUnauthorized,
}: {
  theme: SiteThemeSettings;
  onThemeChange: (theme: SiteThemeSettings) => void;
  onUnauthorized: () => void;
}) {
  const [form, setForm] = useState<SiteThemeSettings>(theme);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"brand" | "hero" | "sections" | "lists" | "footer">("brand");

  useEffect(() => {
    setForm(theme);
  }, [theme]);

  function updateField<K extends keyof SiteThemeSettings>(field: K, value: SiteThemeSettings[K]) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function updateVisibility(field: keyof SiteThemeSettings["sectionVisibility"], value: boolean) {
    setForm((current) => ({
      ...current,
      sectionVisibility: { ...current.sectionVisibility, [field]: value },
    }));
  }

  function updateTextList(field: "heroBenefits" | "finalCtaBenefits", index: number, value: string) {
    setForm((current) => ({
      ...current,
      [field]: current[field].map((item, itemIndex) => (itemIndex === index ? value : item)),
    }));
  }

  function addTextListItem(field: "heroBenefits" | "finalCtaBenefits", value: string) {
    setForm((current) => ({ ...current, [field]: [...current[field], value] }));
  }

  function removeTextListItem(field: "heroBenefits" | "finalCtaBenefits", index: number) {
    setForm((current) => ({ ...current, [field]: current[field].filter((_, itemIndex) => itemIndex !== index) }));
  }

  function updateFeatureCard(field: "featureCards" | "whyCards", index: number, key: "title" | "desc", value: string) {
    setForm((current) => ({
      ...current,
      [field]: current[field].map((item, itemIndex) => (itemIndex === index ? { ...item, [key]: value } : item)),
    }));
  }

  function addFeatureCard(field: "featureCards" | "whyCards") {
    setForm((current) => ({ ...current, [field]: [...current[field], { title: "Tiêu đề mới", desc: "Mô tả ngắn" }] }));
  }

  function removeFeatureCard(field: "featureCards" | "whyCards", index: number) {
    setForm((current) => ({ ...current, [field]: current[field].filter((_, itemIndex) => itemIndex !== index) }));
  }

  function updateRouteCard(index: number, key: "abbr" | "province", value: string) {
    setForm((current) => ({
      ...current,
      routeCards: current.routeCards.map((item, itemIndex) => (itemIndex === index ? { ...item, [key]: value } : item)),
    }));
  }

  function addRouteCard() {
    setForm((current) => ({ ...current, routeCards: [...current.routeCards, { abbr: "NEW", province: "Tỉnh mới" }] }));
  }

  function removeRouteCard(index: number) {
    setForm((current) => ({ ...current, routeCards: current.routeCards.filter((_, itemIndex) => itemIndex !== index) }));
  }

  function updateGoodsType(index: number, key: "name" | "price", value: string) {
    setForm((current) => ({
      ...current,
      goodsTypes: current.goodsTypes.map((item, itemIndex) => (itemIndex === index ? { ...item, [key]: value } : item)),
    }));
  }

  function addGoodsType() {
    setForm((current) => ({ ...current, goodsTypes: [...current.goodsTypes, { name: "Loại hàng mới", price: "Liên hệ" }] }));
  }

  function removeGoodsType(index: number) {
    setForm((current) => ({ ...current, goodsTypes: current.goodsTypes.filter((_, itemIndex) => itemIndex !== index) }));
  }

  async function saveTheme(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");
    try {
      const res = await fetch("/api/admin/theme-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.status === 401) {
        onUnauthorized();
        return;
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Khong luu duoc theme.");
      onThemeChange({ ...defaultThemeSettings, ...data });
      setMessage("Da luu theme web.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Khong luu duoc theme.");
    } finally {
      setSaving(false);
    }
  }

  async function resetTheme() {
    setSaving(true);
    setMessage("");
    setError("");
    try {
      const res = await fetch("/api/admin/theme-settings/reset", { method: "POST" });
      if (res.status === 401) {
        onUnauthorized();
        return;
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Khong reset duoc theme.");
      onThemeChange({ ...defaultThemeSettings, ...data });
      setMessage("Da reset theme ve mac dinh.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Khong reset duoc theme.");
    } finally {
      setSaving(false);
    }
  }

  const tabs: Array<{ id: typeof activeTab; label: string }> = [
    { id: "brand", label: "Thương hiệu" },
    { id: "hero", label: "Hero" },
    { id: "sections", label: "Section" },
    { id: "lists", label: "Danh sách" },
    { id: "footer", label: "Footer" },
  ];

  return (
    <form onSubmit={saveTheme} className="rounded border border-slate-200 bg-white">
      <div className="border-b border-slate-200 p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-red-600" />
              <h2 className="font-black">Theme web</h2>
            </div>
            <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
              Tùy biến thương hiệu, màu sắc, section trang chủ, danh sách tuyến và loại hàng. Dữ liệu được lưu vào storage/DB production.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={resetTheme} disabled={saving} className="rounded border border-slate-300 px-4 py-2 text-sm font-black text-slate-700 hover:bg-slate-50 disabled:opacity-60">
              Reset mặc định
            </button>
            <button type="submit" disabled={saving} className="rounded bg-slate-950 px-5 py-2 text-sm font-black text-white disabled:opacity-60">
              {saving ? "Đang lưu..." : "Lưu theme web"}
            </button>
          </div>
        </div>

        <div className="mt-5 flex gap-2 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap rounded px-4 py-2 text-sm font-black transition ${activeTab === tab.id ? "bg-slate-950 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-5 p-5 xl:grid-cols-[1fr_390px]">
        <div className="min-w-0">
          {activeTab === "brand" && (
            <div className="grid gap-4 sm:grid-cols-2">
              <ThemeEditorInput label="Tên thương hiệu" value={form.brandName} onChange={(value) => updateField("brandName", value)} />
              <ThemeEditorInput label="Tên rút gọn logo" value={form.brandShortName} onChange={(value) => updateField("brandShortName", value)} />
              <ThemeEditorInput label="Tagline" value={form.tagline} onChange={(value) => updateField("tagline", value)} />
              <ThemeEditorInput label="Hotline" value={form.hotline} onChange={(value) => updateField("hotline", value)} />
              <ThemeColorInput label="Màu chính" value={form.primaryColor} onChange={(value) => updateField("primaryColor", value)} />
              <ThemeColorInput label="Màu nền/header" value={form.secondaryColor} onChange={(value) => updateField("secondaryColor", value)} />
              <ThemeColorInput label="Màu nhấn/gradient" value={form.accentColor} onChange={(value) => updateField("accentColor", value)} />
            </div>
          )}

          {activeTab === "hero" && (
            <div className="grid gap-4 sm:grid-cols-2">
              <ThemeEditorInput label="Ảnh hero URL" value={form.heroImageUrl} onChange={(value) => updateField("heroImageUrl", value)} className="sm:col-span-2" />
              <ThemeEditorTextarea label="Tiêu đề hero" value={form.heroTitle} onChange={(value) => updateField("heroTitle", value)} />
              <ThemeEditorTextarea label="Cụm nhấn mạnh hero" value={form.heroHighlight} onChange={(value) => updateField("heroHighlight", value)} />
              <ThemeEditorTextarea label="Mô tả form hero" value={form.heroSubtitle} onChange={(value) => updateField("heroSubtitle", value)} className="sm:col-span-2" />
              <ThemeEditorInput label="Nút CTA chính" value={form.ctaPrimary} onChange={(value) => updateField("ctaPrimary", value)} />
              <ThemeEditorInput label="Nút CTA phụ" value={form.ctaSecondary} onChange={(value) => updateField("ctaSecondary", value)} />
              <ThemeTextListEditor title="Lợi ích hero" items={form.heroBenefits} onChange={(index, value) => updateTextList("heroBenefits", index, value)} onAdd={() => addTextListItem("heroBenefits", "Lợi ích mới")} onRemove={(index) => removeTextListItem("heroBenefits", index)} />
            </div>
          )}

          {activeTab === "sections" && (
            <div className="grid gap-5">
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                <ThemeSectionToggle label="Thẻ lợi ích đầu trang" checked={form.sectionVisibility.features} onChange={(value) => updateVisibility("features", value)} />
                <ThemeSectionToggle label="Tuyến chuyển phát" checked={form.sectionVisibility.routes} onChange={(value) => updateVisibility("routes", value)} />
                <ThemeSectionToggle label="Vì sao chọn" checked={form.sectionVisibility.why} onChange={(value) => updateVisibility("why", value)} />
                <ThemeSectionToggle label="Thông tin tài xế" checked={form.sectionVisibility.driver} onChange={(value) => updateVisibility("driver", value)} />
                <ThemeSectionToggle label="Loại hàng hóa" checked={form.sectionVisibility.goods} onChange={(value) => updateVisibility("goods", value)} />
                <ThemeSectionToggle label="CTA cuối trang" checked={form.sectionVisibility.finalCta} onChange={(value) => updateVisibility("finalCta", value)} />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <ThemeEditorInput label="Tiêu đề tuyến" value={form.routeSectionTitle} onChange={(value) => updateField("routeSectionTitle", value)} />
                <ThemeEditorInput label="Mô tả tuyến" value={form.routeSectionDesc} onChange={(value) => updateField("routeSectionDesc", value)} />
                <ThemeEditorTextarea label="CTA tuyến" value={form.routeCtaText} onChange={(value) => updateField("routeCtaText", value)} className="sm:col-span-2" />
                <ThemeEditorInput label="Tiêu đề vì sao chọn" value={form.whySectionTitle} onChange={(value) => updateField("whySectionTitle", value)} />
                <ThemeEditorInput label="Tiêu đề loại hàng" value={form.goodsSectionTitle} onChange={(value) => updateField("goodsSectionTitle", value)} />
                <ThemeEditorTextarea label="Tiêu đề thông tin tài xế" value={form.driverSectionTitle} onChange={(value) => updateField("driverSectionTitle", value)} />
                <ThemeEditorTextarea label="Mô tả thông tin tài xế" value={form.driverSectionDesc} onChange={(value) => updateField("driverSectionDesc", value)} />
                <ThemeEditorInput label="Tiêu đề CTA cuối" value={form.finalCtaTitle} onChange={(value) => updateField("finalCtaTitle", value)} />
                <ThemeEditorInput label="Nhấn mạnh CTA cuối" value={form.finalCtaHighlight} onChange={(value) => updateField("finalCtaHighlight", value)} />
                <ThemeEditorInput label="Nhãn ảnh CTA cuối" value={form.finalCtaImageLabel} onChange={(value) => updateField("finalCtaImageLabel", value)} />
              </div>
            </div>
          )}

          {activeTab === "lists" && (
            <div className="grid gap-5">
              <ThemeFeatureListEditor title="Thẻ lợi ích" items={form.featureCards} onChange={(index, key, value) => updateFeatureCard("featureCards", index, key, value)} onAdd={() => addFeatureCard("featureCards")} onRemove={(index) => removeFeatureCard("featureCards", index)} />
              <ThemeRouteListEditor items={form.routeCards} onChange={updateRouteCard} onAdd={addRouteCard} onRemove={removeRouteCard} />
              <ThemeFeatureListEditor title="Lý do chọn dịch vụ" items={form.whyCards} onChange={(index, key, value) => updateFeatureCard("whyCards", index, key, value)} onAdd={() => addFeatureCard("whyCards")} onRemove={(index) => removeFeatureCard("whyCards", index)} />
              <ThemeGoodsListEditor items={form.goodsTypes} onChange={updateGoodsType} onAdd={addGoodsType} onRemove={removeGoodsType} />
              <ThemeTextListEditor title="Lợi ích CTA cuối" items={form.finalCtaBenefits} onChange={(index, value) => updateTextList("finalCtaBenefits", index, value)} onAdd={() => addTextListItem("finalCtaBenefits", "Lợi ích mới")} onRemove={(index) => removeTextListItem("finalCtaBenefits", index)} />
            </div>
          )}

          {activeTab === "footer" && (
            <div className="grid gap-4 sm:grid-cols-2">
              <ThemeEditorTextarea label="Mô tả footer" value={form.footerDescription} onChange={(value) => updateField("footerDescription", value)} className="sm:col-span-2" />
              <ThemeEditorInput label="Khu vực liên hệ" value={form.footerLocation} onChange={(value) => updateField("footerLocation", value)} />
              <ThemeEditorInput label="Copyright" value={form.footerCopyright} onChange={(value) => updateField("footerCopyright", value)} />
            </div>
          )}
        </div>

        <ThemeAdminPreview theme={form} />
      </div>

      {(error || message) && (
        <div className="border-t border-slate-200 px-5 py-4">
          {error && <div className="rounded border border-red-200 bg-red-50 p-3 text-sm font-bold text-red-700">{error}</div>}
          {message && <div className="rounded border border-emerald-200 bg-emerald-50 p-3 text-sm font-bold text-emerald-700">{message}</div>}
        </div>
      )}
    </form>
  );
}

function ThemeEditorInput({
  label,
  value,
  onChange,
  className = "",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}) {
  return (
    <label className={className}>
      <FieldLabel>{label}</FieldLabel>
      <input value={value} onChange={(event) => onChange(event.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm font-semibold" />
    </label>
  );
}

function ThemeEditorTextarea({
  label,
  value,
  onChange,
  className = "",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}) {
  return (
    <label className={className}>
      <FieldLabel>{label}</FieldLabel>
      <textarea value={value} onChange={(event) => onChange(event.target.value)} rows={3} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm font-semibold" />
    </label>
  );
}

function ThemeColorInput({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label>
      <FieldLabel>{label}</FieldLabel>
      <div className="mt-1 flex gap-2">
        <input type="color" value={value} onChange={(event) => onChange(event.target.value)} className="h-10 w-12 rounded border border-slate-300 bg-white p-1" />
        <input value={value} onChange={(event) => onChange(event.target.value)} className="min-w-0 flex-1 rounded border border-slate-300 px-3 py-2 text-sm font-semibold" />
      </div>
    </label>
  );
}

function ThemeSectionToggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <label className="flex items-center justify-between gap-3 rounded border border-slate-200 bg-slate-50 px-4 py-3">
      <span className="text-sm font-black text-slate-800">{label}</span>
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="h-5 w-5 accent-slate-950" />
    </label>
  );
}

function ThemeListShell({ title, onAdd, children }: { title: string; onAdd: () => void; children: React.ReactNode }) {
  return (
    <section className="rounded border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-black">{title}</h3>
        <button type="button" onClick={onAdd} className="rounded bg-white px-3 py-2 text-xs font-black text-slate-700 ring-1 ring-slate-200 hover:bg-slate-100">
          Thêm
        </button>
      </div>
      <div className="mt-4 grid gap-3">{children}</div>
    </section>
  );
}

function ThemeRemoveButton({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="rounded border border-red-200 px-3 py-2 text-xs font-black text-red-600 hover:bg-red-50">
      Xóa
    </button>
  );
}

function ThemeTextListEditor({
  title,
  items,
  onChange,
  onAdd,
  onRemove,
}: {
  title: string;
  items: string[];
  onChange: (index: number, value: string) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
}) {
  return (
    <div className="sm:col-span-2">
      <ThemeListShell title={title} onAdd={onAdd}>
        {items.map((item, index) => (
          <div key={`${title}-${index}`} className="grid gap-2 sm:grid-cols-[1fr_auto]">
            <input value={item} onChange={(event) => onChange(index, event.target.value)} className="rounded border border-slate-300 px-3 py-2 text-sm font-semibold" />
            <ThemeRemoveButton onClick={() => onRemove(index)} />
          </div>
        ))}
      </ThemeListShell>
    </div>
  );
}

function ThemeFeatureListEditor({
  title,
  items,
  onChange,
  onAdd,
  onRemove,
}: {
  title: string;
  items: Array<{ title: string; desc: string }>;
  onChange: (index: number, key: "title" | "desc", value: string) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
}) {
  return (
    <ThemeListShell title={title} onAdd={onAdd}>
      {items.map((item, index) => (
        <div key={`${title}-${index}`} className="rounded border border-slate-200 bg-white p-3">
          <div className="grid gap-3 md:grid-cols-[1fr_1.4fr_auto]">
            <input value={item.title} onChange={(event) => onChange(index, "title", event.target.value)} className="rounded border border-slate-300 px-3 py-2 text-sm font-semibold" />
            <input value={item.desc} onChange={(event) => onChange(index, "desc", event.target.value)} className="rounded border border-slate-300 px-3 py-2 text-sm font-semibold" />
            <ThemeRemoveButton onClick={() => onRemove(index)} />
          </div>
        </div>
      ))}
    </ThemeListShell>
  );
}

function ThemeRouteListEditor({
  items,
  onChange,
  onAdd,
  onRemove,
}: {
  items: SiteThemeSettings["routeCards"];
  onChange: (index: number, key: "abbr" | "province", value: string) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
}) {
  return (
    <ThemeListShell title="Tuyến chuyển phát" onAdd={onAdd}>
      {items.map((item, index) => (
        <div key={`${item.abbr}-${index}`} className="grid gap-3 rounded border border-slate-200 bg-white p-3 md:grid-cols-[120px_1fr_auto]">
          <input value={item.abbr} onChange={(event) => onChange(index, "abbr", event.target.value)} className="rounded border border-slate-300 px-3 py-2 text-sm font-semibold" />
          <input value={item.province} onChange={(event) => onChange(index, "province", event.target.value)} className="rounded border border-slate-300 px-3 py-2 text-sm font-semibold" />
          <ThemeRemoveButton onClick={() => onRemove(index)} />
        </div>
      ))}
    </ThemeListShell>
  );
}

function ThemeGoodsListEditor({
  items,
  onChange,
  onAdd,
  onRemove,
}: {
  items: SiteThemeSettings["goodsTypes"];
  onChange: (index: number, key: "name" | "price", value: string) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
}) {
  return (
    <ThemeListShell title="Loại hàng và giá tham khảo" onAdd={onAdd}>
      {items.map((item, index) => (
        <div key={`${item.name}-${index}`} className="grid gap-3 rounded border border-slate-200 bg-white p-3 md:grid-cols-[1fr_180px_auto]">
          <input value={item.name} onChange={(event) => onChange(index, "name", event.target.value)} className="rounded border border-slate-300 px-3 py-2 text-sm font-semibold" />
          <input value={item.price} onChange={(event) => onChange(index, "price", event.target.value)} className="rounded border border-slate-300 px-3 py-2 text-sm font-semibold" />
          <ThemeRemoveButton onClick={() => onRemove(index)} />
        </div>
      ))}
    </ThemeListShell>
  );
}

function ThemeAdminPreview({ theme }: { theme: SiteThemeSettings }) {
  const visibleCount = Object.values(theme.sectionVisibility).filter(Boolean).length;
  return (
    <aside className="h-fit rounded border border-slate-200 bg-slate-50 p-4 xl:sticky xl:top-24">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-black">Preview nhanh</h3>
        <span className="rounded bg-white px-2 py-1 text-[11px] font-black text-slate-500 ring-1 ring-slate-200">{visibleCount}/6 section</span>
      </div>
      <div className="overflow-hidden rounded border border-slate-200 bg-white">
        <div
          className="min-h-[230px] bg-cover bg-center p-4 text-white"
          style={{
            backgroundImage: `linear-gradient(110deg, ${theme.secondaryColor}ee, ${theme.secondaryColor}99, ${theme.primaryColor}55), url('${theme.heroImageUrl}')`,
          }}
        >
          <div className="flex items-center gap-2 text-sm font-black">
            <span className="flex h-8 w-8 items-center justify-center rounded text-white" style={{ background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.accentColor})` }}>
              <Truck className="h-4 w-4" />
            </span>
            {theme.brandShortName}
          </div>
          <h4 className="mt-8 text-2xl font-black leading-tight">
            {theme.heroTitle} <span style={{ color: theme.accentColor }}>{theme.heroHighlight}</span>
          </h4>
          <button type="button" className="mt-5 rounded px-4 py-2 text-xs font-black text-white" style={{ background: `linear-gradient(180deg, ${theme.accentColor}, ${theme.primaryColor})` }}>
            {theme.ctaPrimary}
          </button>
        </div>
        <div className="grid gap-2 p-4">
          {theme.featureCards.slice(0, 3).map((item) => (
            <div key={item.title} className="rounded border border-slate-200 p-3">
              <div className="text-sm font-black" style={{ color: theme.secondaryColor }}>{item.title}</div>
              <div className="mt-1 text-xs font-semibold leading-5 text-slate-500">{item.desc}</div>
            </div>
          ))}
        </div>
        <div className="px-4 pb-4">
          <div className="rounded p-3 text-xs font-bold text-white" style={{ backgroundColor: theme.secondaryColor }}>
            {theme.footerDescription}
          </div>
        </div>
      </div>
    </aside>
  );
}

function AdminLogin({ onLoggedIn }: { onLoggedIn: () => void }) {
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Không đăng nhập được.");
      onLoggedIn();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không đăng nhập được.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mx-auto grid min-h-[calc(100vh-160px)] max-w-7xl place-items-center px-4 py-10 sm:px-6 lg:px-8">
      <form onSubmit={submit} className="w-full max-w-md rounded border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5">
          <div className="flex h-11 w-11 items-center justify-center rounded bg-slate-950 text-white">
            <Lock className="h-5 w-5" />
          </div>
          <h1 className="mt-4 text-2xl font-black">Đăng nhập AdminCP</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">Khu quản trị đơn hàng, điều phối Zalo và dữ liệu vận hành.</p>
        </div>
        <div className="grid gap-4">
          <label>
            <FieldLabel>Tài khoản</FieldLabel>
            <input value={username} onChange={(event) => setUsername(event.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm font-semibold" />
          </label>
          <label>
            <FieldLabel>Mật khẩu</FieldLabel>
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm font-semibold" />
          </label>
        </div>
        {error && <div className="mt-4 rounded border border-red-200 bg-red-50 p-3 text-sm font-bold text-red-700">{error}</div>}
        <button disabled={loading} className="mt-5 w-full rounded bg-red-600 px-4 py-2.5 text-sm font-black text-white disabled:opacity-60">
          {loading ? "Đang đăng nhập..." : "Đăng nhập"}
        </button>
        <p className="mt-4 text-xs leading-5 text-slate-500">
          Cấu hình bằng `ADMIN_USERNAME`, `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET` trong `.env` trên VPS.
        </p>
      </form>
    </section>
  );
}

function AdminDashboard({ orders }: { orders: Order[] }) {
  const stats = [
    ["Tổng đơn hôm nay", orders.length, BarChart3],
    ["Chờ xác nhận", orders.filter((order) => order.status === "PENDING_CONFIRMATION").length, AlertTriangle],
    ["Sẵn sàng bán Zalo", orders.filter((order) => order.dispatchStatus === "NOT_DISPATCHED").length, Send],
    ["Đang giao", orders.filter((order) => ["IN_TRANSIT", "DELIVERY_IN_PROGRESS"].includes(order.status)).length, Truck],
    ["Hoàn tất", orders.filter((order) => order.status === "DELIVERED").length, CheckCircle2],
    ["Sự cố", orders.filter((order) => order.status === "ISSUE_REPORTED").length, AlertTriangle],
  ];
  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {stats.map(([label, value, Icon]) => (
          <div key={label as string} className="rounded border border-slate-200 bg-white p-5">
            {React.createElement(Icon as React.ElementType, { className: "h-5 w-5 text-red-600" })}
            <div className="mt-4 text-3xl font-black">{String(value)}</div>
            <div className="mt-1 text-sm font-bold text-slate-500">{label as string}</div>
          </div>
        ))}
      </div>
      <div className="rounded border border-slate-200 bg-white p-5">
        <h2 className="font-black">Việc cần xử lý</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {["Xác nhận các đơn cần báo giá thủ công", "Preview nội dung bán group Zalo", "Duyệt tài xế nhận đơn"].map((item) => (
            <div key={item} className="rounded border border-slate-200 bg-slate-50 p-4 text-sm font-bold text-slate-700">{item}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AdminOrders({
  orders,
  selectedOrderId,
  setSelectedOrderId,
  selectedOrder,
  onApprove,
  onAssignVehicle,
  onSave,
  onUnauthorized,
}: {
  orders: Order[];
  selectedOrderId: string;
  setSelectedOrderId: (id: string) => void;
  selectedOrder?: Order;
  onApprove: (finalPrice: number, note: string) => void;
  onAssignVehicle: () => void;
  onSave: (updates: AdminOrderEditPayload) => Promise<void>;
  onUnauthorized: () => void;
}) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dispatchFilter, setDispatchFilter] = useState("all");
  const [routeFilter, setRouteFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState("");

  const statusOptions = useMemo(() => Array.from(new Set(orders.map((order) => order.status))), [orders]);
  const dispatchOptions = useMemo(() => Array.from(new Set(orders.map((order) => order.dispatchStatus))), [orders]);
  const filteredOrders = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const normalizedRoute = routeFilter.trim().toLowerCase();

    return orders.filter((order) => {
      const orderDate = order.createdAt?.slice(0, 10) || "";
      const matchesStatus = statusFilter === "all" || order.status === statusFilter;
      const matchesDispatch = dispatchFilter === "all" || order.dispatchStatus === dispatchFilter;
      const matchesDateFrom = !dateFrom || orderDate >= dateFrom;
      const matchesDateTo = !dateTo || orderDate <= dateTo;
      const routeHaystack = [
        order.routeName,
        order.pickupProvince,
        order.deliveryProvince,
        order.pickupAddress,
        order.deliveryAddress,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      const haystack = [
        order.orderCode,
        order.routeName,
        order.senderName,
        order.senderPhone,
        order.receiverName,
        order.receiverPhone,
        order.pickupAddress,
        order.deliveryAddress,
        order.itemDescription,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return (
        matchesStatus &&
        matchesDispatch &&
        matchesDateFrom &&
        matchesDateTo &&
        (!normalizedRoute || routeHaystack.includes(normalizedRoute)) &&
        (!normalizedQuery || haystack.includes(normalizedQuery))
      );
    });
  }, [dateFrom, dateTo, dispatchFilter, orders, query, routeFilter, statusFilter]);

  const approvedRevenue = filteredOrders.reduce((sum, order) => sum + (order.finalPrice || 0), 0);
  const quotedRevenue = filteredOrders.reduce((sum, order) => sum + (order.quotedPrice || 0), 0);

  const opsStats = [
    { label: "Don dang loc", value: filteredOrders.length },
    { label: "Da duyet", value: `${approvedRevenue.toLocaleString("vi-VN")}d` },
    { label: "Gia de xuat", value: `${quotedRevenue.toLocaleString("vi-VN")}d` },
    { label: "Hoan tat", value: filteredOrders.filter((order) => order.status === "DELIVERED").length },
  ];

  async function exportCsv() {
    setExporting(true);
    setExportError("");
    try {
      const params = new URLSearchParams();
      if (query.trim()) params.set("q", query.trim());
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (dispatchFilter !== "all") params.set("dispatch", dispatchFilter);
      if (routeFilter.trim()) params.set("route", routeFilter.trim());
      if (dateFrom) params.set("dateFrom", dateFrom);
      if (dateTo) params.set("dateTo", dateTo);
      const response = await fetch(`/api/admin/orders/export.csv?${params.toString()}`);
      if (response.status === 401) {
        onUnauthorized();
        return;
      }
      if (!response.ok) throw new Error("Khong export duoc file CSV.");
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `chuyenphat24h-orders-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      setExportError(error instanceof Error ? error.message : "Khong export duoc file CSV.");
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_420px]">
      <div className="overflow-hidden rounded border border-slate-200 bg-white">
        <div className="border-b border-slate-200 p-4">
          <h2 className="font-black">Danh sách đơn hàng</h2>
        </div>
        <div className="border-b border-slate-200 bg-slate-50 p-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <p className="text-xs font-semibold text-slate-500">
              Dang hien thi {filteredOrders.length}/{orders.length} don trong he thong.
            </p>
            <div className="grid gap-2 sm:grid-cols-2 lg:w-[760px] xl:grid-cols-3">
              <label>
                <FieldLabel>Tim nhanh</FieldLabel>
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Ma don, so dien thoai, tuyen..."
                  className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm font-semibold"
                />
              </label>
              <label>
                <FieldLabel>Tuyen / tinh</FieldLabel>
                <input
                  value={routeFilter}
                  onChange={(event) => setRouteFilter(event.target.value)}
                  placeholder="Ha Noi, Bac Ninh..."
                  className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm font-semibold"
                />
              </label>
              <label>
                <FieldLabel>Trang thai</FieldLabel>
                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm font-semibold"
                >
                  <option value="all">Tat ca</option>
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {STATUS_LABELS[status] || status}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <FieldLabel>Tu ngay</FieldLabel>
                <input type="date" value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm font-semibold" />
              </label>
              <label>
                <FieldLabel>Den ngay</FieldLabel>
                <input type="date" value={dateTo} onChange={(event) => setDateTo(event.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm font-semibold" />
              </label>
              <label>
                <FieldLabel>Dieu phoi</FieldLabel>
                <select
                  value={dispatchFilter}
                  onChange={(event) => setDispatchFilter(event.target.value)}
                  className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm font-semibold"
                >
                  <option value="all">Tat ca</option>
                  {dispatchOptions.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </label>
              <button
                type="button"
                onClick={exportCsv}
                disabled={exporting}
                className="mt-5 flex items-center justify-center gap-2 rounded bg-slate-950 px-3 py-2 text-sm font-black text-white disabled:opacity-60"
              >
                <Download className="h-4 w-4" />
                {exporting ? "Dang xuat..." : "Export CSV"}
              </button>
            </div>
          </div>
          {exportError && <div className="mt-3 rounded border border-red-200 bg-red-50 p-3 text-sm font-bold text-red-700">{exportError}</div>}
          <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
            {opsStats.map((stat) => (
              <div key={stat.label} className="rounded border border-slate-200 bg-white px-3 py-2">
                <div className="text-lg font-black text-slate-950">{stat.value}</div>
                <div className="text-xs font-bold text-slate-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[920px] text-left text-sm">
            <thead className="bg-slate-950 text-xs uppercase tracking-wide text-white">
              <tr>
                <th className="px-4 py-3">Mã đơn</th>
                <th className="px-4 py-3">Tuyến</th>
                <th className="px-4 py-3">Loại hàng</th>
                <th className="px-4 py-3">Trạng thái</th>
                <th className="px-4 py-3">Giá</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id} onClick={() => setSelectedOrderId(order.id)} className={`cursor-pointer border-t border-slate-100 ${selectedOrderId === order.id ? "bg-red-50" : "hover:bg-slate-50"}`}>
                  <td className="px-4 py-3">
                    <div className="font-black">{order.orderCode}</div>
                    <div className="text-xs font-semibold text-slate-500">{order.senderPhone || order.receiverPhone}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-semibold">{order.routeName}</div>
                    <div className="text-xs font-semibold text-slate-500">{order.pickupProvince} - {order.deliveryProvince}</div>
                  </td>
                  <td className="px-4 py-3">{ITEM_TYPE_LABELS[order.itemType]}</td>
                  <td className="px-4 py-3"><StatusBadge status={STATUS_LABELS[order.status]} /></td>
                  <td className="px-4 py-3 font-bold">
                    {order.finalPrice ? `${order.finalPrice.toLocaleString("vi-VN")}đ` : `Đề xuất ${order.quotedPrice?.toLocaleString("vi-VN") || "-"}đ`}
                  </td>
                </tr>
              ))}
              {!filteredOrders.length && (
                <tr>
                  <td colSpan={5} className="border-t border-slate-100 px-4 py-10 text-center text-sm font-semibold text-slate-500">
                    Khong co don phu hop voi bo loc hien tai.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <OrderDetail order={selectedOrder} onApprove={onApprove} onAssignVehicle={onAssignVehicle} onSave={onSave} />
    </div>
  );
}

function OrderDetail({
  order,
  onApprove,
  onAssignVehicle,
  onSave,
}: {
  order?: Order;
  onApprove: (finalPrice: number, note: string) => void;
  onAssignVehicle: () => void;
  onSave: (updates: AdminOrderEditPayload) => Promise<void>;
}) {
  const [finalPrice, setFinalPrice] = useState(0);
  const [approvalNote, setApprovalNote] = useState("Duyet gia tu AdminCP");
  const [savingEdit, setSavingEdit] = useState(false);
  const [editError, setEditError] = useState("");
  const [editMessage, setEditMessage] = useState("");
  const [editForm, setEditForm] = useState({
    senderName: "",
    senderPhone: "",
    pickupAddress: "",
    receiverName: "",
    receiverPhone: "",
    deliveryAddress: "",
    itemDescription: "",
    packageCount: 1,
    weight: 0,
    quotedPrice: 0,
    finalPrice: 0,
    status: OrderStatus.PENDING_CONFIRMATION,
    customerTrackingNote: "",
    operationNote: "",
  });

  useEffect(() => {
    setFinalPrice(order?.finalPrice || order?.quotedPrice || 0);
    setApprovalNote("Duyet gia tu AdminCP");
    setEditError("");
    setEditMessage("");
    setEditForm({
      senderName: order?.senderName || "",
      senderPhone: order?.senderPhone || "",
      pickupAddress: order?.pickupAddress || "",
      receiverName: order?.receiverName || "",
      receiverPhone: order?.receiverPhone || "",
      deliveryAddress: order?.deliveryAddress || "",
      itemDescription: order?.itemDescription || "",
      packageCount: order?.packageCount || 1,
      weight: order?.weight || 0,
      quotedPrice: order?.quotedPrice || 0,
      finalPrice: order?.finalPrice || 0,
      status: order?.status || OrderStatus.PENDING_CONFIRMATION,
      customerTrackingNote: order?.customerTrackingNote || "",
      operationNote: "",
    });
  }, [order?.id, order?.updatedAt, order?.finalPrice, order?.quotedPrice]);

  async function submitOrderEdit(event: React.FormEvent) {
    event.preventDefault();
    setSavingEdit(true);
    setEditError("");
    setEditMessage("");
    try {
      await onSave({
        ...editForm,
        packageCount: Number(editForm.packageCount) || 1,
        weight: Number(editForm.weight) || 0,
        quotedPrice: Number(editForm.quotedPrice) || undefined,
        finalPrice: Number(editForm.finalPrice) || undefined,
      });
      setEditMessage("Da luu cap nhat don hang.");
    } catch (error) {
      setEditError(error instanceof Error ? error.message : "Khong luu duoc don hang.");
    } finally {
      setSavingEdit(false);
    }
  }

  if (!order) {
    return <div className="rounded border border-slate-200 bg-white p-5 text-sm font-semibold text-slate-500">Chọn một đơn để xem chi tiết.</div>;
  }
  return (
    <div className="h-fit rounded border border-slate-200 bg-white p-5">
      <h2 className="font-black">Chi tiết đơn</h2>
      <div className="mt-4 grid gap-3">
        <Info label="Mã đơn" value={order.orderCode} />
        <Info label="Khách gửi" value={`${order.senderName} - ${order.senderPhone}`} />
        <Info label="Lấy hàng" value={order.pickupAddress} />
        <Info label="Giao hàng" value={order.deliveryAddress} />
        <Info label="Mo ta hang" value={order.itemDescription || "Chua co"} />
        <Info label="So kien / kg" value={`${order.packageCount || 1} kien / ${order.weight || 0} kg`} />
        <Info label="Gia de xuat" value={order.quotedPrice ? `${order.quotedPrice.toLocaleString("vi-VN")}đ` : "Chua co"} />
        <Info label="Gia da duyet" value={order.finalPrice ? `${order.finalPrice.toLocaleString("vi-VN")}đ` : "Chua duyet"} />
        <Info label="Maps" value={`${order.mapsDistanceKm || 0} km / ${order.mapsDurationMinutes || 0} phút`} />
        <Info label="Dispatch" value={order.dispatchStatus} />
        <Info label="Nhóm gợi ý" value={order.suggestedZaloGroups.join(", ") || "Chưa có"} />
        <Info label="Xe nhan don" value={order.assignedDriverName ? `${order.assignedDriverName} - ${order.assignedDriverPhone} - ${order.assignedVehicleType} ${order.assignedVehiclePlate || ""}` : "Chua gan xe"} />
        <Info label="Ghi chú nội bộ" value={order.internalNotes || "Chưa có"} />
      </div>
      <form onSubmit={submitOrderEdit} className="mt-5 rounded border border-slate-200 bg-slate-50 p-4">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="font-black">Sua don / trang thai / ghi chu</h3>
          <StatusBadge status={STATUS_LABELS[editForm.status]} />
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label>
            <FieldLabel>Ten khach gui</FieldLabel>
            <input value={editForm.senderName} onChange={(event) => setEditForm((current) => ({ ...current, senderName: event.target.value }))} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm font-semibold" />
          </label>
          <label>
            <FieldLabel>SDT khach gui</FieldLabel>
            <input value={editForm.senderPhone} onChange={(event) => setEditForm((current) => ({ ...current, senderPhone: event.target.value }))} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm font-semibold" />
          </label>
          <label>
            <FieldLabel>Ten nguoi nhan</FieldLabel>
            <input value={editForm.receiverName} onChange={(event) => setEditForm((current) => ({ ...current, receiverName: event.target.value }))} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm font-semibold" />
          </label>
          <label>
            <FieldLabel>SDT nguoi nhan</FieldLabel>
            <input value={editForm.receiverPhone} onChange={(event) => setEditForm((current) => ({ ...current, receiverPhone: event.target.value }))} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm font-semibold" />
          </label>
          <label className="sm:col-span-2">
            <FieldLabel>Dia chi lay hang</FieldLabel>
            <textarea value={editForm.pickupAddress} onChange={(event) => setEditForm((current) => ({ ...current, pickupAddress: event.target.value }))} rows={2} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm font-semibold" />
          </label>
          <label className="sm:col-span-2">
            <FieldLabel>Dia chi giao hang</FieldLabel>
            <textarea value={editForm.deliveryAddress} onChange={(event) => setEditForm((current) => ({ ...current, deliveryAddress: event.target.value }))} rows={2} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm font-semibold" />
          </label>
          <label className="sm:col-span-2">
            <FieldLabel>Mo ta hang</FieldLabel>
            <textarea value={editForm.itemDescription} onChange={(event) => setEditForm((current) => ({ ...current, itemDescription: event.target.value }))} rows={2} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm font-semibold" />
          </label>
          <label>
            <FieldLabel>So kien</FieldLabel>
            <input type="number" min={1} value={editForm.packageCount} onChange={(event) => setEditForm((current) => ({ ...current, packageCount: Number(event.target.value) || 1 }))} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm font-semibold" />
          </label>
          <label>
            <FieldLabel>Can nang kg</FieldLabel>
            <input type="number" min={0} step={0.1} value={editForm.weight} onChange={(event) => setEditForm((current) => ({ ...current, weight: Number(event.target.value) || 0 }))} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm font-semibold" />
          </label>
          <label>
            <FieldLabel>Gia de xuat</FieldLabel>
            <input type="number" min={0} step={1000} value={editForm.quotedPrice} onChange={(event) => setEditForm((current) => ({ ...current, quotedPrice: Number(event.target.value) || 0 }))} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm font-semibold" />
          </label>
          <label>
            <FieldLabel>Gia da duyet</FieldLabel>
            <input type="number" min={0} step={1000} value={editForm.finalPrice} onChange={(event) => setEditForm((current) => ({ ...current, finalPrice: Number(event.target.value) || 0 }))} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm font-semibold" />
          </label>
          <label className="sm:col-span-2">
            <FieldLabel>Trang thai don</FieldLabel>
            <select value={editForm.status} onChange={(event) => setEditForm((current) => ({ ...current, status: event.target.value as OrderStatus }))} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm font-semibold">
              {adminOrderStatusOptions.map((status) => (
                <option key={status} value={status}>{STATUS_LABELS[status]}</option>
              ))}
            </select>
          </label>
          <label className="sm:col-span-2">
            <FieldLabel>Ghi chu cho khach tra cuu</FieldLabel>
            <textarea value={editForm.customerTrackingNote} onChange={(event) => setEditForm((current) => ({ ...current, customerTrackingNote: event.target.value }))} rows={2} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm font-semibold" />
          </label>
          <label className="sm:col-span-2">
            <FieldLabel>Them ghi chu noi bo</FieldLabel>
            <textarea value={editForm.operationNote} onChange={(event) => setEditForm((current) => ({ ...current, operationNote: event.target.value }))} rows={3} placeholder="Vi du: Khach doi gio lay hang, da goi xac nhan..." className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm font-semibold" />
          </label>
        </div>
        {editError && <div className="mt-3 rounded border border-red-200 bg-red-50 p-3 text-sm font-bold text-red-700">{editError}</div>}
        {editMessage && <div className="mt-3 rounded border border-emerald-200 bg-emerald-50 p-3 text-sm font-bold text-emerald-700">{editMessage}</div>}
        <button type="submit" disabled={savingEdit} className="mt-4 w-full rounded bg-slate-950 px-4 py-2 text-sm font-black text-white disabled:opacity-60">
          {savingEdit ? "Dang luu..." : "Luu cap nhat don"}
        </button>
      </form>
      {Boolean(order.timeline?.length) && (
        <div className="mt-4 rounded border border-slate-200 bg-slate-50 p-4">
          <h3 className="text-sm font-black">Lich su xu ly gan nhat</h3>
          <div className="mt-3 space-y-3">
            {order.timeline.slice(-5).reverse().map((event) => (
              <div key={event.id} className="border-l-2 border-red-500 pl-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-black text-slate-900">{event.title}</p>
                  <span className="text-[11px] font-bold text-slate-500">
                    {new Date(event.createdAt).toLocaleString("vi-VN")}
                  </span>
                </div>
                <p className="mt-1 text-xs font-semibold leading-5 text-slate-600">{event.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      {Boolean(order.itemImages?.length) && (
        <div className="mt-4">
          <FieldLabel>Hinh anh san pham</FieldLabel>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {order.itemImages?.map((image, index) => (
              <a key={image.slice(0, 48)} href={image} target="_blank" rel="noreferrer" className="aspect-square overflow-hidden rounded border border-slate-200 bg-slate-50">
                <img src={image} alt={`Anh hang ${index + 1}`} className="h-full w-full object-cover" />
              </a>
            ))}
          </div>
        </div>
      )}
      <div className="mt-5 rounded border border-amber-200 bg-amber-50 p-4">
        <h3 className="font-black">Duyet don qua dieu hanh</h3>
        <div className="mt-3 grid gap-3">
          <label>
            <FieldLabel>Gia cuoc chinh thuc</FieldLabel>
            <input type="number" min={1000} step={1000} value={finalPrice} onChange={(event) => setFinalPrice(Number(event.target.value) || 0)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm font-semibold" />
          </label>
          <label>
            <FieldLabel>Ghi chu duyet</FieldLabel>
            <input value={approvalNote} onChange={(event) => setApprovalNote(event.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm font-semibold" />
          </label>
          <button type="button" onClick={() => onApprove(finalPrice, approvalNote)} className="rounded bg-slate-950 px-4 py-2 text-sm font-black text-white">
            Duyet gia va gui Zalo khach
          </button>
          <button type="button" onClick={onAssignVehicle} className="rounded bg-red-600 px-4 py-2 text-sm font-black text-white">
            Tim/giao xe gan nhat va gui Zalo
          </button>
        </div>
      </div>
    </div>
  );
}

function AdminDispatch({
  selectedOrder,
  preview,
  previewDispatch,
  sendDispatch,
}: {
  selectedOrder?: Order;
  preview: Array<{ targetGroupName: string; messageContent: string }>;
  previewDispatch: () => void;
  sendDispatch: () => void;
}) {
  return (
    <div className="grid gap-5 xl:grid-cols-[380px_1fr]">
      <div className="rounded border border-slate-200 bg-white p-5">
        <h2 className="font-black">Điều phối Zalo</h2>
        {selectedOrder ? (
          <div className="mt-4 space-y-3">
            <Info label="Đơn đang chọn" value={selectedOrder.orderCode} />
            <Info label="Tuyến" value={`${selectedOrder.pickupProvince} → ${selectedOrder.deliveryProvince}`} />
            <Info label="Loại hàng" value={ITEM_TYPE_LABELS[selectedOrder.itemType]} />
            <Info label="Nhóm gợi ý" value={selectedOrder.suggestedZaloGroups.join(", ") || "Tạo preview để gợi ý"} />
            <div className="flex flex-col gap-2 pt-2">
              <button onClick={previewDispatch} className="rounded border border-slate-300 px-4 py-2 text-sm font-black">Preview tin bot</button>
              <button onClick={sendDispatch} className="rounded bg-red-600 px-4 py-2 text-sm font-black text-white">Gửi vào group Zalo mock</button>
            </div>
          </div>
        ) : <p className="mt-3 text-sm text-slate-500">Chưa có đơn.</p>}
      </div>
      <div className="rounded border border-slate-200 bg-white p-5">
        <h2 className="font-black">Nội dung bot preview</h2>
        {preview[0] ? (
          <div className="mt-4">
            <p className="mb-2 text-sm font-bold text-slate-600">Group: {preview[0].targetGroupName}</p>
            <pre className="max-h-[560px] overflow-auto whitespace-pre-wrap rounded bg-slate-950 p-4 text-xs leading-5 text-slate-100">
              {preview[0].messageContent}
            </pre>
          </div>
        ) : (
          <div className="mt-4 rounded border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm font-semibold text-slate-500">Bấm preview để tạo nội dung bán đơn.</div>
        )}
      </div>
    </div>
  );
}

function AdminPlaceholder({ title, icon: Icon, rows }: { title: string; icon: React.ElementType; rows: string[] }) {
  return (
    <div className="rounded border border-slate-200 bg-white p-5">
      <div className="flex items-center gap-3">
        <Icon className="h-5 w-5 text-red-600" />
        <h2 className="font-black">{title}</h2>
      </div>
      <div className="mt-5 grid gap-3">
        {rows.map((row) => (
          <div key={row} className="flex items-center justify-between rounded border border-slate-200 bg-slate-50 p-4 text-sm font-bold text-slate-700">
            <span>{row}</span>
            <span className="rounded bg-white px-2 py-1 text-xs font-black text-slate-500">MVP</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminSeoPanel({
  pages,
  onPagesChange,
  onUnauthorized,
}: {
  pages: SeoPageConfig[];
  onPagesChange: (pages: SeoPageConfig[]) => void;
  onUnauthorized: () => void;
}) {
  const [selectedSlug, setSelectedSlug] = useState(pages[0]?.slug || "");
  const [draft, setDraft] = useState<SeoPageConfig>(pages[0] || defaultSeoPages[0]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const seoChecks = [
    "HTML production inject title, description, canonical, OpenGraph và Twitter Card theo URL",
    "robots.txt cho phép public page, chặn /admincp và /api/",
    "sitemap.xml gồm trang chính và landing page SEO dịch vụ",
    "JSON-LD LocalBusiness, WebSite và Service được xuất từ server",
  ];
  const selectedPage = pages.find((page) => page.slug === selectedSlug) || pages[0] || defaultSeoPages[0];

  useEffect(() => {
    if (!pages.some((page) => page.slug === selectedSlug)) {
      setSelectedSlug(pages[0]?.slug || "");
      return;
    }
    setDraft(selectedPage);
  }, [pages, selectedPage, selectedSlug]);

  function updateDraft<K extends keyof SeoPageConfig>(field: K, value: SeoPageConfig[K]) {
    setDraft((current) => ({ ...current, [field]: value }));
  }

  async function saveSelectedPage(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");
    try {
      const res = await fetch(`/api/admin/seo-pages/${draft.slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      if (res.status === 401) {
        onUnauthorized();
        return;
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Không lưu được SEO page.");
      const nextPages = pages.map((page) => (page.slug === data.slug ? data : page));
      onPagesChange(nextPages);
      setMessage("Đã lưu nội dung SEO.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không lưu được SEO page.");
    } finally {
      setSaving(false);
    }
  }

  async function resetSeo() {
    setSaving(true);
    setMessage("");
    setError("");
    try {
      const res = await fetch("/api/admin/seo-pages/reset", { method: "POST" });
      if (res.status === 401) {
        onUnauthorized();
        return;
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Không reset được SEO pages.");
      onPagesChange(data);
      setSelectedSlug(data[0]?.slug || "");
      setMessage("Đã reset SEO pages về mặc định.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không reset được SEO pages.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="rounded border border-slate-200 bg-white p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <FileSearch className="h-5 w-5 text-red-600" />
              <h2 className="font-black">Nội dung SEO</h2>
            </div>
            <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">Chỉnh title, description, H1, nội dung intro, keyword và tần suất sitemap cho từng landing page.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <a href="/sitemap.xml" target="_blank" rel="noreferrer" className="rounded border border-slate-300 px-4 py-2 text-sm font-black text-slate-700 hover:bg-slate-50">
              Xem sitemap
            </a>
            <button type="button" onClick={resetSeo} disabled={saving} className="rounded border border-slate-300 px-4 py-2 text-sm font-black text-slate-700 hover:bg-slate-50 disabled:opacity-60">
              Reset SEO
            </button>
          </div>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {seoChecks.map((item) => (
            <div key={item} className="flex gap-3 rounded border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold leading-6 text-emerald-800">
              <CheckCircle2 className="mt-0.5 h-4 w-4 flex-none" />
              {item}
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={saveSelectedPage} className="grid gap-5 lg:grid-cols-[340px_1fr]">
        <div className="rounded border border-slate-200 bg-white p-4">
          <h3 className="font-black">Landing page</h3>
          <div className="mt-4 grid max-h-[580px] gap-2 overflow-y-auto pr-1">
            {pages.map((page) => (
              <button
                key={page.slug}
                type="button"
                onClick={() => setSelectedSlug(page.slug)}
                className={`rounded border p-3 text-left transition ${page.slug === selectedSlug ? "border-red-300 bg-red-50" : "border-slate-200 bg-white hover:bg-slate-50"}`}
              >
                <span className="block text-xs font-black text-red-600">/{page.slug}</span>
                <span className="mt-1 block text-sm font-bold leading-5 text-slate-800">{page.h1}</span>
                <span className="mt-1 block text-xs font-semibold text-slate-500">Priority {page.priority.toFixed(2)} · {page.changefreq}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded border border-slate-200 bg-white p-5">
          <div className="grid gap-4">
            <ThemeEditorInput label="Slug URL" value={`/${draft.slug}`} onChange={() => undefined} />
            <ThemeEditorInput label="Meta title" value={draft.title} onChange={(value) => updateDraft("title", value)} />
            <ThemeEditorTextarea label="Meta description" value={draft.description} onChange={(value) => updateDraft("description", value)} />
            <ThemeEditorInput label="H1" value={draft.h1} onChange={(value) => updateDraft("h1", value)} />
            <ThemeEditorTextarea label="Intro nội dung" value={draft.intro} onChange={(value) => updateDraft("intro", value)} />
            <ThemeEditorInput label="Keywords, cách nhau bằng dấu phẩy" value={draft.keywords.join(", ")} onChange={(value) => updateDraft("keywords", value.split(",").map((item) => item.trim()).filter(Boolean))} />
            <div className="grid gap-4 sm:grid-cols-2">
              <label>
                <FieldLabel>Priority sitemap</FieldLabel>
                <input type="number" min="0.1" max="1" step="0.01" value={draft.priority} onChange={(event) => updateDraft("priority", Number(event.target.value))} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm font-semibold" />
              </label>
              <label>
                <FieldLabel>Changefreq</FieldLabel>
                <select value={draft.changefreq} onChange={(event) => updateDraft("changefreq", event.target.value as SeoPageConfig["changefreq"])} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm font-semibold">
                  <option value="daily">daily</option>
                  <option value="weekly">weekly</option>
                  <option value="monthly">monthly</option>
                </select>
              </label>
            </div>

            <div className="rounded border border-slate-200 bg-slate-50 p-4">
              <h4 className="text-sm font-black text-slate-800">Preview Google</h4>
              <div className="mt-3 rounded bg-white p-4">
                <div className="text-xs text-slate-500">chuyenphat24h.com/{draft.slug}</div>
                <div className="mt-1 text-lg font-medium leading-6 text-[#1a0dab]">{draft.title}</div>
                <div className="mt-1 text-sm leading-6 text-[#4d5156]">{draft.description}</div>
              </div>
            </div>

            {(error || message) && (
              <div>
                {error && <div className="rounded border border-red-200 bg-red-50 p-3 text-sm font-bold text-red-700">{error}</div>}
                {message && <div className="rounded border border-emerald-200 bg-emerald-50 p-3 text-sm font-bold text-emerald-700">{message}</div>}
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              <button type="submit" disabled={saving} className="rounded bg-slate-950 px-5 py-2.5 text-sm font-black text-white disabled:opacity-60">
                {saving ? "Đang lưu..." : "Lưu SEO page"}
              </button>
              <a href={`/${draft.slug}`} target="_blank" rel="noreferrer" className="rounded border border-slate-300 px-5 py-2.5 text-sm font-black text-slate-700 hover:bg-slate-50">
                Xem trang
              </a>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  return <span className="rounded bg-slate-100 px-2 py-1 text-xs font-black text-slate-700">{status}</span>;
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
          <h2 className="mt-3 text-3xl font-black">Có xe chạy tuyến tỉnh? Nhận thêm đơn mỗi ngày</h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">
            Đơn hàng được gửi vào nhóm Zalo theo từng tuyến, tài xế khớp hành trình có thể chủ động nhận đơn. Admin vẫn duyệt cuối để kiểm soát chất lượng.
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
                <input key={key} value={form[key as keyof typeof form] as string} onChange={(event) => setForm({ ...form, [key]: event.target.value })} className="rounded border border-slate-700 bg-slate-950 px-3 py-2 text-sm font-semibold text-white" placeholder={label} />
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
      <div className="grid gap-4 md:grid-cols-3">
        <ValueCard icon={ShieldCheck} title="Hàng hóa hợp lệ" desc="Không nhận hàng cấm, hàng vi phạm pháp luật hoặc không thể xác minh người gửi." />
        <ValueCard icon={AlertTriangle} title="Hàng cần báo giá" desc="Xe máy, tivi, tủ lạnh, máy giặt, hàng quá khổ và hàng dễ vỡ cần xác nhận thủ công." />
        <ValueCard icon={PackageCheck} title="Giao nhận" desc="Tài xế nhận tận nơi, giao tận tay theo điều phối và cập nhật tracking public." />
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
        <Contact icon={<MessageSquare />} title="Điều phối" value="Group Zalo theo tuyến trong MVP" />
      </div>
    </PageShell>
  );
}

function Contact({ icon, title, value }: { icon: React.ReactNode; title: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[#eaeef4] bg-white p-5 shadow-[0_12px_34px_rgba(12,35,73,.06)]">
      <div className="mb-3 h-6 w-6 text-[#0057b8]">{icon}</div>
      <h2 className="font-extrabold text-[#0c2349]">{title}</h2>
      <p className="mt-2 text-sm font-semibold text-slate-600">{value}</p>
    </div>
  );
}

function SeoPage({ setView, seoPages }: { setView: (view: View) => void; seoPages: SeoPageConfig[] }) {
  const slug = window.location.pathname.replace(/^\//, "");
  const page = seoPages.find((item) => item.slug === slug) || seoPages[0];
  const relatedPages = seoPages.filter((item) => item.slug !== page.slug).slice(0, 6);

  return (
    <PageShell title={page.h1} desc={page.description}>
      <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
        <article className="rounded-2xl border border-[#eaeef4] bg-white p-6 shadow-[0_12px_34px_rgba(12,35,73,.06)]">
          <p className="text-[15px] leading-8 text-slate-700">{page.intro}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {page.keywords.map((keyword) => (
              <span key={keyword} className="rounded-full bg-[#eef7ff] px-3 py-1 text-xs font-black text-[#0057b8]">
                {keyword}
              </span>
            ))}
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {["Nhận tận nơi", "Giao tận tay", "Có mã tra cứu"].map((item) => (
              <div key={item} className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm font-black text-[#0c2349]">
                <CheckCircle2 className="mb-3 h-5 w-5 text-[#0057b8]" />
                {item}
              </div>
            ))}
          </div>
          <button onClick={() => setView("order")} className="mt-6 rounded-[11px] bg-gradient-to-b from-[#ff1b24] to-[#e30613] px-5 py-3 text-sm font-black text-white shadow-[0_8px_18px_rgba(227,6,19,.26)]">Tạo đơn ngay</button>
        </article>
        <aside className="rounded-2xl border border-[#eaeef4] bg-white p-5 shadow-[0_12px_34px_rgba(12,35,73,.06)]">
          <h2 className="text-base font-black text-[#0c2349]">Dịch vụ liên quan</h2>
          <div className="mt-4 grid gap-3">
            {relatedPages.map((item) => (
              <a key={item.slug} href={`/${item.slug}`} className="rounded border border-slate-200 p-3 text-sm font-bold leading-6 text-slate-700 transition hover:border-[#0057b8] hover:text-[#003b73]">
                {item.h1}
              </a>
            ))}
          </div>
        </aside>
      </div>
    </PageShell>
  );
}

function PageShell({ title, desc, children }: { title: string; desc: string; children: React.ReactNode }) {
  return (
    <section className="bg-[#f6f8fb] text-[#14233f]">
      <div
        className="relative overflow-hidden bg-[#003b73] text-white"
        style={{
          backgroundImage:
            "linear-gradient(100deg, rgba(0,59,115,.96) 0%, rgba(0,59,115,.88) 40%, rgba(0,87,184,.58) 100%), url('/theme/banner-hero.png')",
          backgroundPosition: "center 42%",
          backgroundSize: "cover",
        }}
      >
        <div className="mx-auto max-w-[1480px] px-4 py-12 sm:px-6 lg:px-[10%] lg:py-16">
          <p className="text-xs font-extrabold uppercase tracking-[.2em] text-[#ff3b42]">Chuyển Phát 24H</p>
          <h1 className="mt-3 max-w-4xl text-[34px] font-extrabold leading-tight tracking-tight sm:text-[44px]">{title}</h1>
          <p className="mt-4 max-w-3xl text-[15px] font-medium leading-7 text-[#dbe4f1]">{desc}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href={phoneHref} className="inline-flex items-center gap-2 rounded-full bg-gradient-to-b from-[#ff1b24] to-[#e30613] px-5 py-3 text-sm font-extrabold text-white shadow-[0_8px_20px_rgba(227,6,19,.28)]">
              <Phone className="h-4 w-4" />
              {hotline}
            </a>
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-[1480px] px-4 py-10 sm:px-6 lg:px-[10%]">{children}</div>
    </section>
  );
}

function Footer({ setView, theme }: { setView: (view: View) => void; theme: SiteThemeSettings }) {
  const footerPhoneHref = `tel:${theme.hotline.replace(/\D/g, "")}`;
  return (
    <footer className="text-[#c9d9ea]" style={{ background: `linear-gradient(135deg, ${theme.secondaryColor}, #002d58)` }}>
      <div className="mx-auto grid max-w-[1480px] gap-8 px-4 py-10 sm:px-6 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr] lg:px-[10%]">
        <div>
          <div className="flex items-center gap-3">
            <span className="flex h-[38px] w-[38px] flex-none items-center justify-center rounded-[10px] shadow-[0_6px_16px_rgba(0,87,184,.22)]" style={{ background: `linear-gradient(135deg, ${theme.accentColor}, ${theme.secondaryColor})` }}>
              <Truck className="h-6 w-6 text-white" />
            </span>
            <div className="font-extrabold tracking-wide text-white">
              {theme.brandShortName}
            </div>
          </div>
          <p className="mt-4 max-w-[340px] text-[13.5px] leading-6">
            {theme.footerDescription}
          </p>
        </div>
        <div>
          <h4 className="mb-4 mt-1 text-[13px] font-bold tracking-wide text-white">DỊCH VỤ</h4>
          <div className="grid gap-2 text-[13.5px]">
            <button onClick={() => setView("order")} className="text-left font-bold hover:text-white">Tạo đơn hàng</button>
            <button onClick={() => setView("tracking")} className="text-left font-bold hover:text-white">Tra cứu đơn</button>
            <button onClick={() => setView("routes")} className="text-left font-bold hover:text-white">Tuyến chuyển phát</button>
            <button onClick={() => setView("pricing")} className="text-left font-bold hover:text-white">Bảng giá</button>
          </div>
        </div>
        <div>
          <h4 className="mb-4 mt-1 text-[13px] font-bold tracking-wide text-white">LIÊN HỆ</h4>
          <div className="grid gap-3 text-[13.5px]">
            <a href={footerPhoneHref} className="flex items-center gap-2 font-bold text-white">
              <Phone className="h-4 w-4" style={{ color: theme.primaryColor }} />
              {theme.hotline}
            </a>
            <span className="flex items-center gap-2">
              <MapPin className="h-4 w-4" style={{ color: theme.primaryColor }} />
              {theme.footerLocation}
            </span>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-[12.5px] text-[#7b8aa0]">
        {theme.footerCopyright}
      </div>
    </footer>
  );
}

export default App;
