import { RouteGroup, ServiceLevel } from "../lib/constants/enums";

export const mockRoutes = [
  { id: "R-01", name: "Ha Noi <-> Bac Ninh", province: "Bac Ninh", routeGroup: RouteGroup.NEAR_HANOI_2_4H, serviceLevel: ServiceLevel.EXPRESS_2_4H, estimatedTime: "2-4 gio" },
  { id: "R-02", name: "Ha Noi <-> Hai Phong", province: "Hai Phong", routeGroup: RouteGroup.SAME_DAY, serviceLevel: ServiceLevel.SAME_DAY, estimatedTime: "Trong ngay" },
  { id: "R-03", name: "Ha Noi <-> Lao Cai", province: "Lao Cai", routeGroup: RouteGroup.NORTHWEST_MANUAL, serviceLevel: ServiceLevel.MANUAL_CONFIRMATION, estimatedTime: "Can xac nhan lich xe" },
  { id: "R-04", name: "Ha Noi <-> Nghe An", province: "Nghe An", routeGroup: RouteGroup.THANH_HOA_NGHE_AN_24H, serviceLevel: ServiceLevel.WITHIN_24H, estimatedTime: "Trong 24h" },
];

