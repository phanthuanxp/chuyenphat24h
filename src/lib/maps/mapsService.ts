import type { DistanceRequest } from "./maps.types";
import type { MapsProviderAdapter } from "./mapsProviderAdapter";
import { mockMapsProvider } from "./mockMapsProvider";
import { realMapsProvider } from "./realMapsProvider";

function getProvider(): MapsProviderAdapter {
  return process.env.MAPS_PROVIDER === "real" ? realMapsProvider : mockMapsProvider;
}

export const mapsService = {
  searchAddress(query: string) {
    return getProvider().searchAddress({ query });
  },
  getPlaceDetails(placeId: string) {
    return getProvider().getPlaceDetails(placeId);
  },
  geocodeAddress(query: string) {
    return getProvider().searchAddress({ query, limit: 1 }).then((items) => items[0] || null);
  },
  reverseGeocode(lat: number, lng: number) {
    return getProvider().searchAddress({ query: `${lat},${lng}`, limit: 1 }).then((items) => items[0] || null);
  },
  calculateDistance(request: DistanceRequest) {
    return getProvider().calculateDistance(request);
  },
  async normalizeAddress(input: string) {
    return this.geocodeAddress(input);
  },
};

