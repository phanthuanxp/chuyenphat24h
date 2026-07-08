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

const goodsIcons = [FileText, Package, Flower2, Coffee, Truck, Flower2];
const featureIcons = [Truck, Target, ClipboardCheck, ShieldCheck, Headphones];

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
  const secondaryColor = theme.secondaryColor;
  const accentColor = theme.accentColor;
  const ctaGradient = `linear-gradient(180deg, #ff1b24, ${primaryColor})`;
  const blueGradient = `linear-gradient(135deg, ${accentColor}, ${secondaryColor})`;
  const selectedPrice = useMemo(
    () => theme.goodsTypes.find((item) => item.name === selectedType)?.price || "Chọn loại hàng để xem giá",
    [selectedType, theme.goodsTypes],
  );

  const go = (view: View) => {
    setMobileOpen(false);
    setView(view);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="bg-[#f6fbff] text-[#062b57]" style={{ fontFamily: "'Be Vietnam Pro', system-ui, sans-serif" }}>
      <section
        className="relative min-h-[660px] overflow-hidden pb-24 text-[#062b57]"
        style={{
          backgroundImage:
            `linear-gradient(100deg, rgba(247,251,255,.98) 0%, rgba(247,251,255,.90) 31%, rgba(255,255,255,.46) 56%, rgba(226,242,255,.30) 74%, rgba(247,251,255,.92) 100%), url('${theme.heroImageUrl}')`,
          backgroundPosition: "center 42%",
          backgroundSize: "cover",
        }}
      >
        <header className="relative z-30 border-b border-[#dceaf7] bg-white/75 backdrop-blur">
          <div className="mx-auto flex h-[78px] max-w-[1480px] items-center px-4 sm:px-6 lg:px-[10%]">
            <button onClick={() => go("home")} className="mr-7 flex flex-none items-center gap-2 text-left">
              <LogoMark theme={theme} />
              <span className="text-base font-extrabold tracking-wide" style={{ color: secondaryColor }}>
                {theme.brandShortName}
              </span>
            </button>

            <nav className="hidden min-w-0 flex-1 items-center gap-1 text-[13px] font-medium lg:flex">
              {landingNavItems.map(([label, itemView]) => (
                <React.Fragment key={itemView}>
                  <NavButton active={itemView === "home"} theme={theme} onClick={() => go(itemView)}>{label}</NavButton>
                </React.Fragment>
              ))}
            </nav>

            <div className="ml-auto flex flex-none items-center gap-3 lg:ml-3">
              <a
                href={themePhoneHref}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#d9e7f4] bg-white/80 transition hover:bg-white"
                aria-label="Gọi hotline"
              >
                <Phone className="h-4 w-4" style={{ color: primaryColor }} />
              </a>
              <button
                onClick={() => go("order")}
                className="hidden rounded-lg px-4 py-2 text-xs font-bold tracking-wide text-white shadow-[0_8px_20px_rgba(227,6,19,.24)] transition hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(227,6,19,.32)] sm:inline-flex"
                style={{ background: ctaGradient }}
              >
                {theme.ctaPrimary}
              </button>
              <button
                onClick={() => setMobileOpen((open) => !open)}
                className="rounded-lg border border-[#d9e7f4] bg-white/80 p-2 transition hover:bg-white lg:hidden"
                aria-label="Mở menu"
              >
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
          {mobileOpen && (
            <div className="border-t border-[#dceaf7] bg-white px-4 py-3 lg:hidden">
              <div className="grid gap-2">
                {landingNavItems.map(([label, itemView]) => (
                  <button
                    key={itemView}
                    onClick={() => go(itemView)}
                  className="rounded-lg px-3 py-2 text-left text-sm font-semibold transition"
                  style={itemView === "home" ? { backgroundColor: `${primaryColor}12`, color: primaryColor } : { color: secondaryColor }}
                >
                  {label}
                </button>
                ))}
              </div>
            </div>
          )}
        </header>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 top-[78px] bg-[radial-gradient(circle_at_58%_32%,rgba(227,6,19,.10),transparent_42%)]" />

        <div className="relative mx-auto flex max-w-[1480px] flex-col gap-8 px-4 pt-12 sm:px-6 lg:flex-row lg:items-start lg:gap-10 lg:px-[10%] lg:pt-14">
          <div className="relative z-10 flex-1 pt-2 lg:max-w-[620px]">
            <p className="mb-4 text-xs font-extrabold uppercase tracking-wide" style={{ color: primaryColor }}>{theme.tagline}</p>
            <h1 className="m-0 text-[38px] font-extrabold leading-[1.14] tracking-tight sm:text-[52px]" style={{ color: secondaryColor }}>
              {theme.heroTitle}{" "}
              <span style={{ color: secondaryColor }}>{theme.heroHighlight}</span>
            </h1>
            <div className="mt-7 grid max-w-xl gap-x-6 gap-y-4 sm:grid-cols-2">
              {theme.heroBenefits.map((benefit) => (
                <div key={benefit} className="flex items-start gap-3 text-[13.5px] font-semibold leading-5" style={{ color: secondaryColor }}>
                  <span className="flex h-[30px] w-[30px] flex-none items-center justify-center rounded-full" style={{ backgroundColor: `${accentColor}14`, color: accentColor }}>
                    <Check className="h-4 w-4" />
                  </span>
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative z-10 w-full flex-none rounded-2xl border border-[#dceaf7] bg-white p-6 text-[#14233f] shadow-[0_22px_50px_rgba(0,59,115,.14)] lg:w-[392px]">
            <div className="mb-5 flex items-center gap-3">
              <ClipboardCheck className="h-7 w-7" style={{ color: accentColor }} />
              <h3 className="m-0 text-[22px] font-extrabold text-[#0c2349]">Tạo đơn nhanh</h3>
              <span className="ml-auto whitespace-nowrap rounded-full px-3 py-1 text-[11.5px] font-bold" style={{ backgroundColor: `${primaryColor}18`, color: primaryColor }}>
                Chỉ 30 giây
              </span>
            </div>
            <p className="mb-5 text-[13px] leading-5 text-[#6c7889]">
              {theme.heroSubtitle}
            </p>

            <div className="grid gap-3">
              <ThemeInput icon={Phone} type="tel" placeholder="Số điện thoại của bạn" color={primaryColor} />
              <ThemeInput icon={Target} placeholder="Lấy hàng tại (khu vực / địa chỉ)" color={accentColor} />
              <ThemeInput icon={MapPin} placeholder="Giao đến (khu vực / địa chỉ)" color={primaryColor} />
              <label className="relative block">
                <Package className="pointer-events-none absolute left-3.5 top-4 h-[18px] w-[18px]" style={{ color: accentColor }} />
                <select
                  value={selectedType}
                  onChange={(event) => setSelectedType(event.target.value)}
                  className="h-[50px] w-full appearance-none rounded-[11px] border-[1.5px] border-[#d9e7f4] bg-[#fbfcfd] px-11 text-[14.5px] text-[#14233f] outline-none transition"
                >
                  <option value="">Chọn loại hàng hóa để xem giá</option>
                  {theme.goodsTypes.map((item) => (
                    <option key={item.name} value={item.name}>{item.name}</option>
                  ))}
                </select>
                <span className="pointer-events-none absolute right-4 top-5 text-xs text-slate-400">⌄</span>
              </label>
            </div>

            <div className="my-4 flex items-center justify-between gap-3 rounded-[11px] border border-dashed px-3.5 py-3" style={{ borderColor: `${primaryColor}55`, backgroundColor: `${primaryColor}08` }}>
              <div className="flex items-center gap-2 text-[13px] font-semibold text-[#0c2349]">
                <FileText className="h-4 w-4" style={{ color: accentColor }} />
                Giá tham khảo
              </div>
              <strong className="whitespace-nowrap text-base font-extrabold" style={{ color: primaryColor }}>{selectedPrice}</strong>
            </div>
            <p className="-mt-2 mb-4 text-[11px] leading-4 text-[#9aa6b6]">
              Giá chỉ mang tính tham khảo, nhân viên sẽ báo giá chính xác khi liên hệ.
            </p>
            <button
              onClick={() => go("order")}
              className="flex h-[52px] w-full items-center justify-center gap-2 rounded-[11px] text-base font-extrabold tracking-wide text-white shadow-[0_10px_22px_rgba(227,6,19,.26)]"
              style={{ background: ctaGradient }}
            >
              {theme.ctaPrimary}
              <ArrowRight className="h-5 w-5" />
            </button>
            <div className="mt-3 flex items-center justify-center gap-2 text-xs text-[#8794a5]">
              <ShieldCheck className="h-4 w-4" style={{ color: accentColor }} />
              Bảo mật thông tin, nhân viên gọi lại trong 5 phút
            </div>
          </div>
        </div>
      </section>

      {theme.sectionVisibility.features && (
        <section className="bg-[#f6fbff]">
          <div className="mx-auto max-w-[1480px] px-4 sm:px-6 lg:px-[10%]">
            <div className="relative z-20 -mt-16 grid gap-5 md:grid-cols-2 xl:grid-cols-5">
              {theme.featureCards.map(({ title, desc }, index) => (
                <React.Fragment key={title}>
                  <FeatureCard icon={featureIcons[index % featureIcons.length]} title={title} desc={desc} theme={theme} />
                </React.Fragment>
              ))}
            </div>
          </div>
        </section>
      )}

      {theme.sectionVisibility.routes && <section className="bg-[#f6fbff] py-14">
        <div className="mx-auto max-w-[1480px] px-4 sm:px-6 lg:px-[10%]">
          <SectionHeading title={theme.routeSectionTitle} desc={theme.routeSectionDesc} theme={theme} />
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {theme.routeCards.map(({ abbr, province }) => (
              <button
                key={province}
                onClick={() => go("routes")}
                className="flex items-center gap-3 rounded-xl border border-[#dceaf7] bg-white p-3.5 text-left shadow-[0_8px_20px_rgba(0,59,115,.06)] transition hover:-translate-y-0.5 hover:border-[#b8d5ee]"
              >
                <span className="flex h-[58px] w-[58px] flex-none items-center justify-center rounded-[10px] text-base font-extrabold text-white" style={{ background: blueGradient }}>
                  {abbr}
                </span>
                <span>
                  <span className="block text-[14.5px] font-bold text-[#0c2349]">Hà Nội <span style={{ color: primaryColor }}>⇄</span> {province}</span>
                  <span className="mt-1 block text-xs leading-5 text-[#7c8696]">Giao nhận 2 chiều<br />trong ngày</span>
                </span>
              </button>
            ))}
          </div>

          <div className="mt-7 flex flex-wrap items-center justify-center gap-5 rounded-[14px] border border-[#dceaf7] bg-white px-6 py-4 shadow-[0_8px_20px_rgba(0,59,115,.05)]">
            <div className="flex items-center gap-3 text-[15px] text-[#0c2349]">
              <Target className="h-6 w-6 flex-none" style={{ color: primaryColor }} />
              <span className="font-semibold">{theme.routeCtaText}</span>
            </div>
            <a
              href={themePhoneHref}
              className="flex items-center gap-2 rounded-full px-6 py-3 text-[17px] font-extrabold text-white shadow-[0_8px_20px_rgba(227,6,19,.26)]"
              style={{ background: ctaGradient }}
            >
              <Phone className="h-5 w-5" />
              {theme.hotline}
            </a>
          </div>
        </div>
      </section>}

      {theme.sectionVisibility.why && <section className="bg-[#f6fbff] pb-14">
        <div className="mx-auto max-w-[1480px] px-4 sm:px-6 lg:px-[10%]">
          <SectionHeading title={theme.whySectionTitle} theme={theme} />
          <div className="mt-8 grid gap-4 md:grid-cols-3 xl:grid-cols-6">
            {theme.whyCards.map(({ title, desc }) => (
              <div key={title} className="rounded-xl border border-[#dceaf7] bg-white p-5 text-center shadow-[0_8px_22px_rgba(0,59,115,.05)]">
                <Check className="mx-auto h-7 w-7 rounded-full p-1.5" style={{ backgroundColor: `${accentColor}14`, color: accentColor }} />
                <h3 className="mt-4 text-[14px] font-extrabold text-[#0c2349]">{title}</h3>
                <p className="mt-2 text-[12.5px] leading-5 text-[#6c7889]">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>}

      {theme.sectionVisibility.driver && <section className="bg-white py-14">
        <div className="mx-auto max-w-[1480px] px-4 sm:px-6 lg:px-[10%]">
          <SectionHeading title={theme.driverSectionTitle} theme={theme} />
          <div className="mt-8 grid items-center gap-8 lg:grid-cols-[.85fr_1.15fr]">
            <div>
              <p className="text-[15px] leading-7 text-[#4a5868]">
                {theme.driverSectionDesc}
              </p>
              <div className="mt-5 grid gap-4">
                {["Họ tên tài xế", "Số điện thoại tài xế", "Loại xe và biển số xe"].map((item) => (
                  <div key={item} className="flex items-center gap-3 text-[15px] font-semibold text-[#0c2349]">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full text-white" style={{ backgroundColor: accentColor }}>
                      <Check className="h-3.5 w-3.5" />
                    </span>
                    {item}
                  </div>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-5 rounded-[18px] p-6 text-[#dbe4f1] shadow-[0_18px_44px_rgba(0,59,115,.20)] md:flex-row md:items-center" style={{ background: blueGradient }}>
              <div className="flex h-28 w-28 flex-none items-center justify-center rounded-full border-2 border-white/20 bg-white/10">
                <UserRound className="h-12 w-12 text-white/70" />
              </div>
              <div className="grid flex-1 gap-3 text-sm">
                <DriverInfo icon={UserRound} label="Họ tên tài xế" value="Nguyễn Văn An" theme={theme} />
                <DriverInfo icon={Phone} label="Số điện thoại" value="0345 123 456" theme={theme} />
                <DriverInfo icon={Truck} label="Loại xe" value="Ford Transit" theme={theme} />
                <DriverInfo icon={ClipboardCheck} label="Biển số xe" value="29B-123.45" theme={theme} />
              </div>
              <div className="flex h-24 w-full flex-none items-center justify-center rounded-[10px] border border-dashed border-white/20 bg-white/10 text-xs text-white/50 md:w-[150px]">
                ảnh xe
              </div>
            </div>
          </div>
        </div>
      </section>}

      {theme.sectionVisibility.goods && <section className="bg-[#f6fbff] py-14">
        <div className="mx-auto max-w-[1480px] px-4 sm:px-6 lg:px-[10%]">
          <SectionHeading title={theme.goodsSectionTitle} theme={theme} />
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {theme.goodsTypes.map(({ name }, index) => {
              const Icon = goodsIcons[index % goodsIcons.length];
              return (
              <div key={name} className="overflow-hidden rounded-xl border border-[#dceaf7] bg-white shadow-[0_8px_22px_rgba(0,59,115,.05)]">
                <div className="flex h-[104px] items-center justify-center bg-[#eef6ff]" style={{ color: accentColor }}>
                  <Icon className="h-11 w-11 stroke-[1.6]" />
                </div>
                <div className="px-2 py-3 text-center text-[13px] font-bold leading-5 text-[#0c2349]">{name}</div>
              </div>
            )})}
          </div>
        </div>
      </section>}

      {theme.sectionVisibility.finalCta && <section className="bg-[#f6fbff] pb-14">
        <div className="mx-auto max-w-[1480px] px-4 sm:px-6 lg:px-[10%]">
          <div className="flex flex-wrap items-center gap-8 rounded-[18px] p-8 text-white shadow-[0_18px_42px_rgba(0,59,115,.18)]" style={{ background: `radial-gradient(circle at 80% 30%, ${accentColor}44, transparent 50%), linear-gradient(120deg, ${secondaryColor}, #005b9f)` }}>
            <div className="flex h-28 w-44 flex-none items-center justify-center rounded-xl border border-dashed border-white/20 bg-white/10 text-xs text-white/50">
              {theme.finalCtaImageLabel}
            </div>
            <div className="min-w-[280px] flex-1">
              <h3 className="text-2xl font-extrabold">{theme.finalCtaTitle} <span className="text-white">{theme.finalCtaHighlight}</span></h3>
              <div className="mt-4 flex flex-wrap gap-5 text-[13.5px] text-[#dbe4f1]">
                {theme.finalCtaBenefits.map((item) => (
                  <span key={item} className="flex items-center gap-2">
                    <Check className="h-5 w-5 rounded-full p-1 text-white" style={{ backgroundColor: primaryColor }} />
                    {item}
                  </span>
                ))}
              </div>
            </div>
            <a
              href={themePhoneHref}
              className="flex items-center gap-3 rounded-full px-7 py-4 text-[22px] font-extrabold text-white shadow-[0_10px_26px_rgba(227,6,19,.30)]"
              style={{ background: ctaGradient }}
            >
              <Phone className="h-6 w-6" />
              {theme.hotline}
            </a>
          </div>
        </div>
      </section>}

      <ThemeFooter go={go} theme={theme} />
    </div>
  );
}

function NavButton({ active, children, onClick, theme }: { active?: boolean; children: React.ReactNode; onClick: () => void; theme: SiteThemeSettings }) {
  return (
    <button
      onClick={onClick}
      className="rounded-md border-b-2 px-2.5 py-1.5 font-semibold transition"
      style={active ? { borderColor: theme.primaryColor, color: theme.secondaryColor } : { borderColor: "transparent", color: "#22344d" }}
    >
      {children}
    </button>
  );
}

function LogoMark({ theme }: { theme: SiteThemeSettings }) {
  return (
    <span className="flex h-[38px] w-[38px] flex-none items-center justify-center rounded-[10px] shadow-[0_6px_16px_rgba(0,87,184,.18)]" style={{ background: `linear-gradient(135deg, ${theme.accentColor}, ${theme.secondaryColor})` }}>
      <Truck className="h-6 w-6 text-white" />
    </span>
  );
}

function ThemeInput({ icon: Icon, color, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { icon: React.ElementType; color: string }) {
  return (
    <label className="relative block">
      <Icon className="pointer-events-none absolute left-3.5 top-4 h-[18px] w-[18px]" style={{ color }} />
      <input
        {...props}
        className="h-[50px] w-full rounded-[11px] border-[1.5px] border-[#e2e7ee] bg-[#fbfcfd] px-11 text-[14.5px] text-[#14233f] outline-none transition placeholder:text-[#9aa6b6]"
      />
    </label>
  );
}

function FeatureCard({ icon: Icon, title, desc, theme }: { icon: React.ElementType; title: string; desc: string; theme: SiteThemeSettings }) {
  return (
    <div className="rounded-2xl border border-[#dceaf7] bg-white px-5 py-7 text-center shadow-[0_14px_36px_rgba(0,59,115,.08)]">
      <div className="mx-auto mb-5 flex h-[60px] items-center justify-center">
        <Icon className="h-12 w-12" style={{ color: theme.accentColor }} />
      </div>
      <h3 className="text-[15px] font-bold leading-5 text-[#0c2349]">{title}</h3>
      <p className="mt-2 text-[13px] leading-5 text-[#6c7889]">{desc}</p>
    </div>
  );
}

function SectionHeading({ title, desc, theme }: { title: string; desc?: string; theme: SiteThemeSettings }) {
  return (
    <div className="text-center">
      <h2 className="m-0 text-[27px] font-extrabold tracking-wide sm:text-[30px]" style={{ color: theme.secondaryColor }}>{title}</h2>
      {desc && <p className="mt-2 text-[15px] text-[#6c7889]">{desc}</p>}
    </div>
  );
}

function DriverInfo({ icon: Icon, label, value, theme }: { icon: React.ElementType; label: string; value: string; theme: SiteThemeSettings }) {
  return (
    <div className="flex items-center gap-2.5">
      <Icon className="h-4 w-4 flex-none" style={{ color: theme.primaryColor }} />
      <span>{label}: <strong className="font-bold text-white">{value}</strong></span>
    </div>
  );
}

function ThemeFooter({ go, theme }: { go: (view: View) => void; theme: SiteThemeSettings }) {
  const footerPhoneHref = `tel:${theme.hotline.replace(/\D/g, "")}`;
  return (
    <footer className="pt-12 text-[#b8cbe0]" style={{ background: `linear-gradient(135deg, ${theme.secondaryColor}, #002d58)` }}>
      <div className="mx-auto grid max-w-[1480px] gap-8 px-4 sm:px-6 md:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1.2fr_1fr] lg:px-[10%]">
        <div>
          <div className="mb-4 flex items-center gap-3">
            <LogoMark theme={theme} />
            <div className="flex flex-col leading-none">
              <span className="text-[17px] font-extrabold tracking-wide text-white">{theme.brandName}</span>
              <span className="text-[13px] font-semibold tracking-wide text-[#dbeafe]">{theme.tagline}</span>
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
              <MapPin className="h-4 w-4" style={{ color: theme.primaryColor }} />
              {theme.footerLocation}
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
        {theme.footerCopyright}
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
