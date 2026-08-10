import { DispatchStatus, OrderStatus, Visibility } from "../constants/enums";
import {
  addTimelineEvent,
  getOrderByCode,
  getOrders,
  updateOrder,
} from "../orders/orderService";
import {
  logZaloAdminCommand,
  logZaloCustomerReply,
  sendCustomerZaloConfirmation,
  sendCustomerZaloQuote,
  sendCustomerZaloVehicleInfo,
} from "../notification/notificationService";
import type { Order } from "../types";
import { parseZaloAdminCommand, parseZaloCustomerConfirmation } from "./adminCommandParser";

function formatMoney(value?: number) {
  return value ? `${value.toLocaleString("vi-VN")}d` : "chua co gia";
}

function requireOrder(orderCode?: string) {
  if (!orderCode) return null;
  return getOrderByCode(orderCode);
}

function appendInternalNote(order: Order, note: string) {
  return [order.internalNotes, `[${new Date().toLocaleString("vi-VN")}] Zalo: ${note}`].filter(Boolean).join("\n");
}

function orderSummary(order: Order) {
  return [
    `${order.orderCode} - ${order.status}`,
    `${order.pickupProvince} -> ${order.deliveryProvince}`,
    `Khach: ${order.senderName} - ${order.senderPhone}`,
    `Lay: ${order.pickupAddress}`,
    `Giao: ${order.deliveryAddress}`,
    `Hang: ${order.itemType}${order.itemDescription ? ` - ${order.itemDescription}` : ""}`,
    `Gia web: ${formatMoney(order.quotedPrice)}`,
    `Gia chot: ${formatMoney(order.finalPrice)}`,
    `Ghi chu: ${order.internalNotes || "khong co"}`,
  ].join("\n");
}

function listNewOrders() {
  const orders = getOrders()
    .filter((order) => [OrderStatus.NEW, OrderStatus.PENDING_CONFIRMATION, OrderStatus.QUOTED].includes(order.status))
    .slice(0, 10);
  if (!orders.length) return "Khong co lead moi can xu ly.";
  return orders
    .map((order, index) => [
      `${index + 1}. ${order.orderCode}`,
      `${order.pickupProvince} -> ${order.deliveryProvince}`,
      `${order.senderPhone} | ${formatMoney(order.finalPrice || order.quotedPrice)}`,
      `Lenh: CT ${order.orderCode}`,
    ].join("\n"))
    .join("\n\n");
}

export function getZaloAdminHelp() {
  return [
    "Lenh Zalo admin Chuyen Phat 24H:",
    "MOI - xem lead moi",
    "CT <ma_don> - xem chi tiet",
    "GIA <ma_don> <gia> <lich_lay> - gui bao gia/lich lay cho khach",
    "OK <ma_don> - danh dau khach da xac nhan",
    "XE <ma_don> <thong_tin_xe> - gui thong tin xe van chuyen cho khach",
    "NOTE <ma_don> <ghi_chu> - them ghi chu noi bo",
    "HUY <ma_don> <ly_do> - huy don",
  ].join("\n");
}

