import { OrderStatus } from "../constants/enums";

const transitions: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.NEW]: [OrderStatus.PENDING_CONFIRMATION, OrderStatus.QUOTED, OrderStatus.CANCELLED],
  [OrderStatus.PENDING_CONFIRMATION]: [OrderStatus.QUOTED, OrderStatus.CUSTOMER_CONFIRMED, OrderStatus.READY_TO_DISPATCH, OrderStatus.DISPATCHED_TO_ZALO, OrderStatus.DRIVER_ASSIGNED, OrderStatus.ISSUE_REPORTED, OrderStatus.CANCELLED],
  [OrderStatus.QUOTED]: [OrderStatus.CUSTOMER_CONFIRMED, OrderStatus.READY_TO_DISPATCH, OrderStatus.ISSUE_REPORTED, OrderStatus.CANCELLED],
  [OrderStatus.CUSTOMER_CONFIRMED]: [OrderStatus.READY_TO_DISPATCH, OrderStatus.DISPATCHED_TO_ZALO, OrderStatus.DRIVER_ASSIGNED, OrderStatus.ISSUE_REPORTED, OrderStatus.CANCELLED],
  [OrderStatus.READY_TO_DISPATCH]: [OrderStatus.DISPATCHED_TO_ZALO, OrderStatus.DRIVER_ASSIGNED, OrderStatus.ISSUE_REPORTED, OrderStatus.CANCELLED],
  [OrderStatus.DISPATCHED_TO_ZALO]: [OrderStatus.DRIVER_CLAIMED, OrderStatus.WAITING_ADMIN_APPROVAL, OrderStatus.DRIVER_ASSIGNED, OrderStatus.REDISPATCH_REQUIRED, OrderStatus.ISSUE_REPORTED, OrderStatus.CANCELLED],
  [OrderStatus.DRIVER_CLAIMED]: [OrderStatus.WAITING_ADMIN_APPROVAL, OrderStatus.DRIVER_ASSIGNED, OrderStatus.REDISPATCH_REQUIRED, OrderStatus.ISSUE_REPORTED, OrderStatus.CANCELLED],
  [OrderStatus.WAITING_ADMIN_APPROVAL]: [OrderStatus.DRIVER_ASSIGNED, OrderStatus.REDISPATCH_REQUIRED, OrderStatus.ISSUE_REPORTED, OrderStatus.CANCELLED],
  [OrderStatus.DRIVER_ASSIGNED]: [OrderStatus.PICKUP_IN_PROGRESS, OrderStatus.PICKED_UP, OrderStatus.IN_TRANSIT, OrderStatus.REDISPATCH_REQUIRED, OrderStatus.ISSUE_REPORTED, OrderStatus.CANCELLED],
  [OrderStatus.PICKUP_IN_PROGRESS]: [OrderStatus.PICKED_UP, OrderStatus.IN_TRANSIT, OrderStatus.ISSUE_REPORTED, OrderStatus.CANCELLED],
  [OrderStatus.PICKED_UP]: [OrderStatus.IN_TRANSIT, OrderStatus.ISSUE_REPORTED, OrderStatus.RETURNED],
  [OrderStatus.IN_TRANSIT]: [OrderStatus.ARRIVED_DESTINATION, OrderStatus.DELIVERY_IN_PROGRESS, OrderStatus.DELIVERED, OrderStatus.ISSUE_REPORTED, OrderStatus.RETURNED],
  [OrderStatus.ARRIVED_DESTINATION]: [OrderStatus.DELIVERY_IN_PROGRESS, OrderStatus.DELIVERED, OrderStatus.ISSUE_REPORTED, OrderStatus.RETURNED],
  [OrderStatus.DELIVERY_IN_PROGRESS]: [OrderStatus.DELIVERED, OrderStatus.ISSUE_REPORTED, OrderStatus.RETURNED],
  [OrderStatus.ISSUE_REPORTED]: [OrderStatus.REDISPATCH_REQUIRED, OrderStatus.RETURNED, OrderStatus.CANCELLED],
  [OrderStatus.REDISPATCH_REQUIRED]: [OrderStatus.READY_TO_DISPATCH, OrderStatus.DISPATCHED_TO_ZALO, OrderStatus.DRIVER_ASSIGNED, OrderStatus.ISSUE_REPORTED, OrderStatus.CANCELLED],
  [OrderStatus.DELIVERED]: [],
  [OrderStatus.CANCELLED]: [],
  [OrderStatus.RETURNED]: [],
};

export function getAllowedOrderTransitions(status: OrderStatus) {
  return transitions[status] || [];
}

export function canTransitionOrder(from: OrderStatus, to: OrderStatus) {
  return from === to || getAllowedOrderTransitions(from).includes(to);
}

export function isTerminalOrderStatus(status: OrderStatus) {
  return [OrderStatus.DELIVERED, OrderStatus.CANCELLED, OrderStatus.RETURNED].includes(status);
}

export class OrderTransitionError extends Error {
  statusCode = 409;

  constructor(from: OrderStatus, to: OrderStatus) {
    super(`Invalid order status transition: ${from} -> ${to}`);
  }
}

export function assertOrderTransition(from: OrderStatus, to: OrderStatus) {
  if (!canTransitionOrder(from, to)) throw new OrderTransitionError(from, to);
}

export function assertTerminalOrderMutation(status: OrderStatus, fields: string[]) {
  if (!isTerminalOrderStatus(status)) return;
  const allowedFields = new Set(["timeline", "internalNotes", "customerTrackingNote"]);
  const blockedFields = fields.filter((field) => field !== "status" && !allowedFields.has(field));
  if (blockedFields.length) {
    const error = new Error(`Terminal order ${status} cannot change fields: ${blockedFields.join(", ")}`) as Error & { statusCode: number };
    error.statusCode = 409;
    throw error;
  }
}
