import React, { useMemo, useState } from "react";
import {
  ArrowRight,
  Check,
  ClipboardCheck,
  Coffee,
  FileText,
  Flower2,
  Headphones,
  MapPin,
  Menu,
  Package,
  Phone,
  ShieldCheck,
  Target,
  Truck,
  UserRound,
  X,
} from "lucide-react";
import { ITEM_TYPE_LABELS, ItemType } from "../lib/constants/enums";
import type { SiteThemeSettings } from "../lib/theme/themeTypes";

type View = "home" | "order" | "tracking" | "routes" | "pricing" | "policy" | "contact" | "admin" | "seo";

type ThemeLandingProps = {
  setView: (view: View) => void;
  theme: SiteThemeSettings;
};

const goodsTypes = [
  { name: "Giấy tờ, hồ sơ, hợp đồng", price: "Từ 25.000đ", icon: FileText },
  { name: "Hàng hóa thương mại", price: "Từ 40.000đ", icon: Package },
  { name: "Thực phẩm tươi sống", price: "Từ 50.000đ", icon: Flower2 },
  { name: "Đồ ăn, suất ăn, đồ uống", price: "Từ 35.000đ", icon: Coffee },
  { name: "Hàng cồng kềnh, hàng nặng", price: "Từ 80.000đ", icon: Truck },
  { name: "Hoa tươi, cây cảnh", price: "Từ 45.000đ", icon: Flower2 },
];

const routeCards = [
  ["BN", "Bắc Ninh"],
  ["BG", "Bắc Giang"],
  ["HY", "Hưng Yên"],
  ["HD", "Hải Dương"],
  ["HP", "Hải Phòng"],
  ["NĐ", "Nam Định"],
  ["TB", "Thái Bình"],
  ["NB", "Ninh Bình"],
];

const heroBenefits = [
  "Giao nhận tận tay",
  "Không lưu kho, bảo quản hàng tốt hơn",
  "Điều phối xe gần nhất",
  "Nhận giấy tờ, hàng gấp, đồ ăn, thực phẩm tươi sống",
  "Gửi hàng ngay, xe nhận và chuyển đi luôn",
  "Hàng đi cùng xe tuyến đang chạy",
];

const featureCards = [
  {
    icon: Truck,
    title: "Giao hàng liên tỉnh siêu tốc trong ngày",
    desc: "Hàng đi cùng xe tuyến chạy liên tục, không chờ đợi.",
  },
  {
    icon: Target,
    title: "Điều phối xe gần nhất nhận ngay, đi ngay",
    desc: "Xe gần nhất được điều phối nhanh chóng, linh hoạt.",
  },
  {
    icon: ClipboardCheck,
    title: "Giao nhận tận tay không qua trung gian",
    desc: "Tài xế trực tiếp nhận hàng và giao đến tay người nhận.",
  },
  {
    icon: ShieldCheck,
    title: "Hàng hóa được bảo quản tốt hơn",
    desc: "Không qua kho bãi, hạn chế va đập, giữ nguyên chất lượng.",
  },
  {
    icon: Headphones,
    title: "Hỗ trợ 24/7",
    desc: "Tư vấn và hỗ trợ mọi lúc, mọi nơi.",
  },
];

const whyCards = [
  ["Lấy hàng tận nơi", "Không cần mang hàng ra bến hoặc kho trung chuyển."],
  ["Chạy theo tuyến thật", "Tối ưu xe đang chạy tuyến Hà Nội và các tỉnh."],
  ["Báo giá rõ ràng", "Hàng đặc biệt được nhân viên gọi xác nhận trước."],
  ["Tracking đơn", "Khách hàng tra cứu trạng thái bằng mã đơn và số điện thoại."],
  ["Admin điều phối", "Đơn được kiểm soát trước khi giao cho tài xế."],
  ["Mở rộng đội xe", "Phù hợp mô hình đối tác xe 4 chỗ, 7 chỗ, bán tải, tải nhỏ."],
];

const landingNavItems: Array<[string, View]> = [
  ["Trang chủ", "home"],
  ["Tạo đơn", "order"],
  ["Tra cứu", "tracking"],
  ["Tuyến chuyển phát", "routes"],
  ["Bảng giá", "pricing"],
  ["Chính sách", "policy"],
  ["Liên hệ", "contact"],
];

