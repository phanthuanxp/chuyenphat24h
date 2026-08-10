import React, { useState } from "react";
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
import type { SiteThemeSettings } from "../lib/theme/themeTypes";
import { publicPathFor, type PublicView } from "../lib/siteNavigation";
import { BrandLogo } from "./BrandLogo";
import { FastQuoteForm } from "./FastQuoteForm";

type View = PublicView;

type ThemeLandingProps = {
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

export function ThemeLanding({ theme }: ThemeLandingProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const themePhoneHref = `tel:${theme.hotline.replace(/\D/g, "")}`;
  const primaryColor = theme.primaryColor;
  const secondaryColor = theme.secondaryColor;
  const accentColor = theme.accentColor;

  return (
    <div className="bg-[var(--background-subtle)] text-[var(--text-primary)]">
      <section
        className="relative min-h-[640px] overflow-hidden pb-20 text-white"
        style={{
          backgroundImage:
            `linear-gradient(135deg, rgba(7,24,46,.98) 0%, rgba(11,31,58,.95) 55%, rgba(23,59,99,.87) 100%), url('${theme.heroImageUrl}')`,
          backgroundPosition: "center",
          backgroundSize: "cover",
        }}
      >
        <header className="relative z-30 border-b border-[var(--border-light)] bg-white/95 text-[var(--brand-navy-900)] shadow-[var(--shadow-sm)] backdrop-blur">
          <div className="mx-auto flex h-[78px] max-w-[1480px] items-center px-4 sm:px-6 lg:px-[10%]">
            <a href={publicPathFor("home")} className="mr-5 flex min-w-0 flex-none items-center text-left" aria-label="Trang chu Chuyen Phat 24H">
              <BrandLogo showTagline />
            </a>

            <nav className="hidden min-w-0 flex-1 items-center gap-1 text-[13px] font-medium lg:flex">
              {landingNavItems.map(([label, itemView]) => (
                <React.Fragment key={itemView}>
                  <NavButton active={itemView === "home"} href={publicPathFor(itemView)}>{label}</NavButton>
                </React.Fragment>
              ))}
            </nav>

            <div className="ml-auto flex flex-none items-center gap-2 lg:ml-3">
              <a
                href={themePhoneHref}
                className="flex h-11 w-11 items-center justify-center rounded-lg border border-[var(--border-light)] bg-white transition hover:border-brand-orange-500"
                aria-label="Gọi hotline"
              >
                <Phone className="h-4 w-4" style={{ color: primaryColor }} />
              </a>
              <a
                href={publicPathFor("order")}
                className="hidden min-h-11 items-center rounded-lg bg-brand-orange-500 px-4 py-2 text-xs font-bold text-brand-navy-900 shadow-[var(--shadow-sm)] transition hover:bg-brand-orange-600 sm:inline-flex"
              >
                {theme.ctaPrimary}
              </a>
              <button
                onClick={() => setMobileOpen((open) => !open)}
                className="min-h-11 min-w-11 rounded-lg border border-[var(--border-light)] bg-white p-2 transition hover:border-brand-orange-500 lg:hidden"
                aria-label="Mở menu"
              >
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
          {mobileOpen && (
            <div className="border-t border-[#DCE3EA] bg-white px-4 py-3 lg:hidden">
              <div className="grid gap-2">
                {landingNavItems.map(([label, itemView]) => (
                  <a
                    key={itemView}
                    href={publicPathFor(itemView)}
                  className="rounded-lg px-3 py-2 text-left text-sm font-semibold transition"
                  style={itemView === "home" ? { backgroundColor: `${primaryColor}12`, color: primaryColor } : { color: secondaryColor }}
                >
                  {label}
                  </a>
                ))}
              </div>
            </div>
          )}
        </header>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 top-[78px] bg-[radial-gradient(circle_at_72%_38%,rgba(56,189,248,.16),transparent_30%)]" />

        <div className="relative mx-auto flex max-w-[1480px] flex-col gap-8 px-4 pt-12 sm:px-6 lg:flex-row lg:items-start lg:gap-10 lg:px-[10%] lg:pt-14">
          <div className="relative z-10 flex-1 pt-2 lg:max-w-[620px]">
            <p className="mb-4 text-xs font-extrabold uppercase tracking-normal text-brand-orange-500">{theme.tagline}</p>
            <h1 className="m-0 text-[38px] font-extrabold leading-[1.12] tracking-normal text-white sm:text-[52px] lg:text-[58px]">
              {theme.heroTitle}{" "}
              <span className="text-brand-orange-500">{theme.heroHighlight}</span>
            </h1>
            <div className="mt-7 grid max-w-xl gap-x-6 gap-y-4 sm:grid-cols-2">
              {theme.heroBenefits.map((benefit) => (
                <div key={benefit} className="flex items-start gap-3 text-sm font-medium leading-6 text-slate-200">
                  <span className="flex h-6 w-6 flex-none items-center justify-center rounded-full border border-route-blue/45 bg-route-blue/10 text-route-blue">
                    <Check className="h-3.5 w-3.5" />
                  </span>
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative z-10 w-full flex-none lg:w-[392px]"><FastQuoteForm /></div>
        </div>
      </section>

      {theme.sectionVisibility.features && (
        <section className="bg-[#F5F7FA]">
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

      {theme.sectionVisibility.routes && <section className="bg-[#F5F7FA] py-14">
        <div className="mx-auto max-w-[1480px] px-4 sm:px-6 lg:px-[10%]">
          <SectionHeading title={theme.routeSectionTitle} desc={theme.routeSectionDesc} theme={theme} />
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {theme.routeCards.map(({ abbr, province }) => (
              <a
                key={province}
                href={publicPathFor("routes")}
                className="flex items-center gap-3 rounded-lg border border-[var(--border-light)] bg-white p-3.5 text-left shadow-[var(--shadow-sm)] transition hover:-translate-y-0.5 hover:border-route-blue"
              >
                <span className="flex h-[58px] w-[58px] flex-none items-center justify-center rounded-lg bg-brand-navy-800 text-base font-extrabold text-white">
                  {abbr}
                </span>
                <span>
                  <span className="block text-[14.5px] font-bold text-[#0B1F3A]">Hà Nội <span style={{ color: primaryColor }}>⇄</span> {province}</span>
                  <span className="mt-1 block text-xs leading-5 text-[#64748B]">Giao nhận 2 chiều<br />trong ngày</span>
                </span>
              </a>
            ))}
          </div>

          <div className="mt-7 flex flex-wrap items-center justify-center gap-5 rounded-lg border border-[var(--border-light)] bg-white px-6 py-4 shadow-[var(--shadow-sm)]">
            <div className="flex items-center gap-3 text-[15px] text-[#0B1F3A]">
              <Target className="h-6 w-6 flex-none" style={{ color: primaryColor }} />
              <span className="font-semibold">{theme.routeCtaText}</span>
            </div>
            <a
              href={themePhoneHref}
              className="flex min-h-11 items-center gap-2 rounded-lg bg-brand-orange-500 px-6 py-3 text-[17px] font-bold text-brand-navy-900 shadow-[var(--shadow-sm)] transition hover:bg-brand-orange-600"
            >
              <Phone className="h-5 w-5" />
              {theme.hotline}
            </a>
          </div>
        </div>
      </section>}

      {theme.sectionVisibility.why && <section className="bg-[#F5F7FA] pb-14">
        <div className="mx-auto max-w-[1480px] px-4 sm:px-6 lg:px-[10%]">
          <SectionHeading title={theme.whySectionTitle} theme={theme} />
          <div className="mt-8 grid gap-4 md:grid-cols-3 xl:grid-cols-6">
            {theme.whyCards.map(({ title, desc }) => (
              <div key={title} className="rounded-lg border border-[var(--border-light)] bg-white p-5 text-center shadow-[var(--shadow-sm)] transition hover:-translate-y-0.5">
                <Check className="mx-auto h-7 w-7 rounded-full p-1.5" style={{ backgroundColor: `${accentColor}14`, color: accentColor }} />
                <h3 className="mt-4 text-[14px] font-extrabold text-[#0B1F3A]">{title}</h3>
                <p className="mt-2 text-[12.5px] leading-5 text-[#475569]">{desc}</p>
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
              <p className="text-[15px] leading-7 text-[#475569]">
                {theme.driverSectionDesc}
              </p>
              <div className="mt-5 grid gap-4">
                {["Họ tên tài xế", "Số điện thoại tài xế", "Loại xe và biển số xe"].map((item) => (
                  <div key={item} className="flex items-center gap-3 text-[15px] font-semibold text-[#0B1F3A]">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full text-white" style={{ backgroundColor: accentColor }}>
                      <Check className="h-3.5 w-3.5" />
                    </span>
                    {item}
                  </div>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-5 rounded-lg bg-brand-navy-800 p-6 text-[#E2E8F0] shadow-[var(--shadow-md)] md:flex-row md:items-center">
              <div className="flex h-28 w-28 flex-none items-center justify-center rounded-full border-2 border-white/20 bg-white/10">
                <UserRound className="h-12 w-12 text-white/70" />
              </div>
              <div className="grid flex-1 gap-3 text-sm">
                <DriverInfo icon={UserRound} label="Họ tên tài xế" value="Nguyễn Văn An" theme={theme} />
                <DriverInfo icon={Phone} label="Số điện thoại" value="0345 123 456" theme={theme} />
                <DriverInfo icon={Truck} label="Loại xe" value="Ford Transit" theme={theme} />
                <DriverInfo icon={ClipboardCheck} label="Biển số xe" value="29B-123.45" theme={theme} />
              </div>
              <div className="flex h-24 w-full flex-none items-center justify-center rounded-lg border border-dashed border-white/20 bg-white/10 text-xs text-white/50 md:w-[150px]">
                ảnh xe
              </div>
            </div>
          </div>
        </div>
      </section>}

      {theme.sectionVisibility.goods && <section className="bg-[#F5F7FA] py-14">
        <div className="mx-auto max-w-[1480px] px-4 sm:px-6 lg:px-[10%]">
          <SectionHeading title={theme.goodsSectionTitle} theme={theme} />
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {theme.goodsTypes.map(({ name }, index) => {
              const Icon = goodsIcons[index % goodsIcons.length];
              return (
              <div key={name} className="overflow-hidden rounded-lg border border-[var(--border-light)] bg-white shadow-[var(--shadow-sm)]">
                <div className="flex h-[104px] items-center justify-center bg-sky-50" style={{ color: secondaryColor }}>
                  <Icon className="h-11 w-11 stroke-[1.6]" />
                </div>
                <div className="px-2 py-3 text-center text-[13px] font-bold leading-5 text-[#0B1F3A]">{name}</div>
              </div>
            )})}
          </div>
        </div>
      </section>}

      {theme.sectionVisibility.finalCta && <section className="bg-[#F5F7FA] pb-14">
        <div className="mx-auto max-w-[1480px] px-4 sm:px-6 lg:px-[10%]">
          <div className="flex flex-wrap items-center gap-8 rounded-lg bg-brand-navy-900 p-8 text-white shadow-[var(--shadow-md)]">
            <div className="flex h-28 w-44 flex-none items-center justify-center rounded-lg border border-dashed border-white/20 bg-white/10 text-xs text-white/50">
              {theme.finalCtaImageLabel}
            </div>
            <div className="min-w-[280px] flex-1">
              <h3 className="text-2xl font-extrabold">{theme.finalCtaTitle} <span className="text-white">{theme.finalCtaHighlight}</span></h3>
              <div className="mt-4 flex flex-wrap gap-5 text-[13.5px] text-[#E2E8F0]">
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
              className="flex min-h-11 items-center gap-3 rounded-lg bg-brand-orange-500 px-7 py-4 text-[22px] font-bold text-brand-navy-900 shadow-[var(--shadow-sm)] transition hover:bg-brand-orange-600"
            >
              <Phone className="h-6 w-6" />
              {theme.hotline}
            </a>
          </div>
        </div>
      </section>}

      <ThemeFooter theme={theme} />
    </div>
  );
}

function NavButton({ active, children, href }: { active?: boolean; children: React.ReactNode; href: string }) {
  return (
    <a
      href={href}
      className={`rounded-md border-b-2 px-2.5 py-1.5 font-semibold transition hover:text-brand-orange-600 ${active ? "border-brand-orange-500 text-brand-navy-900" : "border-transparent text-slate-600"}`}
      aria-current={active ? "page" : undefined}
    >
      {children}
    </a>
  );
}

function FeatureCard({ icon: Icon, title, desc, theme }: { icon: React.ElementType; title: string; desc: string; theme: SiteThemeSettings }) {
  return (
    <div className="rounded-lg border border-[var(--border-light)] bg-white px-5 py-7 text-center shadow-[var(--shadow-sm)] transition hover:-translate-y-0.5">
      <div className="mx-auto mb-5 flex h-[60px] items-center justify-center">
        <Icon className="h-12 w-12" style={{ color: theme.accentColor }} />
      </div>
      <h3 className="text-[15px] font-bold leading-5 text-[#0B1F3A]">{title}</h3>
      <p className="mt-2 text-[13px] leading-5 text-[#475569]">{desc}</p>
    </div>
  );
}

function SectionHeading({ title, desc, theme }: { title: string; desc?: string; theme: SiteThemeSettings }) {
  return (
    <div className="text-center">
      <h2 className="m-0 text-[28px] font-bold tracking-normal sm:text-[32px]" style={{ color: theme.secondaryColor }}>{title}</h2>
      {desc && <p className="mt-2 text-[15px] text-[#475569]">{desc}</p>}
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

function ThemeFooter({ theme }: { theme: SiteThemeSettings }) {
  const footerPhoneHref = `tel:${theme.hotline.replace(/\D/g, "")}`;
  return (
    <footer className="bg-brand-navy-900 pt-12 text-slate-300">
      <div className="mx-auto grid max-w-[1480px] gap-8 px-4 sm:px-6 md:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1.2fr_1fr] lg:px-[10%]">
        <div>
          <div className="mb-4">
            <BrandLogo tone="dark" showTagline />
          </div>
          <p className="max-w-[280px] text-[13.5px] leading-6">
            {theme.footerDescription}
          </p>
        </div>
        <FooterColumn title="DỊCH VỤ" items={[["Tạo đơn hàng", "order"], ["Tuyến chuyển phát", "routes"], ["Bảng giá", "pricing"], ["Tra cứu đơn", "tracking"]]} />
        <FooterColumn title="HỖ TRỢ" items={[["Chính sách dịch vụ", "policy"], ["Liên hệ hỗ trợ", "contact"]]} />
        <div>
          <h4 className="mb-4 mt-1 text-[13px] font-bold tracking-normal text-white">LIÊN HỆ</h4>
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
          <h4 className="mb-4 mt-1 text-[13px] font-bold tracking-normal text-white">KẾT NỐI</h4>
          <div className="flex gap-2.5">
            {["FB", "Zalo", "TikTok", "YT"].map((item) => (
              <span key={item} className="flex h-[38px] min-w-[38px] items-center justify-center rounded-full bg-white/10 px-2 text-[11px] font-extrabold text-white">
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-11 border-t border-white/10 py-5 text-center text-[13px] text-slate-400">
        {theme.footerCopyright}
      </div>
    </footer>
  );
}

function FooterColumn({ title, items }: { title: string; items: Array<[string, View]> }) {
  return (
    <div>
      <h4 className="mb-4 mt-1 text-[13px] font-bold tracking-normal text-white">{title}</h4>
      <div className="flex flex-col gap-3 text-[13.5px]">
        {items.map(([label, view]) => (
          <a key={label} href={publicPathFor(view)} className="text-left text-slate-300 transition hover:text-brand-orange-500">
            {label}
          </a>
        ))}
      </div>
    </div>
  );
}
