import type { MapsProviderAdapter } from "./mapsProviderAdapter";

export const realMapsProvider: MapsProviderAdapter = {
  async searchAddress() {
    throw new Error("Dan code fetch/Node.js cua nha cung cap API Maps vao day.");
  },
  async getPlaceDetails() {
    throw new Error("Dan code fetch/Node.js cua nha cung cap API Maps vao day.");
  },
  async calculateDistance() {
    throw new Error("Dan code fetch/Node.js cua nha cung cap API Maps vao day.");
  },
};

