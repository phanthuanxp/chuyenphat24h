import { readJsonArray, writeJsonArray } from "../storage/jsonStore";
import { loadPersistentCollection, persistCollection } from "../storage/persistentStore";
import {
  defaultThemeSettings,
  SiteThemeSettings,
  ThemeFeatureItem,
  ThemeGoodsItem,
  ThemeRouteItem,
  ThemeTextItem,
} from "./themeTypes";

let themeSettings: SiteThemeSettings = {
  ...defaultThemeSettings,
  ...readJsonArray<SiteThemeSettings>("themeSettings.json", [defaultThemeSettings])[0],
};

function normalizeColor(value: unknown, fallback: string) {
  const color = String(value || "").trim();
  return /^#[0-9a-fA-F]{6}$/.test(color) ? color : fallback;
}

function normalizeText(value: unknown, fallback: string) {
  const text = String(value || "").trim();
  return text || fallback;
}

function normalizeBoolean(value: unknown, fallback: boolean) {
  return typeof value === "boolean" ? value : fallback;
}

function normalizeStringList(value: unknown, fallback: string[]) {
  if (!Array.isArray(value)) return fallback;
  const next = value.map((item) => String(item || "").trim()).filter(Boolean);
  return next.length ? next : fallback;
}

function normalizeFeatureList(value: unknown, fallback: ThemeFeatureItem[]) {
  if (!Array.isArray(value)) return fallback;
  const next = value
    .map((item) => ({
      title: normalizeText((item as Partial<ThemeFeatureItem>)?.title, ""),
      desc: normalizeText((item as Partial<ThemeFeatureItem>)?.desc, ""),
    }))
    .filter((item) => item.title && item.desc);
  return next.length ? next : fallback;
}

function normalizeRouteList(value: unknown, fallback: ThemeRouteItem[]) {
  if (!Array.isArray(value)) return fallback;
  const next = value
    .map((item) => ({
      abbr: normalizeText((item as Partial<ThemeRouteItem>)?.abbr, ""),
      province: normalizeText((item as Partial<ThemeRouteItem>)?.province, ""),
    }))
    .filter((item) => item.abbr && item.province);
  return next.length ? next : fallback;
}

function normalizeTextCardList(value: unknown, fallback: ThemeTextItem[]) {
  if (!Array.isArray(value)) return fallback;
  const next = value
    .map((item) => ({
      title: normalizeText((item as Partial<ThemeTextItem>)?.title, ""),
      desc: normalizeText((item as Partial<ThemeTextItem>)?.desc, ""),
    }))
    .filter((item) => item.title && item.desc);
  return next.length ? next : fallback;
}

function normalizeGoodsList(value: unknown, fallback: ThemeGoodsItem[]) {
  if (!Array.isArray(value)) return fallback;
  const next = value
    .map((item) => ({
      name: normalizeText((item as Partial<ThemeGoodsItem>)?.name, ""),
      price: normalizeText((item as Partial<ThemeGoodsItem>)?.price, ""),
    }))
    .filter((item) => item.name && item.price);
  return next.length ? next : fallback;
}

function mergeWithDefaults(settings: Partial<SiteThemeSettings>) {
  return {
    ...defaultThemeSettings,
    ...settings,
    sectionVisibility: {
      ...defaultThemeSettings.sectionVisibility,
      ...(settings.sectionVisibility || {}),
    },
  };
}

