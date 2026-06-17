import { ItemType } from "../constants/enums";
import type { DriverCandidate, DriverPartner, Order } from "../types";
import { mockPartners } from "../../data/mockPartners";

function partnerScore(order: Order, partner: DriverPartner) {
  let score = partner.rating * 10 + partner.completedOrders / 20;
  if (partner.provinces.includes(order.deliveryProvince)) score += 60;
  if (partner.provinces.includes(order.pickupProvince)) score += 25;
  if (order.itemType === ItemType.MOTORBIKE && partner.canCarryMotorbike) score += 30;
  if ([ItemType.BULKY, ItemType.OVERSIZED, ItemType.TV_FRIDGE_WASHER].includes(order.itemType) && partner.canCarryBulkyGoods) score += 30;
  if (partner.canDoNightDelivery) score += 5;
  return score;
}

export function findNearestVehicleForOrder(order: Order) {
  const verifiedPartners = mockPartners.filter((partner) => partner.verificationStatus === "VERIFIED");
  const [bestPartner] = verifiedPartners
    .map((partner) => ({ partner, score: partnerScore(order, partner) }))
    .sort((left, right) => right.score - left.score);

  if (!bestPartner) return null;
  return bestPartner.partner;
}

export function createDriverCandidateFromPartner(partner: DriverPartner): DriverCandidate {
  return {
    driverId: partner.id,
    driverName: partner.name,
    driverPhone: partner.phone,
    vehicleType: partner.vehicleType,
    vehiclePlate: partner.vehiclePlate,
    responseText: "He thong goi y xe gan nhat dua tren tuyen va nang luc doi tac.",
    status: "CLAIMED",
    createdAt: new Date().toISOString(),
  };
}
