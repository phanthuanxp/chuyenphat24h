export interface SiteThemeSettings {
  id: "site-theme";
  brandName: string;
  brandShortName: string;
  tagline: string;
  hotline: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  heroImageUrl: string;
  heroTitle: string;
  heroHighlight: string;
  heroSubtitle: string;
  ctaPrimary: string;
  ctaSecondary: string;
  footerDescription: string;
  updatedAt: string;
}

export const defaultThemeSettings: SiteThemeSettings = {
  id: "site-theme",
  brandName: "Chuyển Phát 24H",
  brandShortName: "CP24H",
  tagline: "Hàng đi theo tuyến xe đang chạy",
  hotline: "0345 07 6789",
  primaryColor: "#f25c2b",
  secondaryColor: "#0c2349",
  accentColor: "#22a06b",
  heroImageUrl: "/theme/banner-hero.png",
  heroTitle: "Chuyển phát liên tỉnh siêu tốc, nhận hàng tận nơi,",
  heroHighlight: "giao tận tay ngay trong ngày",
  heroSubtitle: "Để lại thông tin, nhân viên gọi lại tư vấn và báo giá ngay.",
  ctaPrimary: "TẠO ĐƠN NGAY",
  ctaSecondary: "Tra cứu đơn",
  footerDescription: "Chuyển phát liên tỉnh siêu tốc, nhận hàng tận nơi, giao tận tay ngay trong ngày.",
  updatedAt: new Date(0).toISOString(),
};