export function ThemeLanding({ setView, theme }: ThemeLandingProps) {
  const [selectedType, setSelectedType] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const themePhoneHref = `tel:${theme.hotline.replace(/\D/g, "")}`;
  const primaryColor = theme.primaryColor;
  const selectedPrice = useMemo(
    () => goodsTypes.find((item) => item.name === selectedType)?.price || "Chọn loại hàng để xem giá",
    [selectedType],
  );

  const go = (view: View) => {
    setMobileOpen(false);
    setView(view);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="bg-white text-[#14233f]" style={{ fontFamily: "'Be Vietnam Pro', system-ui, sans-serif" }}>
      <section
        className="relative min-h-[660px] overflow-hidden pb-24 text-white"
        style={{
          backgroundImage:
            `linear-gradient(100deg, rgba(7,19,41,.96) 0%, rgba(7,19,41,.86) 26%, rgba(7,19,41,.40) 50%, rgba(7,19,41,.52) 74%, rgba(7,19,41,.92) 100%), url('${theme.heroImageUrl}')`,
          backgroundPosition: "center 42%",
          backgroundSize: "cover",
        }}
      >
        <header className="relative z-30 border-b border-white/10">
          <div className="mx-auto flex h-[78px] max-w-[1480px] items-center px-4 sm:px-6 lg:px-[10%]">
            <button onClick={() => go("home")} className="mr-7 flex flex-none items-center gap-2 text-left">
              <LogoMark theme={theme} />
              <span className="text-base font-extrabold tracking-wide text-white">
                {theme.brandShortName}
              </span>
            </button>

            <nav className="hidden min-w-0 flex-1 items-center gap-1 text-[13px] font-medium lg:flex">
              {landingNavItems.map(([label, itemView]) => (
                <React.Fragment key={itemView}>
                  <NavButton active={itemView === "home"} onClick={() => go(itemView)}>{label}</NavButton>
                </React.Fragment>
              ))}
            </nav>

            <div className="ml-auto flex flex-none items-center gap-3 lg:ml-3">
              <a
                href={themePhoneHref}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/15 bg-white/10 transition hover:bg-white/15"
                aria-label="Gọi hotline"
              >
                <Phone className="h-4 w-4" style={{ color: primaryColor }} />
              </a>
              <button
                onClick={() => go("order")}
                className="hidden rounded-lg px-4 py-2 text-xs font-bold tracking-wide text-white shadow-[0_4px_14px_rgba(242,92,43,.32)] transition hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(242,92,43,.5)] sm:inline-flex"
                style={{ background: `linear-gradient(180deg, ${theme.accentColor}, ${theme.primaryColor})` }}
              >
                {theme.ctaPrimary}
              </button>
              <button
                onClick={() => setMobileOpen((open) => !open)}
                className="rounded-lg border border-white/15 bg-white/10 p-2 transition hover:bg-white/15 lg:hidden"
                aria-label="Mở menu"
              >
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
          {mobileOpen && (
            <div className="border-t border-white/10 bg-[#071329] px-4 py-3 lg:hidden">
              <div className="grid gap-2">
                {landingNavItems.map(([label, itemView]) => (
                  <button
                    key={itemView}
                    onClick={() => go(itemView)}
                    className={`rounded-lg px-3 py-2 text-left text-sm font-semibold ${itemView === "home" ? "bg-[#f25c2b]/20 text-white" : "text-[#d0daea] hover:bg-white/10"}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </header>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 top-[78px] bg-[radial-gradient(circle_at_60%_30%,rgba(242,92,43,.12),transparent_45%)]" />

        <div className="relative mx-auto flex max-w-[1480px] flex-col gap-8 px-4 pt-12 sm:px-6 lg:flex-row lg:items-start lg:gap-10 lg:px-[10%] lg:pt-14">
          <div className="relative z-10 flex-1 pt-2 lg:max-w-[620px]">
            <h1 className="m-0 text-[34px] font-extrabold leading-[1.16] tracking-tight sm:text-[42px]">
              {theme.heroTitle}{" "}
              <span style={{ color: primaryColor }}>{theme.heroHighlight}</span>
            </h1>
            <div className="mt-7 grid max-w-xl gap-x-6 gap-y-4 sm:grid-cols-2">
              {heroBenefits.map((benefit) => (
                <div key={benefit} className="flex items-start gap-3 text-[13.5px] leading-5 text-[#dbe4f1]">
                  <span className="flex h-[30px] w-[30px] flex-none items-center justify-center rounded-full bg-[#f25c2b]/20 text-[#f25c2b]">
                    <Check className="h-4 w-4" />
                  </span>
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative z-10 w-full flex-none rounded-2xl bg-white p-6 text-[#14233f] shadow-[0_24px_60px_rgba(0,0,0,.32)] lg:w-[392px]">
            <div className="mb-5 flex items-center gap-3">
              <ClipboardCheck className="h-7 w-7 text-[#f25c2b]" />
              <h3 className="m-0 text-[22px] font-extrabold text-[#0c2349]">Tạo đơn nhanh</h3>
              <span className="ml-auto whitespace-nowrap rounded-full bg-[#fff1ea] px-3 py-1 text-[11.5px] font-bold text-[#f25c2b]">
                Chỉ 30 giây
              </span>
            </div>
            <p className="mb-5 text-[13px] leading-5 text-[#6c7889]">
              {theme.heroSubtitle}
            </p>

            <div className="grid gap-3">
              <ThemeInput icon={Phone} type="tel" placeholder="Số điện thoại của bạn" />
              <ThemeInput icon={Target} placeholder="Lấy hàng tại (khu vực / địa chỉ)" tone="green" />
              <ThemeInput icon={MapPin} placeholder="Giao đến (khu vực / địa chỉ)" />
              <label className="relative block">
                <Package className="pointer-events-none absolute left-3.5 top-4 h-[18px] w-[18px] text-[#f25c2b]" />
                <select
                  value={selectedType}
                  onChange={(event) => setSelectedType(event.target.value)}
                  className="h-[50px] w-full appearance-none rounded-[11px] border-[1.5px] border-[#e2e7ee] bg-[#fbfcfd] px-11 text-[14.5px] text-[#14233f] outline-none transition focus:border-[#f25c2b]"
                >
                  <option value="">Chọn loại hàng hóa để xem giá</option>
                  {goodsTypes.map((item) => (
                    <option key={item.name} value={item.name}>{item.name}</option>
                  ))}
                </select>
                <span className="pointer-events-none absolute right-4 top-5 text-xs text-slate-400">⌄</span>
              </label>
            </div>

            <div className="my-4 flex items-center justify-between gap-3 rounded-[11px] border border-dashed border-[#f6b89e] bg-[#fff4ee] px-3.5 py-3">
              <div className="flex items-center gap-2 text-[13px] font-semibold text-[#0c2349]">
                <FileText className="h-4 w-4 text-[#f25c2b]" />
                Giá tham khảo
              </div>
              <strong className="whitespace-nowrap text-base font-extrabold text-[#f25c2b]">{selectedPrice}</strong>
            </div>
            <p className="-mt-2 mb-4 text-[11px] leading-4 text-[#9aa6b6]">
              Giá chỉ mang tính tham khảo, nhân viên sẽ báo giá chính xác khi liên hệ.
            </p>
            <button
              onClick={() => go("order")}
              className="flex h-[52px] w-full items-center justify-center gap-2 rounded-[11px] text-base font-extrabold tracking-wide text-white shadow-[0_10px_22px_rgba(242,92,43,.32)]"
              style={{ background: `linear-gradient(180deg, ${theme.accentColor}, ${theme.primaryColor})` }}
            >
              {theme.ctaPrimary}
              <ArrowRight className="h-5 w-5" />
            </button>
            <div className="mt-3 flex items-center justify-center gap-2 text-xs text-[#8794a5]">
              <ShieldCheck className="h-4 w-4 text-[#f25c2b]" />
              Bảo mật thông tin, nhân viên gọi lại trong 5 phút
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-[1480px] px-4 sm:px-6 lg:px-[10%]">
          <div className="relative z-20 -mt-16 grid gap-5 md:grid-cols-2 xl:grid-cols-5">
            {featureCards.map(({ icon, title, desc }) => (
              <React.Fragment key={title}>
                <FeatureCard icon={icon} title={title} desc={desc} />
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-14">
        <div className="mx-auto max-w-[1480px] px-4 sm:px-6 lg:px-[10%]">
          <SectionHeading title="TUYẾN CHUYỂN PHÁT 2 CHIỀU" desc="Hà Nội và các tỉnh lân cận, giao nhận 2 chiều trong ngày" />
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {routeCards.map(([abbr, province]) => (
              <button
                key={province}
                onClick={() => go("routes")}
                className="flex items-center gap-3 rounded-xl border border-[#eaeef4] bg-white p-3.5 text-left shadow-[0_6px_18px_rgba(12,35,73,.05)] transition hover:-translate-y-0.5 hover:border-[#f25c2b]/40"
              >
                <span className="flex h-[58px] w-[58px] flex-none items-center justify-center rounded-[10px] bg-gradient-to-br from-[#2b5da8] to-[#0c2349] text-base font-extrabold text-white">
                  {abbr}
                </span>
                <span>
                  <span className="block text-[14.5px] font-bold text-[#0c2349]">Hà Nội <span className="text-[#f25c2b]">⇄</span> {province}</span>
                  <span className="mt-1 block text-xs leading-5 text-[#7c8696]">Giao nhận 2 chiều<br />trong ngày</span>
                </span>
              </button>
            ))}
          </div>

          <div className="mt-7 flex flex-wrap items-center justify-center gap-5 rounded-[14px] border border-[#e7ecf3] bg-[#f4f7fb] px-6 py-4">
            <div className="flex items-center gap-3 text-[15px] text-[#0c2349]">
              <Target className="h-6 w-6 flex-none text-[#f25c2b]" />
              <span><strong>Chưa có tuyến bạn cần?</strong> Liên hệ ngay, chúng tôi sẽ sắp xếp xe phù hợp nhất.</span>
            </div>
            <a
              href={themePhoneHref}
              className="flex items-center gap-2 rounded-full px-6 py-3 text-[17px] font-extrabold text-white shadow-[0_8px_20px_rgba(242,92,43,.3)]"
              style={{ background: `linear-gradient(180deg, ${theme.accentColor}, ${theme.primaryColor})` }}
            >
              <Phone className="h-5 w-5" />
              {theme.hotline}
            </a>
          </div>
        </div>
      </section>

      <section className="bg-white pb-14">
        <div className="mx-auto max-w-[1480px] px-4 sm:px-6 lg:px-[10%]">
          <SectionHeading title="VÌ SAO CHỌN CHUYỂN PHÁT 24H?" />
          <div className="mt-8 grid gap-4 md:grid-cols-3 xl:grid-cols-6">
            {whyCards.map(([title, desc]) => (
              <div key={title} className="rounded-xl border border-[#eaeef4] bg-white p-5 text-center shadow-[0_8px_22px_rgba(12,35,73,.05)]">
                <Check className="mx-auto h-7 w-7 rounded-full bg-[#fff1ea] p-1.5 text-[#f25c2b]" />
                <h3 className="mt-4 text-[14px] font-extrabold text-[#0c2349]">{title}</h3>
                <p className="mt-2 text-[12.5px] leading-5 text-[#6c7889]">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#f6f8fb] py-14">
        <div className="mx-auto max-w-[1480px] px-4 sm:px-6 lg:px-[10%]">
          <SectionHeading title="THÔNG TIN TÀI XẾ & PHƯƠNG TIỆN SAU KHI XÁC NHẬN ĐƠN HÀNG" />
          <div className="mt-8 grid items-center gap-8 lg:grid-cols-[.85fr_1.15fr]">
            <div>
              <p className="text-[15px] leading-7 text-[#4a5868]">
                Sau khi đơn hàng được xác nhận, bạn sẽ nhận được thông tin tài xế và phương tiện thay cho việc tra cứu đơn thủ công.
              </p>
              <div className="mt-5 grid gap-4">
                {["Họ tên tài xế", "Số điện thoại tài xế", "Loại xe và biển số xe"].map((item) => (
                  <div key={item} className="flex items-center gap-3 text-[15px] font-semibold text-[#0c2349]">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#f25c2b] text-white">
                      <Check className="h-3.5 w-3.5" />
                    </span>
                    {item}
                  </div>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-5 rounded-[18px] bg-gradient-to-br from-[#103063] to-[#0c2349] p-6 text-[#dbe4f1] shadow-[0_18px_44px_rgba(12,35,73,.22)] md:flex-row md:items-center">
              <div className="flex h-28 w-28 flex-none items-center justify-center rounded-full border-2 border-white/20 bg-white/10">
                <UserRound className="h-12 w-12 text-white/70" />
              </div>
              <div className="grid flex-1 gap-3 text-sm">
                <DriverInfo icon={UserRound} label="Họ tên tài xế" value="Nguyễn Văn An" />
                <DriverInfo icon={Phone} label="Số điện thoại" value="0345 123 456" />
                <DriverInfo icon={Truck} label="Loại xe" value="Ford Transit" />
                <DriverInfo icon={ClipboardCheck} label="Biển số xe" value="29B-123.45" />
              </div>
              <div className="flex h-24 w-full flex-none items-center justify-center rounded-[10px] border border-dashed border-white/20 bg-white/10 text-xs text-white/50 md:w-[150px]">
                ảnh xe
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-14">
        <div className="mx-auto max-w-[1480px] px-4 sm:px-6 lg:px-[10%]">
          <SectionHeading title="NHẬN GỬI ĐA DẠNG HÀNG HÓA" />
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {goodsTypes.map(({ icon: Icon, name }) => (
              <div key={name} className="overflow-hidden rounded-xl border border-[#eaeef4] bg-white shadow-[0_8px_22px_rgba(12,35,73,.05)]">
                <div className="flex h-[104px] items-center justify-center bg-[#eef3fb] text-[#f25c2b]">
                  <Icon className="h-11 w-11 stroke-[1.6]" />
                </div>
                <div className="px-2 py-3 text-center text-[13px] font-bold leading-5 text-[#0c2349]">{name}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white pb-14">
        <div className="mx-auto max-w-[1480px] px-4 sm:px-6 lg:px-[10%]">
          <div className="flex flex-wrap items-center gap-8 rounded-[18px] bg-[radial-gradient(circle_at_80%_30%,rgba(242,92,43,.25),transparent_50%),linear-gradient(120deg,#0e2a55,#0c2349)] p-8 text-white">
            <div className="flex h-28 w-44 flex-none items-center justify-center rounded-xl border border-dashed border-white/20 bg-white/10 text-xs text-white/50">
              ảnh xe tải
            </div>
            <div className="min-w-[280px] flex-1">
              <h3 className="text-2xl font-extrabold">GỬI HÀNG GẤP? <span className="text-[#f25c2b]">GỌI NGAY CHO CHÚNG TÔI!</span></h3>
              <div className="mt-4 flex flex-wrap gap-5 text-[13.5px] text-[#dbe4f1]">
                {["Nhận hàng tận nơi trong ngày", "Điều phối xe gần nhất để chuyển đi ngay", "Giao tận tay người nhận"].map((item) => (
                  <span key={item} className="flex items-center gap-2">
                    <Check className="h-5 w-5 rounded-full bg-[#f25c2b] p-1 text-white" />
                    {item}
                  </span>
                ))}
              </div>
            </div>
            <a
              href={themePhoneHref}
              className="flex items-center gap-3 rounded-full px-7 py-4 text-[22px] font-extrabold text-white shadow-[0_10px_26px_rgba(242,92,43,.38)]"
              style={{ background: `linear-gradient(180deg, ${theme.accentColor}, ${theme.primaryColor})` }}
            >
              <Phone className="h-6 w-6" />
              {theme.hotline}
            </a>
          </div>
        </div>
      </section>

      <ThemeFooter go={go} theme={theme} />
    </div>
  );
}

function NavButton({ active, children, onClick }: { active?: boolean; children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-md px-2.5 py-1.5 transition ${active ? "bg-[#f25c2b]/20 font-bold text-white" : "text-[#d0daea] hover:bg-white/10 hover:text-white"}`}
    >
      {children}
    </button>
  );
}

function LogoMark({ theme }: { theme: SiteThemeSettings }) {
  return (
    <span className="flex h-[38px] w-[38px] flex-none items-center justify-center rounded-[10px] shadow-[0_3px_10px_rgba(242,92,43,.3)]" style={{ background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.accentColor})` }}>
      <Truck className="h-6 w-6 text-white" />
    </span>
  );
}

function ThemeInput({ icon: Icon, tone = "orange", ...props }: React.InputHTMLAttributes<HTMLInputElement> & { icon: React.ElementType; tone?: "orange" | "green" }) {
  return (
    <label className="relative block">
      <Icon className={`pointer-events-none absolute left-3.5 top-4 h-[18px] w-[18px] ${tone === "green" ? "text-[#22a06b]" : "text-[#f25c2b]"}`} />
      <input
        {...props}
        className="h-[50px] w-full rounded-[11px] border-[1.5px] border-[#e2e7ee] bg-[#fbfcfd] px-11 text-[14.5px] text-[#14233f] outline-none transition placeholder:text-[#9aa6b6] focus:border-[#f25c2b]"
      />
    </label>
  );
}

function FeatureCard({ icon: Icon, title, desc }: { icon: React.ElementType; title: string; desc: string }) {
  return (
    <div className="rounded-2xl border border-[#eef1f6] bg-white px-5 py-7 text-center shadow-[0_14px_36px_rgba(12,35,73,.08)]">
      <div className="mx-auto mb-5 flex h-[60px] items-center justify-center">
        <Icon className="h-12 w-12 text-[#0c2349]" />
      </div>
      <h3 className="text-[15px] font-bold leading-5 text-[#0c2349]">{title}</h3>
      <p className="mt-2 text-[13px] leading-5 text-[#6c7889]">{desc}</p>
    </div>
  );
}

function SectionHeading({ title, desc }: { title: string; desc?: string }) {
  return (
    <div className="text-center">
      <h2 className="m-0 text-[27px] font-extrabold tracking-wide text-[#0c2349] sm:text-[30px]">{title}</h2>
      {desc && <p className="mt-2 text-[15px] text-[#6c7889]">{desc}</p>}
    </div>
  );
}

function DriverInfo({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <Icon className="h-4 w-4 flex-none text-[#f25c2b]" />
      <span>{label}: <strong className="font-bold text-white">{value}</strong></span>
    </div>
  );
}

function ThemeFooter({ go, theme }: { go: (view: View) => void; theme: SiteThemeSettings }) {
  const footerPhoneHref = `tel:${theme.hotline.replace(/\D/g, "")}`;
  return (
    <footer className="pt-12 text-[#aebbcd]" style={{ backgroundColor: theme.secondaryColor }}>
      <div className="mx-auto grid max-w-[1480px] gap-8 px-4 sm:px-6 md:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1.2fr_1fr] lg:px-[10%]">
        <div>
          <div className="mb-4 flex items-center gap-3">
            <LogoMark theme={theme} />
            <div className="flex flex-col leading-none">
              <span className="text-[17px] font-extrabold tracking-wide text-white">{theme.brandName}</span>
              <span className="text-[13px] font-semibold tracking-wide" style={{ color: theme.primaryColor }}>{theme.tagline}</span>
            </div>
          </div>
          <p className="max-w-[280px] text-[13.5px] leading-6">
            {theme.footerDescription}
          </p>
        </div>
        <FooterColumn title="DỊCH VỤ" items={[["Tạo đơn hàng", "order"], ["Tuyến chuyển phát", "routes"], ["Bảng giá", "pricing"], ["Tra cứu đơn", "tracking"]]} go={go} />
        <FooterColumn title="HỖ TRỢ" items={[["Chính sách dịch vụ", "policy"], ["Liên hệ hỗ trợ", "contact"]]} go={go} />
        <div>
          <h4 className="mb-4 mt-1 text-[13px] font-bold tracking-wide text-white">LIÊN HỆ</h4>
          <div className="grid gap-3 text-[13.5px]">
            <a href={footerPhoneHref} className="flex items-center gap-2 text-white">
              <Phone className="h-4 w-4" style={{ color: theme.primaryColor }} />
              {theme.hotline}
            </a>
            <span className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-[#f25c2b]" />
              Hà Nội và các tỉnh phía Bắc
            </span>
          </div>
        </div>
        <div>
          <h4 className="mb-4 mt-1 text-[13px] font-bold tracking-wide text-white">KẾT NỐI</h4>
          <div className="flex gap-2.5">
            {["FB", "Zalo", "TikTok", "YT"].map((item) => (
              <span key={item} className="flex h-[38px] min-w-[38px] items-center justify-center rounded-full bg-white/10 px-2 text-[11px] font-extrabold text-white">
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-11 border-t border-white/10 py-5 text-center text-[12.5px] text-[#7b8aa0]">
        © 2026 Chuyển Phát 24H. Tất cả quyền được bảo lưu.
      </div>
    </footer>
  );
}

function FooterColumn({ title, items, go }: { title: string; items: Array<[string, View]>; go: (view: View) => void }) {
  return (
    <div>
      <h4 className="mb-4 mt-1 text-[13px] font-bold tracking-wide text-white">{title}</h4>
      <div className="flex flex-col gap-3 text-[13.5px]">
        {items.map(([label, view]) => (
          <button key={label} onClick={() => go(view)} className="text-left text-[#aebbcd] transition hover:text-white">
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
