import crypto from "node:crypto";
import type { AuditSource, Order, OrderAuditChange, OrderAuditLog } from "../types";
import { readJsonArray, writeJsonArray } from "../storage/jsonStore";
import { loadPersistentCollection, persistCollection } from "../storage/persistentStore";

export interface OrderAuditContext {
  source: AuditSource;
  actor: string;
  action?: string;
  reason?: string;
}

let auditLogs = readJsonArray<OrderAuditLog>("orderAuditLogs.json", []);
const ignoredFields = new Set<keyof Order>(["timeline", "updatedAt"]);

function persistAuditLogs() {
  writeJsonArray("orderAuditLogs.json", auditLogs);
  persistCollection("orderAuditLogs", auditLogs);
}

export async function hydrateOrderAuditStorage() {
  auditLogs = await loadPersistentCollection<OrderAuditLog>("orderAuditLogs", auditLogs);
  persistAuditLogs();
}

export function getOrderAuditLogs(orderId?: string) {
  return orderId ? auditLogs.filter((log) => log.orderId === orderId) : auditLogs;
}

function sameValue(before: unknown, after: unknown) {
  return JSON.stringify(before) === JSON.stringify(after);
}

export function buildOrderAuditChanges(before: Order, after: Order): OrderAuditChange[] {
  return (Object.keys(after) as Array<keyof Order>)
    .filter((field) => !ignoredFields.has(field) && !sameValue(before[field], after[field]))
    .map((field) => ({ field, before: before[field], after: after[field] }));
}

export function recordOrderAudit(before: Order, after: Order, context: OrderAuditContext) {
  const changes = buildOrderAuditChanges(before, after);
  if (!changes.length) return null;
  const log: OrderAuditLog = {
    id: `AUD-${Date.now()}-${crypto.randomBytes(3).toString("hex")}`,
    orderId: after.id,
    orderCode: after.orderCode,
    action: context.action || (changes.some((change) => change.field === "status") ? "ORDER_STATUS_CHANGED" : "ORDER_UPDATED"),
    source: context.source,
    actor: context.actor,
    reason: context.reason,
    changes,
    createdAt: new Date().toISOString(),
  };
  auditLogs = [log, ...auditLogs];
  persistAuditLogs();
  return log;
}

export function recordOrderCreated(order: Order) {
  const log: OrderAuditLog = {
    id: `AUD-${Date.now()}-${crypto.randomBytes(3).toString("hex")}`,
    orderId: order.id,
    orderCode: order.orderCode,
    action: "ORDER_CREATED",
    source: "SYSTEM",
    actor: "system",
    changes: [{ field: "status", after: order.status }, { field: "source", after: order.source }],
    createdAt: new Date().toISOString(),
  };
  auditLogs = [log, ...auditLogs];
  persistAuditLogs();
  return log;
}
