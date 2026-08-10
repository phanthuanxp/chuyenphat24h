import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const storageDir = process.env.CP24H_STORAGE_DIR || path.join(process.cwd(), "storage");

function ensureStorageDir() {
  if (!fs.existsSync(storageDir)) {
    fs.mkdirSync(storageDir, { recursive: true });
  }
}

function resolveStoragePath(fileName: string) {
  ensureStorageDir();
  return path.join(storageDir, fileName);
}

export function readJsonArray<T>(fileName: string, fallback: T[]): T[] {
  const filePath = resolveStoragePath(fileName);
  if (!fs.existsSync(filePath)) {
    writeJsonArray(fileName, fallback);
    return fallback;
  }

  try {
    const raw = fs.readFileSync(filePath, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed as T[] : fallback;
  } catch (error) {
    console.error(`[storage] Failed reading ${fileName}`, error);
    return fallback;
  }
}

export function writeJsonArray<T>(fileName: string, rows: T[]) {
  const filePath = resolveStoragePath(fileName);
  const tempPath = `${filePath}.${process.pid}.${crypto.randomBytes(4).toString("hex")}.tmp`;
  fs.writeFileSync(tempPath, JSON.stringify(rows, null, 2), "utf8");
  fs.renameSync(tempPath, filePath);
}

