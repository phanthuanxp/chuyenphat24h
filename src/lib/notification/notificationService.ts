export function notifyAdminNewOrder(orderCode: string) {
  return { success: true, channel: "mock", message: `New order ${orderCode}` };
}

export function notifyDispatchEvent(orderCode: string) {
  return { success: true, channel: "mock", message: `Dispatch event ${orderCode}` };
}

export function mockSendZaloGroupMessage(groupId: string, message: string) {
  return { success: true, groupId, message };
}

