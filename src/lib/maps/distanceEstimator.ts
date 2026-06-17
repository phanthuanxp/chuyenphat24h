import { mapsService } from "./mapsService";

export function estimateDistance(originProvince: string, destinationProvince: string) {
  return mapsService.calculateDistance({
    origin: originProvince,
    destination: destinationProvince,
    originProvince,
    destinationProvince,
  });
}

