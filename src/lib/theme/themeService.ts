import { readJsonArray, writeJsonArray } from "../storage/jsonStore";
import { loadPersistentCollection, persistCollection } from "../storage/persistentStore";
import { defaultThemeSettings, SiteThemeSettings } from "./themeTypes";

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

function sanitizeThemeSettings(payload: Partial<SiteThemeSettings>) {
  const next: SiteThemeSettings = {
    ...themeSettings,
    brandName: normalizeText(payload.brandName, themeSettings.brandName),
    brandShortName: normalizeText(payload.brandShortName, themeSettings.brandShortName),
    tagline: normalizeText(payload.tagline, themeSettings.tagline),
    hotline: normalizeText(payload.hotline, themeSettings.hotline),
    primaryColor: normalizeColor(payload.primaryColor, themeSettings.primaryColor),
    secondaryColor: normalizeColor(payload.secondaryColor, themeSettings.secondaryColor),
    accentColor: normalizeColor(payload.accentColor, themeSettings.accentColor),
    heroImageUrl: normalizeText(payload.heroImageUrl, themeSettings.heroImageUrl),
    heroTitle: normalizeText(payload.heroTitle, themeSettings.heroTitle),
    heroHighlight: normalizeText(payload.heroHighlight, themeSettings.heroHighlight),
    heroSubtitle: normalizeText(payload.heroSubtitle, themeSettings.heroSubtitle),
    ctaPrimary: normalizeText(payload.ctaPrimary, themeSettings.ctaPrimary),
    ctaSecondary: normalizeText(payload.ctaSecondary, themeSettings.ctaSecondary),
    footerDescription: normalizeText(payload.footerDescription, themeSettings.footerDescription),
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
  themeSettings = { ...defaultThemeSettings, ...(rows[0] || themeSettings) };
  persistThemeSettings();
}

export function getThemeSettings() {
  return themeSettings;
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
