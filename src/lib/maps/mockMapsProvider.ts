import { MOCK_ADDRESSES, MOCK_DISTANCES } from "./maps.constants";
import type { MapsProviderAdapter } from "./mapsProviderAdapter";
import type { DistanceRequest, MapsAddress, MapsSearchOptions, RouteDistance } from "./maps.types";
import { normalizeProvinceName } from "./routeClassifier";

function includesInsensitive(source: string, query: string) {
  return source.toLowerCase().includes(query.toLowerCase());
}

function findAddressByText(text: string): MapsAddress | undefined {
  return MOCK_ADDRESSES.find((address) => includesInsensitive(text, address.label) || includesInsensitive(text, address.province));
}

export const mockMapsProvider: MapsProviderAdapter = {
  async searchAddress({ query, limit = 8 }: MapsSearchOptions) {
    if (!query.trim()) {
      return MOCK_ADDRESSES.slice(0, limit);
    }
    return MOCK_ADDRESSES.filter((address) =>
      includesInsensitive(address.label, query) || includesInsensitive(address.fullAddress, query),
    ).slice(0, limit);
  },

  async getPlaceDetails(placeId: string) {
    return MOCK_ADDRESSES.find((address) => address.placeId === placeId) || null;
  },

  async calculateDistance(request: DistanceRequest): Promise<RouteDistance> {
    const origin = normalizeProvinceName(request.originProvince || findAddressByText(request.origin)?.province || request.origin);
    const destination = normalizeProvinceName(request.destinationProvince || findAddressByText(request.destination)?.province || request.destination);
    const forward = MOCK_DISTANCES[`${origin}|${destination}`];
    const backward = MOCK_DISTANCES[`${destination}|${origin}`];
    return forward || backward || { distanceKm: 0, durationMinutes: 0, raw: { estimated: false } };
  },
};

