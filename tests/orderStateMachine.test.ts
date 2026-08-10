import assert from "node:assert/strict";
import test from "node:test";
import { OrderStatus } from "../src/lib/constants/enums";
import { mockOrders } from "../src/data/mockOrders";
import { buildOrderAuditChanges } from "../src/lib/audit/orderAuditService";
import { assertOrderTransition, assertTerminalOrderMutation, canTransitionOrder, getAllowedOrderTransitions, OrderTransitionError } from "../src/lib/orders/orderStateMachine";

test("order state machine allows normal forward transitions", () => {
  assert.equal(canTransitionOrder(OrderStatus.PENDING_CONFIRMATION, OrderStatus.QUOTED), true);
  assert.equal(canTransitionOrder(OrderStatus.DRIVER_ASSIGNED, OrderStatus.PICKUP_IN_PROGRESS), true);
  assert.doesNotThrow(() => assertOrderTransition(OrderStatus.IN_TRANSIT, OrderStatus.DELIVERED));
});

test("terminal orders cannot move backwards", () => {
  assert.deepEqual(getAllowedOrderTransitions(OrderStatus.DELIVERED), []);
  assert.deepEqual(getAllowedOrderTransitions(OrderStatus.CANCELLED), []);
  assert.throws(
    () => assertOrderTransition(OrderStatus.DELIVERED, OrderStatus.IN_TRANSIT),
    (error: unknown) => error instanceof OrderTransitionError && error.statusCode === 409,
  );
  assert.throws(() => assertTerminalOrderMutation(OrderStatus.CANCELLED, ["finalPrice"]), /Terminal order/);
  assert.doesNotThrow(() => assertTerminalOrderMutation(OrderStatus.CANCELLED, ["internalNotes"]));
});

test("audit diff records business changes and ignores timeline metadata", () => {
  const before = mockOrders[0];
  const after = {
    ...before,
    finalPrice: (before.finalPrice || 0) + 12345,
    status: OrderStatus.CUSTOMER_CONFIRMED,
    updatedAt: new Date(Date.now() + 1000).toISOString(),
    timeline: [...before.timeline],
  };
  const changes = buildOrderAuditChanges(before, after);
  assert.deepEqual(changes.map((change) => change.field).sort(), ["finalPrice", "status"]);
});
