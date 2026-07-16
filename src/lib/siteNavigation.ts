export type PublicView = "home" | "order" | "tracking" | "routes" | "pricing" | "policy" | "contact";

export const publicRoutePaths: Record<PublicView, string> = {
  home: "/",
  order: "/tao-don",
  tracking: "/tra-cuu",
  routes: "/tuyen-chuyen-phat",
  pricing: "/bang-gia",
  policy: "/chinh-sach",
  contact: "/lien-he",
};

export function publicPathFor(view: PublicView) {
  return publicRoutePaths[view];
}
