import { readJsonArray, writeJsonArray } from "../storage/jsonStore";
import { loadPersistentCollection, persistCollection } from "../storage/persistentStore";
import { SeoPage, seoPages as defaultSeoPages } from "./seoPages";

type SeoChangefreq = SeoPage["changefreq"];

let seoPageSettings: SeoPage[] = mergeSeoPages(
  readJsonArray<SeoPage>("seoPages.json", defaultSeoPages),
);

function normalizeText(value: unknown, fallback: string) {
  const text = String(value || "").trim();
  return text || fallback;
}

function normalizeSlug(value: unknown, fallback: string) {
  const slug = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || fallback;
}

function normalizePriority(value: unknown, fallback: number) {
  const priority = Number(value);
  if (!Number.isFinite(priority)) return fallback;
  return Math.min(1, Math.max(0.1, priority));
}

function normalizeChangefreq(value: unknown, fallback: SeoChangefreq) {
  return value === "daily" || value === "weekly" || value === "monthly" ? value : fallback;
}

function normalizeKeywords(value: unknown, fallback: string[]) {
  if (Array.isArray(value)) {
    const keywords = value.map((item) => String(item || "").trim()).filter(Boolean);
    return keywords.length ? keywords : fallback;
  }
  const keywords = String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  return keywords.length ? keywords : fallback;
}

function sanitizeSeoPage(payload: Partial<SeoPage>, fallback: SeoPage): SeoPage {
  return {
    slug: normalizeSlug(payload.slug, fallback.slug),
    title: normalizeText(payload.title, fallback.title),
    description: normalizeText(payload.description, fallback.description),
    h1: normalizeText(payload.h1, fallback.h1),
    intro: normalizeText(payload.intro, fallback.intro),
    keywords: normalizeKeywords(payload.keywords, fallback.keywords),
    priority: normalizePriority(payload.priority, fallback.priority),
    changefreq: normalizeChangefreq(payload.changefreq, fallback.changefreq),
  };
}

function mergeSeoPages(rows: SeoPage[]) {
  const bySlug = new Map(rows.map((page) => [page.slug, page]));
  const merged = defaultSeoPages.map((fallback) => sanitizeSeoPage(bySlug.get(fallback.slug) || fallback, fallback));
  const defaultSlugs = new Set(defaultSeoPages.map((page) => page.slug));
  const customPages = rows
    .filter((page) => page.slug && !defaultSlugs.has(page.slug))
    .map((page) => sanitizeSeoPage(page, defaultSeoPages[0]));
  return [...merged, ...customPages];
}

function persistSeoPages() {
  writeJsonArray("seoPages.json", seoPageSettings);
  persistCollection("seoPages", seoPageSettings);
}

export async function hydrateSeoStorage() {
  const rows = await loadPersistentCollection<SeoPage>("seoPages", seoPageSettings);
  seoPageSettings = mergeSeoPages(rows);
  persistSeoPages();
}

export function getSeoPages() {
  return seoPageSettings;
}

export function updateSeoPages(payload: unknown) {
  const rows = Array.isArray(payload) ? payload : [];
  seoPageSettings = mergeSeoPages(rows);
  persistSeoPages();
  return seoPageSettings;
}

export function updateSeoPage(slug: string, payload: Partial<SeoPage>) {
  const current = seoPageSettings.find((page) => page.slug === slug);
  if (!current) return null;
  const nextPage = sanitizeSeoPage({ ...current, ...payload, slug: current.slug }, current);
  seoPageSettings = seoPageSettings.map((page) => (page.slug === slug ? nextPage : page));
  persistSeoPages();
  return nextPage;
}

export function resetSeoPages() {
  seoPageSettings = defaultSeoPages;
  persistSeoPages();
  return seoPageSettings;
}
