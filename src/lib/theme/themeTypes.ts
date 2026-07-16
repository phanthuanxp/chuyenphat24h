export interface ThemeFeatureItem {
  title: string;
  desc: string;
}

export interface ThemeGoodsItem {
  name: string;
  price: string;
}

export interface ThemeRouteItem {
  abbr: string;
  province: string;
}

export interface ThemeTextItem {
  title: string;
  desc: string;
}

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
  footerLocation: string;
  footerCopyright: string;
  routeSectionTitle: string;
  routeSectionDesc: string;
  routeCtaText: string;
  whySectionTitle: string;
  driverSectionTitle: string;
  driverSectionDesc: string;
  goodsSectionTitle: string;
  finalCtaTitle: string;
  finalCtaHighlight: string;
  finalCtaImageLabel: string;
  heroBenefits: string[];
  featureCards: ThemeFeatureItem[];
  routeCards: ThemeRouteItem[];
  whyCards: ThemeTextItem[];
  goodsTypes: ThemeGoodsItem[];
  finalCtaBenefits: string[];
  sectionVisibility: {
    features: boolean;
    routes: boolean;
    why: boolean;
    driver: boolean;
    goods: boolean;
    finalCta: boolean;
  };
  updatedAt: string;
}

export const defaultThemeSettings: SiteThemeSettings = {
  id: "site-theme",
  brandName: "Chuyển Phát 24H",
  brandShortName: "CP24H",
  tagline: "Hàng đi theo tuyến xe đang chạy",
  hotline: "0345 07 6789",
  primaryColor: "#F97316",
  secondaryColor: "#0B1F3A",
  accentColor: "#38BDF8",
  heroImageUrl: "/theme/banner-hero.png",
  heroTitle: "Chuyển phát liên tỉnh siêu tốc, nhận hàng tận nơi,",
  heroHighlight: "giao tận tay ngay trong ngày",
  heroSubtitle: "Để lại thông tin, nhân viên gọi lại tư vấn và báo giá ngay.",
  ctaPrimary: "TẠO ĐƠN NGAY",
  ctaSecondary: "Tra cứu đơn",
  footerDescription: "Chuyển phát liên tỉnh siêu tốc, nhận hàng tận nơi, giao tận tay ngay trong ngày.",
  footerLocation: "Hà Nội và các tỉnh phía Bắc",
  footerCopyright: "© 2026 Chuyển Phát 24H. Tất cả quyền được bảo lưu.",
  routeSectionTitle: "TUYẾN CHUYỂN PHÁT 2 CHIỀU",
  routeSectionDesc: "Hà Nội và các tỉnh lân cận, giao nhận 2 chiều trong ngày",
  routeCtaText: "Chưa có tuyến bạn cần? Liên hệ ngay, chúng tôi sẽ sắp xếp xe phù hợp nhất.",
  whySectionTitle: "VÌ SAO CHỌN CHUYỂN PHÁT 24H?",
  driverSectionTitle: "THÔNG TIN TÀI XẾ & PHƯƠNG TIỆN SAU KHI XÁC NHẬN ĐƠN HÀNG",
  driverSectionDesc: "Sau khi đơn hàng được xác nhận, bạn sẽ nhận được thông tin tài xế và phương tiện thay cho việc tra cứu đơn thủ công.",
  goodsSectionTitle: "NHẬN GỬI ĐA DẠNG HÀNG HÓA",
  finalCtaTitle: "GỬI HÀNG GẤP?",
  finalCtaHighlight: "GỌI NGAY CHO CHÚNG TÔI!",
  finalCtaImageLabel: "ảnh xe tải",
  heroBenefits: [
    "Giao nhận tận tay",
    "Không lưu kho, bảo quản hàng tốt hơn",
    "Điều phối xe gần nhất",
    "Nhận giấy tờ, hàng gấp, đồ ăn, thực phẩm tươi sống",
    "Gửi hàng ngay, xe nhận và chuyển đi luôn",
    "Hàng đi cùng xe tuyến đang chạy",
  ],
  featureCards: [
    {
      title: "Giao hàng liên tỉnh siêu tốc trong ngày",
      desc: "Hàng đi cùng xe tuyến chạy liên tục, không chờ đợi.",
    },
    {
      title: "Điều phối xe gần nhất nhận ngay, đi ngay",
      desc: "Xe gần nhất được điều phối nhanh chóng, linh hoạt.",
    },
    {
      title: "Giao nhận tận tay không qua trung gian",
      desc: "Tài xế trực tiếp nhận hàng và giao đến tay người nhận.",
    },
    {
      title: "Hàng hóa được bảo quản tốt hơn",
      desc: "Không qua kho bãi, hạn chế va đập, giữ nguyên chất lượng.",
    },
    {
      title: "Hỗ trợ 24/7",
      desc: "Tư vấn và hỗ trợ mọi lúc, mọi nơi.",
    },
  ],
  routeCards: [
    { abbr: "BN", province: "Bắc Ninh" },
    { abbr: "BG", province: "Bắc Giang" },
    { abbr: "HY", province: "Hưng Yên" },
    { abbr: "HD", province: "Hải Dương" },
    { abbr: "HP", province: "Hải Phòng" },
    { abbr: "NĐ", province: "Nam Định" },
    { abbr: "TB", province: "Thái Bình" },
    { abbr: "NB", province: "Ninh Bình" },
  ],
  whyCards: [
    { title: "Lấy hàng tận nơi", desc: "Không cần mang hàng ra bến hoặc kho trung chuyển." },
    { title: "Chạy theo tuyến thật", desc: "Tối ưu xe đang chạy tuyến Hà Nội và các tỉnh." },
    { title: "Báo giá rõ ràng", desc: "Hàng đặc biệt được nhân viên gọi xác nhận trước." },
    { title: "Tracking đơn", desc: "Khách hàng tra cứu trạng thái bằng mã đơn và số điện thoại." },
    { title: "Admin điều phối", desc: "Đơn được kiểm soát trước khi giao cho tài xế." },
    { title: "Mở rộng đội xe", desc: "Phù hợp mô hình đối tác xe 4 chỗ, 7 chỗ, bán tải, tải nhỏ." },
  ],
  goodsTypes: [
    { name: "Giấy tờ, hồ sơ, hợp đồng", price: "Từ 25.000đ" },
    { name: "Hàng hóa thương mại", price: "Từ 40.000đ" },
    { name: "Thực phẩm tươi sống", price: "Từ 50.000đ" },
    { name: "Đồ ăn, suất ăn, đồ uống", price: "Từ 35.000đ" },
    { name: "Hàng cồng kềnh, hàng nặng", price: "Từ 80.000đ" },
    { name: "Hoa tươi, cây cảnh", price: "Từ 45.000đ" },
  ],
  finalCtaBenefits: [
    "Nhận hàng tận nơi trong ngày",
    "Điều phối xe gần nhất để chuyển đi ngay",
    "Giao tận tay người nhận",
  ],
  sectionVisibility: {
    features: true,
    routes: true,
    why: true,
    driver: true,
    goods: true,
    finalCta: true,
  },
  updatedAt: new Date(0).toISOString(),
};
