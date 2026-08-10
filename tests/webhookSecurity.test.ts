import assert from "node:assert/strict";
import test from "node:test";
import { isTrustedZaloAdmin, safeSecretMatches, validateProductionConfiguration } from "../src/lib/security/webhookSecurity";

test("webhook secrets are mandatory and compared exactly", () => {
  assert.equal(safeSecretMatches(undefined, "anything"), false);
  assert.equal(safeSecretMatches("secret", "secret"), true);
  assert.equal(safeSecretMatches("secret", "wrong"), false);
});

test("request supplied roles cannot make a sender an admin", () => {
  assert.equal(isTrustedZaloAdmin("outsider", "admin-1,admin-2"), false);
  assert.equal(isTrustedZaloAdmin("admin-2", "admin-1,admin-2"), true);
});

test("unsafe production configuration fails fast", () => {
  assert.throws(() => validateProductionConfiguration({ NODE_ENV: "production" }), /Unsafe production configuration/);
  assert.doesNotThrow(() => validateProductionConfiguration({
    NODE_ENV: "production",
    ADMIN_PASSWORD: "a-production-password",
    ADMIN_SESSION_SECRET: "a-long-production-session-secret-123456",
    ZALO_WEBHOOK_SECRET: "zalo-secret",
    TELEGRAM_WEBHOOK_SECRET: "telegram-secret",
    ZALO_NOTIFY_MODE: "mock",
  }));
});
