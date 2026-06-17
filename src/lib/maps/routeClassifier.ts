import { Direction, RouteGroup, ServiceLevel } from "../constants/enums";
import {
  CENTRAL_PROVINCES,
  HANOI_PROVINCE,
  NEAR_HANOI_PROVINCES,
  NORTHWEST_PROVINCES,
  SAME_DAY_PROVINCES,
  SERVICE_PROVINCES,
  UNSUPPORTED_PROVINCES,
} from "../constants/routes";
import type { RouteClassification } from "../types";

const ALIASES: Record<string, string> = {
  "hanoi": "Ha Noi",
  "ha noi": "Ha Noi",
  "hn": "Ha Noi",
  "bacninh": "Bac Ninh",
  "hai phong": "Hai Phong",
  "quang ninh": "Quang Ninh",
  "ninh binh": "Ninh Binh",
  "thanh hoa": "Thanh Hoa",
  "nghe an": "Nghe An",
  "lao cai": "Lao Cai",
  "dien bien": "Dien Bien",
  "dien bien phu": "Dien Bien Phu",
};

function removeVietnameseMarks(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");
}

export function normalizeProvinceName(value = "") {
  const simple = removeVietnameseMarks(value).trim().replace(/\s+/g, " ");
  const key = simple.toLowerCase();
  if (ALIASES[key]) return ALIASES[key];
  const matched = SERVICE_PROVINCES.find((province) => province.toLowerCase() === key);
  return matched || simple;
}

export function detectDirection(pickupProvince: string, deliveryProvince: string) {
  const pickup = normalizeProvinceName(pickupProvince);
  const delivery = normalizeProvinceName(deliveryProvince);
  if (pickup === HANOI_PROVINCE && delivery === HANOI_PROVINCE) return Direction.HANOI_LOCAL;
  if (pickup === HANOI_PROVINCE) return Direction.HANOI_TO_PROVINCE;
  if (delivery === HANOI_PROVINCE) return Direction.PROVINCE_TO_HANOI;
  return Direction.PROVINCE_TO_PROVINCE;
}

export function validateServiceArea(province: string) {
  const normalized = normalizeProvinceName(province);
  if (UNSUPPORTED_PROVINCES.includes(normalized)) return false;
  return SERVICE_PROVINCES.includes(normalized);
}

export function classifyRouteGroup(pickupProvince: string, deliveryProvince: string): RouteClassification {
  const pickup = normalizeProvinceName(pickupProvince);
  const delivery = normalizeProvinceName(deliveryProvince);
  const direction = detectDirection(pickup, delivery);
  const otherProvince = pickup === HANOI_PROVINCE ? delivery : pickup;
  const base = {
    pickupProvince: pickup,
    deliveryProvince: delivery,
    direction,
    routeName: `${pickup} <-> ${delivery}`,
  };

  if (UNSUPPORTED_PROVINCES.includes(pickup) || UNSUPPORTED_PROVINCES.includes(delivery)) {
    return {
      ...base,
      routeGroup: RouteGroup.UNSUPPORTED,
      serviceLevel: ServiceLevel.UNSUPPORTED,
      isSupported: false,
      needsManualReview: true,
      publicMessage: "Hien Chuyen Phat 24H chua khai thac tuyen nay.",
    };
  }

  if (!validateServiceArea(pickup) || !validateServiceArea(delivery)) {
    return {
      ...base,
      routeGroup: RouteGroup.MANUAL_REVIEW,
      serviceLevel: ServiceLevel.MANUAL_CONFIRMATION,
      isSupported: true,
      needsManualReview: true,
      publicMessage: "Khu vuc nay can nhan vien kiem tra thu cong.",
    };
  }

  if (direction === Direction.HANOI_LOCAL || direction === Direction.PROVINCE_TO_PROVINCE) {
    return {
      ...base,
      routeGroup: RouteGroup.MANUAL_REVIEW,
      serviceLevel: ServiceLevel.MANUAL_CONFIRMATION,
      isSupported: true,
      needsManualReview: true,
      publicMessage: "Tuyen nay can nhan vien kiem tra thu cong.",
    };
  }

  if (NEAR_HANOI_PROVINCES.includes(otherProvince)) {
    return {
      ...base,
      routeGroup: RouteGroup.NEAR_HANOI_2_4H,
      serviceLevel: ServiceLevel.EXPRESS_2_4H,
      isSupported: true,
      needsManualReview: false,
      publicMessage: "Co the tao don ngay, du kien 2-4 gio.",
    };
  }

  if (SAME_DAY_PROVINCES.includes(otherProvince)) {
    return {
      ...base,
      routeGroup: RouteGroup.SAME_DAY,
      serviceLevel: ServiceLevel.SAME_DAY,
      isSupported: true,
      needsManualReview: false,
      publicMessage: "Co the tao don ngay, du kien trong ngay hoac 24h.",
    };
  }

  if (NORTHWEST_PROVINCES.includes(otherProvince)) {
    return {
      ...base,
      routeGroup: RouteGroup.NORTHWEST_MANUAL,
      serviceLevel: ServiceLevel.MANUAL_CONFIRMATION,
      isSupported: true,
      needsManualReview: true,
      publicMessage: "Tuyen Tay Bac can xac nhan lich xe truoc khi cam ket.",
    };
  }

  if (CENTRAL_PROVINCES.includes(otherProvince)) {
    return {
      ...base,
      routeGroup: RouteGroup.THANH_HOA_NGHE_AN_24H,
      serviceLevel: ServiceLevel.WITHIN_24H,
      isSupported: true,
      needsManualReview: false,
      publicMessage: "Co the tao don, du kien trong ngay hoac 24h.",
    };
  }

  return {
    ...base,
    routeGroup: RouteGroup.MANUAL_REVIEW,
    serviceLevel: ServiceLevel.MANUAL_CONFIRMATION,
    isSupported: true,
    needsManualReview: true,
    publicMessage: "Khu vuc nay can nhan vien kiem tra thu cong.",
  };
}

export function estimateServiceLevel(pickupProvince: string, deliveryProvince: string) {
  return classifyRouteGroup(pickupProvince, deliveryProvince).serviceLevel;
}

