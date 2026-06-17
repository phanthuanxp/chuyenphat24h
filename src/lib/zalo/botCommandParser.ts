export type BotIntent = "CLAIM_ORDER" | "PICKED_UP" | "IN_TRANSIT" | "DELIVERED" | "ISSUE_REPORTED" | "DETAILS" | "UNKNOWN";

export interface ParsedDriverCommand {
  intent: BotIntent;
  orderCode?: string;
  confidence: number;
  normalizedCommand: string;
  responseMessage: string;
}

function normalizeCommand(command: string) {
  return command
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .trim()
    .replace(/\s+/g, " ")
    .toUpperCase();
}

export function parseDriverCommand(commandText: string): ParsedDriverCommand {
  const normalizedCommand = normalizeCommand(commandText);
  const orderCode = normalizedCommand.match(/CP24H-[0-9A-Z-]+/)?.[0];
  const starts = (value: string) => normalizedCommand.startsWith(value);
  let intent: BotIntent = "UNKNOWN";

  if (starts("NHAN DON") || starts("NHAN ")) intent = "CLAIM_ORDER";
  else if (starts("DA LAY")) intent = "PICKED_UP";
  else if (starts("DANG DI")) intent = "IN_TRANSIT";
  else if (starts("DA GIAO")) intent = "DELIVERED";
  else if (starts("SU CO")) intent = "ISSUE_REPORTED";
  else if (starts("CT") || starts("CHI TIET")) intent = "DETAILS";

  const confidence = intent !== "UNKNOWN" && orderCode ? 0.95 : intent !== "UNKNOWN" ? 0.65 : 0.1;
  return {
    intent,
    orderCode,
    confidence,
    normalizedCommand,
    responseMessage:
      intent === "UNKNOWN"
        ? "Cu phap chua dung. Vi du: NHAN CP24H-xxxx"
        : `Da ghi nhan lenh ${intent}${orderCode ? ` cho don ${orderCode}` : ""}.`,
  };
}

export function claimOrderByDriver(commandText: string) {
  return parseDriverCommand(commandText);
}

export function updateOrderFromBotCommand(commandText: string) {
  return parseDriverCommand(commandText);
}

export function generateBotReply(commandText: string) {
  return parseDriverCommand(commandText).responseMessage;
}

