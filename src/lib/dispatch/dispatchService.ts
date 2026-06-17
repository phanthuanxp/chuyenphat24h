import { DispatchStatus, OrderStatus } from "../constants/enums";
import type { AIDispatchLog, Order } from "../types";
import { generateDriverBroadcastMessage, suggestZaloGroups } from "./aiDispatchService";

let dispatchLogs: AIDispatchLog[] = [];

export function prepareOrderForDispatch(order: Order) {
  const groups = suggestZaloGroups(order);
  const message = generateDriverBroadcastMessage(order);
  return { groups, message };
}

export function selectZaloGroupsForOrder(order: Order) {
  return suggestZaloGroups(order);
}

export function generateDispatchMessage(order: Order) {
  return generateDriverBroadcastMessage(order);
}

export function sendOrderToZaloGroups(order: Order, sentBy: "AI_BOT" | "ADMIN" = "ADMIN") {
  const { groups, message } = prepareOrderForDispatch(order);
  const now = new Date().toISOString();
  const logs = groups.map<AIDispatchLog>((group) => ({
    id: `DL-${Date.now()}-${group.id}`,
    orderId: order.id,
    targetGroupId: group.id,
    targetGroupName: group.groupName,
    messageContent: message,
    sentAt: now,
    sentBy,
    sendStatus: "SENT",
    driverResponsesCount: 0,
    createdAt: now,
  }));
  dispatchLogs = [...logs, ...dispatchLogs];
  return {
    logs,
    updates: {
      status: OrderStatus.DISPATCHED_TO_ZALO,
      dispatchStatus: DispatchStatus.DISPATCHED_TO_ZALO,
      suggestedZaloGroups: groups.map((group) => group.id),
      assignedZaloGroupIds: groups.map((group) => group.id),
      dispatchedAt: now,
      dispatchMessage: message,
    },
  };
}

export function redispatchOrder(order: Order) {
  return sendOrderToZaloGroups(order, "ADMIN");
}

export function getDispatchLogs() {
  return dispatchLogs;
}

export function addDispatchPreviewLog(order: Order) {
  const { groups, message } = prepareOrderForDispatch(order);
  const now = new Date().toISOString();
  return groups.map<AIDispatchLog>((group) => ({
    id: `DLP-${Date.now()}-${group.id}`,
    orderId: order.id,
    targetGroupId: group.id,
    targetGroupName: group.groupName,
    messageContent: message,
    sentBy: "AI_BOT",
    sendStatus: "PREVIEW",
    driverResponsesCount: 0,
    createdAt: now,
  }));
}

