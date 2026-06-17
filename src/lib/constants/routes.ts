import { ItemType, RouteGroup, ServiceLevel } from "./enums";

export const HANOI_PROVINCE = "Ha Noi";

export const NEAR_HANOI_PROVINCES = [
  "Bac Ninh",
  "Hung Yen",
  "Vinh Phuc",
  "Ha Nam",
  "Hai Duong",
  "Thai Nguyen",
  "Bac Giang",
  "Hoa Binh",
];

export const SAME_DAY_PROVINCES = [
  "Hai Phong",
  "Quang Ninh",
  "Ninh Binh",
  "Nam Dinh",
  "Thai Binh",
  "Phu Tho",
  "Tuyen Quang",
  "Lang Son",
];

export const NORTHWEST_PROVINCES = ["Yen Bai", "Lao Cai", "Son La", "Lai Chau"];
export const CENTRAL_PROVINCES = ["Thanh Hoa", "Nghe An"];
export const UNSUPPORTED_PROVINCES = ["Dien Bien", "Dien Bien Phu"];

export const SERVICE_PROVINCES = [
  HANOI_PROVINCE,
  ...NEAR_HANOI_PROVINCES,
  ...SAME_DAY_PROVINCES,
  ...NORTHWEST_PROVINCES,
  ...CENTRAL_PROVINCES,
];

export const MANUAL_QUOTE_ITEM_TYPES = [
  ItemType.ELECTRONICS,
  ItemType.FRAGILE,
  ItemType.MOTORBIKE,
  ItemType.TV_FRIDGE_WASHER,
  ItemType.BULKY,
  ItemType.OVERSIZED,
];

export const ROUTE_GROUP_LABELS: Record<RouteGroup, string> = {
  [RouteGroup.NEAR_HANOI_2_4H]: "Tuyen gan Ha Noi - 2 den 4 gio",
  [RouteGroup.SAME_DAY]: "Tuyen trong ngay / 24h",
  [RouteGroup.NORTHWEST_MANUAL]: "Tuyen Tay Bac - can xac nhan lich xe",
  [RouteGroup.THANH_HOA_NGHE_AN_24H]: "Thanh Hoa / Nghe An - trong ngay / 24h",
  [RouteGroup.MANUAL_REVIEW]: "Can nhan vien kiem tra thu cong",
  [RouteGroup.UNSUPPORTED]: "Khong ho tro tuyen",
};

export const SERVICE_LEVEL_LABELS: Record<ServiceLevel, string> = {
  [ServiceLevel.EXPRESS_2_4H]: "2-4 gio",
  [ServiceLevel.SAME_DAY]: "Trong ngay",
  [ServiceLevel.WITHIN_24H]: "Trong 24h",
  [ServiceLevel.MANUAL_CONFIRMATION]: "Can xac nhan lich xe",
  [ServiceLevel.UNSUPPORTED]: "Khong ho tro",
};

export const PROVINCES_MAP: Record<string, string[]> = {
  "Ha Noi": ["Cau Giay", "Hoan Kiem", "Long Bien", "Dong Da", "Thanh Xuan", "Ha Dong"],
  "Bac Ninh": ["TP Bac Ninh", "Tu Son", "Que Vo", "Yen Phong"],
  "Hung Yen": ["TP Hung Yen", "Van Giang", "My Hao", "Van Lam"],
  "Vinh Phuc": ["Vinh Yen", "Phuc Yen", "Binh Xuyen"],
  "Ha Nam": ["Phu Ly", "Duy Tien", "Kim Bang"],
  "Hai Duong": ["TP Hai Duong", "Chi Linh", "Cam Giang"],
  "Thai Nguyen": ["TP Thai Nguyen", "Pho Yen", "Song Cong"],
  "Bac Giang": ["TP Bac Giang", "Viet Yen", "Yen Dung"],
  "Hoa Binh": ["TP Hoa Binh", "Luong Son", "Mai Chau"],
  "Hai Phong": ["TP Hai Phong", "Hong Bang", "Ngo Quyen", "Le Chan"],
  "Quang Ninh": ["Ha Long", "Cam Pha", "Uong Bi", "Mong Cai"],
  "Ninh Binh": ["TP Ninh Binh", "Tam Diep", "Hoa Lu"],
  "Nam Dinh": ["TP Nam Dinh", "My Loc", "Hai Hau"],
  "Thai Binh": ["TP Thai Binh", "Dong Hung", "Vu Thu"],
  "Phu Tho": ["Viet Tri", "TX Phu Tho", "Lam Thao"],
  "Tuyen Quang": ["TP Tuyen Quang", "Son Duong", "Yen Son"],
  "Lang Son": ["TP Lang Son", "Cao Loc", "Huu Lung"],
  "Yen Bai": ["TP Yen Bai", "Nghia Lo", "Van Chan"],
  "Lao Cai": ["TP Lao Cai", "Sa Pa", "Bao Thang"],
  "Son La": ["TP Son La", "Moc Chau", "Mai Son"],
  "Lai Chau": ["TP Lai Chau", "Phong Tho", "Tam Duong"],
  "Thanh Hoa": ["TP Thanh Hoa", "Sam Son", "Bim Son"],
  "Nghe An": ["TP Vinh", "Cua Lo", "Dien Chau"],
  "Dien Bien": ["TP Dien Bien Phu"],
};

