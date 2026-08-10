import assert from "node:assert/strict";
import crypto from "node:crypto";
import test from "node:test";
import { enqueueNotification, getNotificationJobs, processNotificationOutbox, retryNotificationJob } from "../src/lib/notification/notificationService";

test("outbox enqueue is idempotent and mock delivery reaches SENT", async () => {
  const message = `outbox-test-${crypto.randomUUID()}`;
  const first = enqueueNotification({
    channel: "TELEGRAM_ADMIN",
    eventType: "NEW_ORDER",
    orderId: crypto.randomUUID(),
    message,
  });
  const duplicate = enqueueNotification({
    channel: "TELEGRAM_ADMIN",
    eventType: "NEW_ORDER",
    orderId: first.orderId,
    message,
  });
  assert.equal(duplicate.id, first.id);

  await processNotificationOutbox({ maxJobs: 20 });
  assert.equal(getNotificationJobs().find((job) => job.id === first.id)?.status, "SENT");
});

test("unlinked live Zalo customer job reaches dead letter and can be retried", async () => {
  const previousMode = process.env.ZALO_NOTIFY_MODE;
  const previousEndpoint = process.env.ZALO_SEND_MESSAGE_ENDPOINT;
  const previousToken = process.env.ZALO_ACCESS_TOKEN;
  process.env.ZALO_NOTIFY_MODE = "live";
  process.env.ZALO_SEND_MESSAGE_ENDPOINT = "https://example.invalid/zalo";
  process.env.ZALO_ACCESS_TOKEN = "test-token";

  try {
    const job = enqueueNotification({
      channel: "ZALO_CUSTOMER",
      eventType: "ORDER_QUOTED",
      orderId: crypto.randomUUID(),
      fallbackRecipient: "0901234567",
      message: `zalo-dead-letter-${crypto.randomUUID()}`,
      maxAttempts: 1,
    });
    await processNotificationOutbox({ maxJobs: 20 });
    assert.equal(getNotificationJobs().find((item) => item.id === job.id)?.status, "DEAD_LETTER");
    assert.equal(retryNotificationJob(job.id)?.status, "QUEUED");
  } finally {
    if (previousMode === undefined) delete process.env.ZALO_NOTIFY_MODE; else process.env.ZALO_NOTIFY_MODE = previousMode;
    if (previousEndpoint === undefined) delete process.env.ZALO_SEND_MESSAGE_ENDPOINT; else process.env.ZALO_SEND_MESSAGE_ENDPOINT = previousEndpoint;
    if (previousToken === undefined) delete process.env.ZALO_ACCESS_TOKEN; else process.env.ZALO_ACCESS_TOKEN = previousToken;
  }
});
