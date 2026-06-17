import { MAPS_COUNTRY } from "./maps.constants";

export function normalizeAddressText(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

export function buildAddressLabel(address: string, province?: string) {
  return [normalizeAddressText(address), province, MAPS_COUNTRY].filter(Boolean).join(", ");
}

