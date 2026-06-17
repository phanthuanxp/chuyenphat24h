import { Direction, ItemType, ServiceLevel } from "./lib/constants/enums";
import { PROVINCES_MAP } from "./lib/constants/routes";
import { mockOrders } from "./data/mockOrders";
import { mockPricingRules } from "./data/mockPricing";
import type { Customer, Driver, Route, Vehicle, ContentPage } from "./types";

export { PROVINCES_MAP };
export const MOCK_ORDERS = mockOrders;
export const MOCK_PRICING_RULES = mockPricingRules;

export const MOCK_CUSTOMERS: Customer[] = [
  {
    id: "C-01",
    name: "Le Minh Tuan",
    phone: "0912345678",
    email: "tuan@example.com",
    type: "SHOP",
    defaultAddress: "Dong Da, Ha Noi",
    totalOrders: 42,
    createdAt: "2026-06-17T08:00:00.000Z",
  },
];

export const MOCK_DRIVERS: Driver[] = [
  { id: "D-01", name: "Nguyen Van An", phone: "0901234567", vehicleId: "V-01", status: "Ranh", rating: 4.9 },
  { id: "D-02", name: "Tran Van Binh", phone: "0902345678", vehicleId: "V-02", status: "Dang chay tuyen", rating: 4.8 },
];

export const MOCK_VEHICLES: Vehicle[] = [
  { id: "V-01", type: "Xe 7 cho", plateNumber: "29A-123.45", capacity: "450 kg", status: "Hoat dong" },
  { id: "V-02", type: "Xe 16 cho", plateNumber: "29B-678.90", capacity: "1.2 tan", status: "Hoat dong" },
];

export const MOCK_ROUTES: Route[] = [
  {
    id: "R-01",
    name: "Ha Noi <-> Bac Ninh",
    originProvince: "Ha Noi",
    destinationProvince: "Bac Ninh",
    direction: Direction.HANOI_TO_PROVINCE,
    departureTime: "14:30",
    estimatedDuration: "2-4 gio",
    serviceLevel: ServiceLevel.EXPRESS_2_4H,
    driverId: "D-01",
    vehicleId: "V-01",
    capacityStatus: "Trong nhieu",
    routeStatus: "Dang nhan hang",
    remainingOrderSlots: 3,
    acceptedItemTypes: [ItemType.DOCUMENT, ItemType.SMALL_PACKAGE],
  },
  {
    id: "R-02",
    name: "Ha Noi <-> Hai Phong",
    originProvince: "Ha Noi",
    destinationProvince: "Hai Phong",
    direction: Direction.HANOI_TO_PROVINCE,
    departureTime: "15:00",
    estimatedDuration: "Trong ngay",
    serviceLevel: ServiceLevel.SAME_DAY,
    driverId: "D-02",
    vehicleId: "V-02",
    capacityStatus: "Con trong vua",
    routeStatus: "Dang nhan hang",
    remainingOrderSlots: 2,
    acceptedItemTypes: [ItemType.DOCUMENT, ItemType.SMALL_PACKAGE, ItemType.SHOP_GOODS],
  },
];

export const MOCK_CONTENT_PAGES: ContentPage[] = [
  {
    id: "P-01",
    title: "Chuyen phat hoa toc lien tinh",
    slug: "chuyen-phat-hoa-toc-lien-tinh",
    metaTitle: "Chuyen Phat 24H",
    metaDescription: "Nhan tan noi, giao tan tay theo xe dang chay.",
    content: "Chuyen Phat 24H phuc vu tu Ha Noi di cac tinh va nguoc lai.",
    pageType: "service",
    status: "published",
    createdAt: "2026-06-17T08:00:00.000Z",
    updatedAt: "2026-06-17T08:00:00.000Z",
  },
];

export const SERVICE_SEO_PAGES = [
  { slug: "chuyen-phat-hoa-toc-lien-tinh", title: "Chuyen phat hoa toc lien tinh" },
  { slug: "gui-giay-to-hoa-toc-di-tinh", title: "Gui giay to hoa toc di tinh" },
  { slug: "gui-hang-cong-kenh-di-tinh", title: "Gui hang cong kenh di tinh" },
  { slug: "van-chuyen-xe-may-di-tinh", title: "Van chuyen xe may di tinh" },
  { slug: "chuyen-phat-trong-ngay-tu-ha-noi", title: "Chuyen phat trong ngay tu Ha Noi" },
  { slug: "chuyen-phat-ha-noi-bac-ninh", title: "Chuyen phat Ha Noi Bac Ninh" },
  { slug: "chuyen-phat-ha-noi-hai-phong", title: "Chuyen phat Ha Noi Hai Phong" },
  { slug: "chuyen-phat-ha-noi-quang-ninh", title: "Chuyen phat Ha Noi Quang Ninh" },
  { slug: "chuyen-phat-ha-noi-ninh-binh", title: "Chuyen phat Ha Noi Ninh Binh" },
  { slug: "chuyen-phat-ha-noi-thanh-hoa", title: "Chuyen phat Ha Noi Thanh Hoa" },
  { slug: "chuyen-phat-ha-noi-nghe-an", title: "Chuyen phat Ha Noi Nghe An" },
];

