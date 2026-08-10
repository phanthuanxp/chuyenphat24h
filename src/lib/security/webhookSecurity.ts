import crypto from "node:crypto";

export function safeSecretMatches(expected: string | undefined, received: string) {
  if (!expected || !received) return false;
  const expectedBuffer = Buffer.from(expected);
  const receivedBuffer = Buffer.from(received);
  return expectedBuffer.length === receivedBuffer.length && crypto.timingSafeEqual(expectedBuffer, receivedBuffer);
}

export function isTrustedZaloAdmin(sender: string, configuredIds: string | undefined) {
  if (!sender) return false;
  const ids = String(configuredIds || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  return ids.includes(sender);
}

export function validateProductionConfiguration(env: NodeJS.ProcessEnv) {
  if (env.NODE_ENV !== "production") return;

  const problems: string[] = [];
  if (!env.ADMIN_PASSWORD || env.ADMIN_PASSWORD === "change-me-now") problems.push("ADMIN_PASSWORD must be changed");
  if (!env.ADMIN_SESSION_SECRET || env.ADMIN_SESSION_SECRET.length < 32) problems.push("ADMIN_SESSION_SECRET must contain at least 32 characters");
  if (!env.ZALO_WEBHOOK_SECRET) problems.push("ZALO_WEBHOOK_SECRET is required");
  if (!env.TELEGRAM_WEBHOOK_SECRET) problems.push("TELEGRAM_WEBHOOK_SECRET is required");
  if ((env.ZALO_NOTIFY_MODE || "mock") === "live") {
    if (!env.ZALO_SEND_MESSAGE_ENDPOINT) problems.push("ZALO_SEND_MESSAGE_ENDPOINT is required in live mode");
    if (!env.ZALO_ACCESS_TOKEN) problems.push("ZALO_ACCESS_TOKEN is required in live mode");
    if (!env.ZALO_ADMIN_USER_IDS && !env.ZALO_ADMIN_USER_ID) problems.push("ZALO_ADMIN_USER_IDS is required in live mode");
  }

  if (problems.length) throw new Error(`Unsafe production configuration: ${problems.join("; ")}`);
}
