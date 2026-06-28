import type { DistanceRequest, MapsSearchOptions, MapsAddress, RouteDistance } from "./maps.types";

export interface MapsProviderAdapter {
  searchAddress(options: MapsSearchOptions): Promise<MapsAddress[]>;
  getPlaceDetails(placeId: string): Promise<MapsAddress | null>;
  calculateDistance(request: DistanceRequest): Promise<RouteDistance>;
}

