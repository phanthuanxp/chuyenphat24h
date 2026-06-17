import { ItemType, RouteGroup, ServiceLevel } from "../constants/enums";
import { MANUAL_QUOTE_ITEM_TYPES } from "../constants/routes";
import type { PricingRule, RouteClassification } from "../types";
import { mockPricingRules } from "../../data/mockPricing";

export interface PriceEstimateInput {
  classification: RouteClassification;
  itemType: ItemType;
  weight?: number;
  declaredValue?: number;
  loadingRequired?: boolean;
  nightDelivery?: boolean;
}

export function isManualQuoteRequired(itemType: ItemType, classification?: RouteClassification) {
  return MANUAL_QUOTE_ITEM_TYPES.includes(itemType) || Boolean(classification?.needsManualReview);
}

export function getPricingRuleForRoute(classification: RouteClassification, itemType: ItemType): PricingRule | undefined {
  return mockPricingRules.find((rule) =>
    rule.isActive &&
    rule.itemType === itemType &&
    (rule.destinationProvince === classification.deliveryProvince || rule.destinationProvince === classification.pickupProvince),
  );
}

export function calculateSurcharges(input: PriceEstimateInput, rule?: PricingRule) {
  return {
    loadingFee: input.loadingRequired ? rule?.loadingFee || 30000 : 0,
    nightFee: input.nightDelivery ? rule?.nightFee || 40000 : 0,
    insuranceFee: input.declaredValue ? Math.round(input.declaredValue * (rule?.insuranceRate || 0.005)) : 0,
  };
}

export function estimatePrice(input: PriceEstimateInput) {
  const manualQuoteRequired = isManualQuoteRequired(input.itemType, input.classification);
  const rule = getPricingRuleForRoute(input.classification, input.itemType);

  if (manualQuoteRequired || rule?.isManualQuoteRequired) {
    return {
      manualQuoteRequired: true,
      finalPrice: undefined,
      message: "Hang nay can nhan vien xac nhan gia thu cong.",
    };
  }

  const baseByGroup: Record<RouteGroup, number> = {
    [RouteGroup.NEAR_HANOI_2_4H]: 150000,
    [RouteGroup.SAME_DAY]: 190000,
    [RouteGroup.NORTHWEST_MANUAL]: 250000,
    [RouteGroup.THANH_HOA_NGHE_AN_24H]: 240000,
    [RouteGroup.MANUAL_REVIEW]: 0,
    [RouteGroup.UNSUPPORTED]: 0,
  };

  const basePrice = rule?.basePrice || baseByGroup[input.classification.routeGroup] || 190000;
  const pricePerKg = rule?.pricePerKg || 12000;
  const taxableWeight = Math.max(0, (input.weight || 1) - 1);
  const weightPrice = taxableWeight * pricePerKg;
  const surcharges = calculateSurcharges(input, rule);
  const finalPrice = Math.max(
    rule?.minPrice || basePrice,
    Math.round(basePrice + weightPrice + surcharges.loadingFee + surcharges.nightFee + surcharges.insuranceFee),
  );

  return {
    manualQuoteRequired: false,
    basePrice,
    weightPrice,
    surcharges,
    finalPrice,
    message: input.classification.serviceLevel === ServiceLevel.EXPRESS_2_4H ? "Uoc tinh tuyen 2-4 gio." : "Uoc tinh theo lich xe hien co.",
  };
}