function sanitizeThemeSettings(payload: Partial<SiteThemeSettings>) {
  const current = mergeWithDefaults(themeSettings);
  const next: SiteThemeSettings = {
    ...current,
    brandName: normalizeText(payload.brandName, current.brandName),
    brandShortName: normalizeText(payload.brandShortName, current.brandShortName),
    tagline: normalizeText(payload.tagline, current.tagline),
    hotline: normalizeText(payload.hotline, current.hotline),
    primaryColor: normalizeColor(payload.primaryColor, current.primaryColor),
    secondaryColor: normalizeColor(payload.secondaryColor, current.secondaryColor),
    accentColor: normalizeColor(payload.accentColor, current.accentColor),
    heroImageUrl: normalizeText(payload.heroImageUrl, current.heroImageUrl),
    heroTitle: normalizeText(payload.heroTitle, current.heroTitle),
    heroHighlight: normalizeText(payload.heroHighlight, current.heroHighlight),
    heroSubtitle: normalizeText(payload.heroSubtitle, current.heroSubtitle),
    ctaPrimary: normalizeText(payload.ctaPrimary, current.ctaPrimary),
    ctaSecondary: normalizeText(payload.ctaSecondary, current.ctaSecondary),
    footerDescription: normalizeText(payload.footerDescription, current.footerDescription),
    footerLocation: normalizeText(payload.footerLocation, current.footerLocation),
    footerCopyright: normalizeText(payload.footerCopyright, current.footerCopyright),
    routeSectionTitle: normalizeText(payload.routeSectionTitle, current.routeSectionTitle),
    routeSectionDesc: normalizeText(payload.routeSectionDesc, current.routeSectionDesc),
    routeCtaText: normalizeText(payload.routeCtaText, current.routeCtaText),
    whySectionTitle: normalizeText(payload.whySectionTitle, current.whySectionTitle),
    driverSectionTitle: normalizeText(payload.driverSectionTitle, current.driverSectionTitle),
    driverSectionDesc: normalizeText(payload.driverSectionDesc, current.driverSectionDesc),
    goodsSectionTitle: normalizeText(payload.goodsSectionTitle, current.goodsSectionTitle),
    finalCtaTitle: normalizeText(payload.finalCtaTitle, current.finalCtaTitle),
    finalCtaHighlight: normalizeText(payload.finalCtaHighlight, current.finalCtaHighlight),
    finalCtaImageLabel: normalizeText(payload.finalCtaImageLabel, current.finalCtaImageLabel),
    heroBenefits: normalizeStringList(payload.heroBenefits, current.heroBenefits),
    featureCards: normalizeFeatureList(payload.featureCards, current.featureCards),
    routeCards: normalizeRouteList(payload.routeCards, current.routeCards),
    whyCards: normalizeTextCardList(payload.whyCards, current.whyCards),
    goodsTypes: normalizeGoodsList(payload.goodsTypes, current.goodsTypes),
    finalCtaBenefits: normalizeStringList(payload.finalCtaBenefits, current.finalCtaBenefits),
    sectionVisibility: {
      features: normalizeBoolean(payload.sectionVisibility?.features, current.sectionVisibility.features),
      routes: normalizeBoolean(payload.sectionVisibility?.routes, current.sectionVisibility.routes),
      why: normalizeBoolean(payload.sectionVisibility?.why, current.sectionVisibility.why),
      driver: normalizeBoolean(payload.sectionVisibility?.driver, current.sectionVisibility.driver),
      goods: normalizeBoolean(payload.sectionVisibility?.goods, current.sectionVisibility.goods),
      finalCta: normalizeBoolean(payload.sectionVisibility?.finalCta, current.sectionVisibility.finalCta),
    },
    id: "site-theme",
    updatedAt: new Date().toISOString(),
  };

  return next;
}

function persistThemeSettings() {
  writeJsonArray("themeSettings.json", [themeSettings]);
  persistCollection("themeSettings", [themeSettings]);
}

export async function hydrateThemeStorage() {
  const rows = await loadPersistentCollection<SiteThemeSettings>("themeSettings", [themeSettings]);
  themeSettings = sanitizeThemeSettings(rows[0] || themeSettings);
  persistThemeSettings();
}

export function getThemeSettings() {
  return mergeWithDefaults(themeSettings);
}

export function updateThemeSettings(payload: Partial<SiteThemeSettings>) {
  themeSettings = sanitizeThemeSettings(payload);
  persistThemeSettings();
  return themeSettings;
}

export function resetThemeSettings() {
  themeSettings = { ...defaultThemeSettings, updatedAt: new Date().toISOString() };
  persistThemeSettings();
  return themeSettings;
}
