import type { MapsAddress, RouteDistance } from "./maps.types";

export const MAPS_COUNTRY = process.env.MAPS_COUNTRY || "VN";

export const MOCK_ADDRESSES: MapsAddress[] = [
  { label: "Cau Giay, Ha Noi", fullAddress: "Quan Cau Giay, Ha Noi", province: "Ha Noi", district: "Cau Giay", lat: 21.0362, lng: 105.7906, placeId: "mock-cau-giay" },
  { label: "Hoan Kiem, Ha Noi", fullAddress: "Quan Hoan Kiem, Ha Noi", province: "Ha Noi", district: "Hoan Kiem", lat: 21.0287, lng: 105.8521, placeId: "mock-hoan-kiem" },
  { label: "Long Bien, Ha Noi", fullAddress: "Quan Long Bien, Ha Noi", province: "Ha Noi", district: "Long Bien", lat: 21.0549, lng: 105.8886, placeId: "mock-long-bien" },
  { label: "TP Bac Ninh, Bac Ninh", fullAddress: "Thanh pho Bac Ninh, Bac Ninh", province: "Bac Ninh", district: "TP Bac Ninh", lat: 21.1861, lng: 106.0763, placeId: "mock-bac-ninh" },
  { label: "Tu Son, Bac Ninh", fullAddress: "Thanh pho Tu Son, Bac Ninh", province: "Bac Ninh", district: "Tu Son", lat: 21.1181, lng: 105.9617, placeId: "mock-tu-son" },
  { label: "TP Hai Phong, Hai Phong", fullAddress: "Thanh pho Hai Phong", province: "Hai Phong", district: "TP Hai Phong", lat: 20.8449, lng: 106.6881, placeId: "mock-hai-phong" },
  { label: "Ha Long, Quang Ninh", fullAddress: "Thanh pho Ha Long, Quang Ninh", province: "Quang Ninh", district: "Ha Long", lat: 20.9712, lng: 107.0448, placeId: "mock-ha-long" },
  { label: "TP Ninh Binh, Ninh Binh", fullAddress: "Thanh pho Ninh Binh, Ninh Binh", province: "Ninh Binh", district: "TP Ninh Binh", lat: 20.2506, lng: 105.9745, placeId: "mock-ninh-binh" },
  { label: "TP Thanh Hoa, Thanh Hoa", fullAddress: "Thanh pho Thanh Hoa, Thanh Hoa", province: "Thanh Hoa", district: "TP Thanh Hoa", lat: 19.8067, lng: 105.7852, placeId: "mock-thanh-hoa" },
  { label: "TP Vinh, Nghe An", fullAddress: "Thanh pho Vinh, Nghe An", province: "Nghe An", district: "TP Vinh", lat: 18.6796, lng: 105.6813, placeId: "mock-vinh" },
  { label: "TP Lao Cai, Lao Cai", fullAddress: "Thanh pho Lao Cai, Lao Cai", province: "Lao Cai", district: "TP Lao Cai", lat: 22.4856, lng: 103.9707, placeId: "mock-lao-cai" },
  { label: "TP Dien Bien Phu, Dien Bien", fullAddress: "Thanh pho Dien Bien Phu, Dien Bien", province: "Dien Bien", district: "TP Dien Bien Phu", lat: 21.386, lng: 103.023, placeId: "mock-dien-bien" },
];

export const MOCK_DISTANCES: Record<string, RouteDistance> = {
  "Ha Noi|Bac Ninh": { distanceKm: 35, durationMinutes: 55 },
  "Ha Noi|Hung Yen": { distanceKm: 45, durationMinutes: 70 },
  "Ha Noi|Hai Phong": { distanceKm: 120, durationMinutes: 150 },
  "Ha Noi|Quang Ninh": { distanceKm: 160, durationMinutes: 210 },
  "Ha Noi|Ninh Binh": { distanceKm: 95, durationMinutes: 120 },
  "Ha Noi|Thanh Hoa": { distanceKm: 160, durationMinutes: 220 },
  "Ha Noi|Nghe An": { distanceKm: 300, durationMinutes: 360 },
  "Ha Noi|Lao Cai": { distanceKm: 290, durationMinutes: 360 },
};