export async function handleZaloAdminCommand(commandText: string, actor = "zalo-admin") {
  const parsed = parseZaloAdminCommand(commandText);
  let responseMessage = parsed.responseMessage;
  let order: Order | null = null;

  if (parsed.intent === "HELP") {
    responseMessage = getZaloAdminHelp();
  } else if (parsed.intent === "LIST_NEW") {
    responseMessage = listNewOrders();
  } else {
    order = requireOrder(parsed.orderCode);
    if (!order) {
      responseMessage = `Khong tim thay don. Gui MOI de xem lead moi hoac CT <ma_don>.`;
      logZaloAdminCommand(parsed.orderCode, commandText, responseMessage, "FAILED");
      return { ok: false, parsed, responseMessage };
    }
  }

  if (order && parsed.intent === "DETAILS") {
    responseMessage = orderSummary(order);
  }

  if (order && parsed.intent === "QUOTE") {
    if (!parsed.price || parsed.price <= 0) {
      responseMessage = `Thieu gia. Cu phap: GIA ${order.orderCode} 250000 14h hom nay`;
      logZaloAdminCommand(order.orderCode, commandText, responseMessage, "FAILED");
      return { ok: false, parsed, responseMessage };
    }
    const pickupSchedule = parsed.payloadText || order.expectedPickupTime || "Dieu hanh se lien he xac nhan";
    const updated = updateOrder(order.id, {
      finalPrice: parsed.price,
      quotedPrice: parsed.price,
      expectedPickupTime: pickupSchedule,
      status: OrderStatus.QUOTED,
      customerTrackingNote: `Da bao gia ${formatMoney(parsed.price)}. Cho khach xac nhan gui hang qua Zalo.`,
      internalNotes: appendInternalNote(order, `Da bao gia ${formatMoney(parsed.price)} - lich lay: ${pickupSchedule}`),
    }, { source: "ZALO_ADMIN", actor, reason: pickupSchedule, action: "ORDER_QUOTED" });
    if (updated) {
      addTimelineEvent(order.id, {
        eventType: "ORDER_QUOTED",
        title: "Da gui bao gia qua Zalo",
        description: `Gia ${formatMoney(parsed.price)}. Lich lay: ${pickupSchedule}.`,
        visibility: Visibility.PUBLIC_CUSTOMER,
        createdBy: actor,
      });
      await sendCustomerZaloQuote(updated, pickupSchedule);
      responseMessage = `Da gui bao gia cho khach: ${updated.orderCode} - ${formatMoney(parsed.price)} - ${pickupSchedule}`;
    }
  }

  if (order && parsed.intent === "MARK_CONFIRMED") {
    const updated = updateOrder(order.id, {
      status: OrderStatus.CUSTOMER_CONFIRMED,
      dispatchStatus: DispatchStatus.READY_TO_DISPATCH,
      customerTrackingNote: "Khach da xac nhan gui hang. Dieu hanh dang sap xep xe.",
      internalNotes: appendInternalNote(order, "Khach da xac nhan gui hang."),
    }, { source: "ZALO_ADMIN", actor, action: "CUSTOMER_CONFIRMATION_RECORDED" });
    if (updated) {
      addTimelineEvent(order.id, {
        eventType: "CUSTOMER_CONFIRMED",
        title: "Khach da xac nhan gui hang",
        description: "Xac nhan ghi nhan qua Zalo/admin.",
        visibility: Visibility.PUBLIC_CUSTOMER,
        createdBy: actor,
      });
      await sendCustomerZaloConfirmation(updated);
      responseMessage = `Da danh dau khach xac nhan: ${updated.orderCode}. Tiep theo gui: XE ${updated.orderCode} <thong_tin_xe>`;
    }
  }

  if (order && parsed.intent === "SEND_VEHICLE") {
    const vehicleInfo = parsed.payloadText || "Thong tin xe dang cap nhat";
    const updated = updateOrder(order.id, {
      status: OrderStatus.DRIVER_ASSIGNED,
      dispatchStatus: DispatchStatus.DRIVER_ASSIGNED,
      assignedDriverVisibleToCustomer: true,
      assignedDriverName: "Xe dieu phoi ben ngoai",
      assignedVehicleType: vehicleInfo,
      customerTrackingNote: `Da gui thong tin xe van chuyen qua Zalo: ${vehicleInfo}`,
      internalNotes: appendInternalNote(order, `Da gui thong tin xe: ${vehicleInfo}`),
    }, { source: "ZALO_ADMIN", actor, reason: vehicleInfo, action: "VEHICLE_ASSIGNED" });
    if (updated) {
      addTimelineEvent(order.id, {
        eventType: "VEHICLE_ASSIGNED",
        title: "Da gui thong tin xe van chuyen",
        description: vehicleInfo,
        visibility: Visibility.PUBLIC_CUSTOMER,
        createdBy: actor,
      });
      await sendCustomerZaloVehicleInfo(updated, vehicleInfo);
      responseMessage = `Da gui thong tin xe cho khach: ${updated.orderCode}`;
    }
  }

  if (order && parsed.intent === "NOTE") {
    const note = parsed.payloadText || "Ghi chu tu Zalo";
    updateOrder(order.id, { internalNotes: appendInternalNote(order, note) }, { source: "ZALO_ADMIN", actor, reason: note, action: "INTERNAL_NOTE_ADDED" });
    addTimelineEvent(order.id, {
      eventType: "INTERNAL_NOTE",
      title: "Them ghi chu noi bo",
      description: note,
      visibility: Visibility.ADMIN_ONLY,
      createdBy: actor,
    });
    responseMessage = `Da them ghi chu cho ${order.orderCode}.`;
  }

  if (order && parsed.intent === "CANCEL") {
    const reason = parsed.payloadText || "Khach/quan tri huy don";
    const updated = updateOrder(order.id, {
      status: OrderStatus.CANCELLED,
      dispatchStatus: DispatchStatus.CANCELLED,
      customerTrackingNote: `Don da huy. Ly do: ${reason}`,
      internalNotes: appendInternalNote(order, `Huy don: ${reason}`),
    }, { source: "ZALO_ADMIN", actor, reason, action: "ORDER_CANCELLED" });
    if (updated) {
      addTimelineEvent(order.id, {
        eventType: "CANCELLED",
        title: "Don da huy",
        description: reason,
        visibility: Visibility.PUBLIC_CUSTOMER,
        createdBy: actor,
      });
      responseMessage = `Da huy don ${updated.orderCode}.`;
    }
  }

  const ok = parsed.intent !== "UNKNOWN";
  if (parsed.intent === "UNKNOWN") responseMessage = getZaloAdminHelp();
  logZaloAdminCommand(parsed.orderCode, commandText, responseMessage, ok ? "MOCK_SENT" : "FAILED");
  return { ok, parsed, responseMessage, order: parsed.orderCode ? getOrderByCode(parsed.orderCode) : undefined };
}

