import { ItemType } from "../constants/enums";
import type { ZaloRouteGroup } from "../types";
import { mockZaloGroups } from "../../data/mockZaloGroups";

export function getZaloGroups(): ZaloRouteGroup[] {
  return mockZaloGroups;
}

export function getGroupByRoute(routeName: string) {
  return mockZaloGroups.filter((group) => group.routeName === routeName && group.isActive);
}

export function getGroupByProvince(province: string) {
  return mockZaloGroups.filter((group) => group.province === province && group.isActive);
}

export function getSpecialGroupsForItemType(itemType: ItemType) {
  return mockZaloGroups.filter((group) => group.groupType === "SPECIAL_ITEM" && group.allowedItemTypes.includes(itemType));
}

