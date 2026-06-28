import type { DriverPartner, PartnerApplication } from "../lib/types";

const now = "2026-06-17T08:00:00.000Z";

export const mockPartners: DriverPartner[] = [
  {
    id: "DP-01",
    name: "Nguyen Van An",
    phone: "0901234567",
    zaloName: "An Bac Ninh",
    vehicleType: "Xe 7 cho",
    vehiclePlate: "29A-123.45",
    vehicleCapacity: "450 kg",
    usualRoutes: ["Ha Noi <-> Bac Ninh", "Ha Noi <-> Hung Yen"],
    provinces: ["Bac Ninh", "Hung Yen"],
    canCarryBulkyGoods: false,
    canCarryMotorbike: false,
    canDoNightDelivery: true,
    verificationStatus: "VERIFIED",
    rating: 4.9,
    totalOrders: 126,
    completedOrders: 122,
    cancelledOrders: 4,
    joinedGroups: ["ZG-BN"],
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "DP-02",
    name: "Tran Van Binh",
    phone: "0902345678",
    zaloName: "Binh Hai Phong",
    vehicleType: "Xe 16 cho",
    vehiclePlate: "29B-678.90",
    vehicleCapacity: "1.2 tan",
    usualRoutes: ["Ha Noi <-> Hai Phong"],
    provinces: ["Hai Phong"],
    canCarryBulkyGoods: true,
    canCarryMotorbike: false,
    canDoNightDelivery: false,
    verificationStatus: "VERIFIED",
    rating: 4.8,
    totalOrders: 98,
    completedOrders: 94,
    cancelledOrders: 4,
    joinedGroups: ["ZG-HP"],
    createdAt: now,
    updatedAt: now,
  },
];

export const mockPartnerApplications: PartnerApplication[] = [
  {
    id: "PA-01",
    name: "Le Van Cuong",
    phone: "0903456789",
    vehicleType: "Ban tai",
    vehiclePlate: "29C-555.23",
    usualRoutes: ["Ha Noi <-> Quang Ninh"],
    provinces: ["Quang Ninh"],
    canCarryBulkyGoods: true,
    note: "Co san thung kin, nhan hang dem.",
    status: "NEW_APPLICATION",
    createdAt: now,
  },
];

