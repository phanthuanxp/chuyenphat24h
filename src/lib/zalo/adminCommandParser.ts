export type ZaloAdminIntent = "HELP" | "LIST_NEW" | "DETAILS" | "QUOTE" | "MARK_CONFIRMED" | "SEND_VEHICLE" | "NOTE" | "CANCEL" | "UNKNOWN";

export interface ParsedZaloAdminCommand {
  intent: ZaloAdminIntent;
  orderCode?: string;
  price?: number;
  payloadText?: string;
  normalizedCommand: string;
  responseMessage: string;
}

function stripVietnamese(text: string) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");
}

export function normalizeZaloCommand(commandText: string) {
  return stripVietnamese(commandText).trim().replace(/\s+/g, " ");
}

function findOrderCode(text: string) {
  return text.toUpperCase().match(/CP24H-[0-9A-Z-]+/)?.[0];
}

export function parseZaloAdminCommand(commandText: string): ParsedZaloAdminCommand {
  const normalizedCommand = normalizeZaloCommand(commandText);
  const upper = normalizedCommand.toUpperCase();
  const parts = normalizedCommand.split(" ");
  const command = parts[0]?.toUpperCase() || "";
  const orderCode = findOrderCode(normalizedCommand);

  if (!command || ["HELP", "HUONGDAN", "HD", "?"].includes(command)) {
    return {
      intent: "HELP",
      normalizedCommand,
      responseMessage: [
        "Lenh Zalo admin:",
        "MOI - xem lead moi",
        "CT <ma_don> - xem chi tiet",
        "GIA <ma_don> <gia> <lich_lay> - gui bao gia cho khach",
        "OK <ma_don> - danh dau khach da xac nhan",
        "XE <ma_don> <thong_tin_xe> - gui thong tin xe cho khach",
        "NOTE <ma_don> <ghi_chu> - them ghi chu noi bo",
        "HUY <ma_don> <ly_do> - huy don",
      ].join("\n"),
    };
  }

  if (["MOI", "NEW", "LEAD"].includes(command)) {
    return { intent: "LIST_NEW", normalizedCommand, responseMessage: "Danh sach lead moi." };
  }

  if (["CT", "CHITIET", "DETAIL"].includes(command)) {
    return { intent: "DETAILS", orderCode, normalizedCommand, responseMessage: "Chi tiet don." };
  }

  if (["GIA", "BAOGIA", "QUOTE"].includes(command)) {
    const priceToken = parts.find((part, index) => index > 1 && /^\d+([.,]\d+)?$/.test(part.replace(/[,.]/g, "")));
    const price = priceToken ? Number(priceToken.replace(/[,.]/g, "")) : undefined;
    const priceIndex = priceToken ? parts.indexOf(priceToken) : -1;
    const payloadText = priceIndex >= 0 ? parts.slice(priceIndex + 1).join(" ").trim() : parts.slice(2).join(" ").trim();
    return { intent: "QUOTE", orderCode, price, payloadText, normalizedCommand, responseMessage: "Gui bao gia cho khach." };
  }

  if (["OK", "XACNHAN", "DONGY"].includes(command)) {
    return { intent: "MARK_CONFIRMED", orderCode, normalizedCommand, responseMessage: "Danh dau khach da xac nhan." };
  }

  if (["XE", "THONGTINXE", "GUIXE"].includes(command)) {
    const payloadText = orderCode ? normalizedCommand.slice(normalizedCommand.toUpperCase().indexOf(orderCode) + orderCode.length).trim() : parts.slice(1).join(" ").trim();
    return { intent: "SEND_VEHICLE", orderCode, payloadText, normalizedCommand, responseMessage: "Gui thong tin xe cho khach." };
  }

  if (["NOTE", "GHICHU"].includes(command)) {
    const payloadText = orderCode ? normalizedCommand.slice(normalizedCommand.toUpperCase().indexOf(orderCode) + orderCode.length).trim() : parts.slice(1).join(" ").trim();
    return { intent: "NOTE", orderCode, payloadText, normalizedCommand, responseMessage: "Them ghi chu noi bo." };
  }

  if (["HUY", "CANCEL"].includes(command)) {
    const payloadText = orderCode ? normalizedCommand.slice(normalizedCommand.toUpperCase().indexOf(orderCode) + orderCode.length).trim() : parts.slice(1).join(" ").trim();
    return { intent: "CANCEL", orderCode, payloadText, normalizedCommand, responseMessage: "Huy don." };
  }

  return {
    intent: "UNKNOWN",
    orderCode,
    normalizedCommand,
    responseMessage: "Cu phap chua dung. Gui HELP de xem huong dan lenh.",
  };
}

export function parseZaloCustomerConfirmation(commandText: string) {
  const normalized = normalizeZaloCommand(commandText);
  const upper = normalized.toUpperCase();
  const orderCode = findOrderCode(normalized);
  const confirmed = /(^|\s)(DONG Y|DONGY|OK|XAC NHAN|XACNHAN)(\s|$)/.test(upper);
  return { confirmed, orderCode, normalizedCommand: normalized };
}
