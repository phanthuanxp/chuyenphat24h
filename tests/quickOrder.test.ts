import assert from "node:assert/strict";
import test from "node:test";
import { ItemType } from "../src/lib/constants/enums";
import { generateOrderCode, validateQuickOrderPayload } from "../src/lib/orders/quickOrderService";

const validPayload = {
  pickupAddress: "Cau Giay, Ha Noi",
  deliveryAddress: "Hai Phong",
  itemType: ItemType.DOCUMENT,
  expectedDeliveryTime: "Trong ngay",
  customerPhone: "0912345678",
  receiverPhone: "0987654321",
};

test("quick order validation accepts separate sender and receiver phones", () => {
  assert.deepEqual(validateQuickOrderPayload(validPayload), { valid: true, missing: [], errors: [] });
});

test("quick order validation rejects unsafe images and invalid phones", () => {
  const result = validateQuickOrderPayload({
    ...validPayload,
    receiverPhone: "not-a-phone",
    itemImages: ["data:text/html;base64,PHNjcmlwdD4="],
  });
  assert.equal(result.valid, false);
  assert.ok(result.errors.includes("receiverPhone is invalid"));
  assert.ok(result.errors.includes("itemImages contains an unsupported image type"));
});

test("generated order codes preserve the public prefix and avoid known codes", () => {
  const first = generateOrderCode(new Set());
  const second = generateOrderCode(new Set([first]));
  assert.match(first, /^CP24H-\d{8}-[0-9A-F]{8}$/);
  assert.notEqual(second, first);
});
