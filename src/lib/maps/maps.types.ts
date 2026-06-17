export type { MapsAddress, RouteDistance } from "../types";

export interface MapsSearchOptions {
  query: string;
  limit?: number;
}

export interface DistanceRequest {
  origin: string;
  destination: string;
  originProvince?: string;
  destinationProvince?: string;
}