export async function handleZaloCustomerReply(commandText: string, sender: string) {
  const parsed = parseZaloCustomerConfirmation(commandText);
  if (!parsed.confirmed || !parsed.orderCode) {
    const responseMessage = "Tin nhan khach chua phai xac nhan don hoac thieu ma don.";
    logZaloCustomerReply(parsed.orderCode, sender, commandText, responseMessage, "FAILED");
    return { ok: false, responseMessage, parsed };
  }

  const order = getOrderByCode(parsed.orderCode);
  if (!order) {
    const responseMessage = "Khong tim thay don khach xac nhan.";
    logZaloCustomerReply(parsed.orderCode, sender, commandText, responseMessage, "FAILED");
    return { ok: false, responseMessage, parsed };
  }

  const expectedSender = order.customerZaloUserId || order.senderPhone;
  if (sender !== expectedSender) {
    const responseMessage = "Nguoi gui Zalo khong khop voi khach hang cua don.";
    logZaloCustomerReply(parsed.orderCode, sender, commandText, responseMessage, "FAILED");
    return { ok: false, responseMessage, parsed };
  }

  const updated = updateOrder(order.id, {
    status: OrderStatus.CUSTOMER_CONFIRMED,
    dispatchStatus: DispatchStatus.READY_TO_DISPATCH,
    customerTrackingNote: "Khach da xac nhan gui hang qua Zalo. Dieu hanh dang sap xep xe.",
    internalNotes: appendInternalNote(order, `Khach ${sender} xac nhan qua Zalo: ${commandText}`),
  }, { source: "ZALO_CUSTOMER", actor: sender, reason: commandText, action: "CUSTOMER_CONFIRMED" });
  if (updated) {
    addTimelineEvent(order.id, {
      eventType: "CUSTOMER_CONFIRMED",
      title: "Khach da xac nhan gui hang qua Zalo",
      description: commandText,
      visibility: Visibility.PUBLIC_CUSTOMER,
      createdBy: "zalo-customer",
    });
    await sendCustomerZaloConfirmation(updated);
  }
  const responseMessage = `Da ghi nhan khach xac nhan don ${parsed.orderCode}.`;
  logZaloCustomerReply(parsed.orderCode, sender, commandText, responseMessage);
  return { ok: true, responseMessage, parsed, order: updated };
}
