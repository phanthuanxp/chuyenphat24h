import { useState } from "react";
import { ArrowRight, CheckCircle2, MapPin, Package, Phone, Send, Sparkles, type LucideIcon } from "lucide-react";
import type { InputHTMLAttributes } from "react";
import { ITEM_TYPE_LABELS, ItemType } from "../lib/constants/enums";
import type { Order, RouteEstimate } from "../lib/types";

const itemTypes = [ItemType.DOCUMENT, ItemType.SMALL_PACKAGE, ItemType.SHOP_GOODS, ItemType.ELECTRONICS, ItemType.FRAGILE, ItemType.MOTORBIKE, ItemType.TV_FRIDGE_WASHER, ItemType.BULKY];

/**
 * Homepage conversion form. It intentionally asks only for the information an
 * operator needs to call back and quote quickly; the full shipment details are
 * collected after the customer accepts the quote.
 */
export function FastQuoteForm() {
  const [phone, setPhone] = useState("");
  const [pickupAddress, setPickupAddress] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [itemType, setItemType] = useState<ItemType>(ItemType.SMALL_PACKAGE);
  const [estimate, setEstimate] = useState<RouteEstimate | null>(null);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const payload = {
    customerPhone: phone.trim(),
    pickupAddress: pickupAddress.trim(),
    deliveryAddress: deliveryAddress.trim(),
    itemType,
    expectedDeliveryTime: "Càng sớm càng tốt",
    packageCount: 1,
    weight: 1,
  };

  async function submit() {
    if (!payload.customerPhone || !payload.pickupAddress || !payload.deliveryAddress) {
      setError("Vui lòng nhập số điện thoại, điểm lấy và điểm giao hàng.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const [estimateResponse, orderResponse] = await Promise.all([
        fetch("/api/orders/estimate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }),
        fetch("/api/orders/quick-create", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }),
      ]);
      if (!orderResponse.ok) {
        const data = await orderResponse.json().catch(() => null);
        throw new Error(data?.message || "Chưa thể gửi yêu cầu. Anh/chị vui lòng gọi hotline.");
      }
      setOrder(await orderResponse.json());
      if (estimateResponse.ok) setEstimate(await estimateResponse.json());
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Có lỗi xảy ra, vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }

  if (order) {
    const price = order.quotedPrice ? `${order.quotedPrice.toLocaleString("vi-VN")}đ` : "Điều hành sẽ báo giá ngay";
    return (
      <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-5 text-center">
        <CheckCircle2 className="mx-auto h-9 w-9 text-emerald-600" />
        <h3 className="mt-3 text-xl font-extrabold text-emerald-900">Đã nhận yêu cầu báo giá</h3>
        <p className="mt-2 text-sm font-semibold leading-6 text-emerald-900/80">Mã yêu cầu: <strong>{order.orderCode}</strong></p>
        <div className="mt-4 rounded-lg border border-emerald-200 bg-white px-3 py-3 text-left">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{estimate?.routeName || "Tuyến đang kiểm tra"}</p>
          <p className="mt-1 text-lg font-extrabold text-brand-navy-900">{price}</p>
          <p className="mt-1 text-xs leading-5 text-slate-600">Giá hiển thị là tham khảo. Điều hành sẽ gọi/Zalo xác nhận cước và thời gian lấy hàng.</p>
        </div>
        <p className="mt-4 text-sm font-semibold text-slate-700">Điều hành sẽ liên hệ trong khoảng 5 phút.</p>
        <button type="button" onClick={() => { setOrder(null); setEstimate(null); }} className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-brand-orange-700 hover:text-brand-orange-600">
          Tạo yêu cầu khác <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-white/60 bg-white p-5 text-[var(--text-primary)] shadow-[var(--shadow-lg)] sm:p-6">
      <div className="mb-4 flex items-center gap-3">
        <Sparkles className="h-6 w-6 text-brand-orange-500" />
        <div>
          <h3 className="m-0 text-[21px] font-bold text-brand-navy-900">Nhận báo giá nhanh</h3>
          <p className="mt-0.5 text-xs font-medium text-slate-500">Điều hành liên hệ trong khoảng 5 phút</p>
        </div>
      </div>
      <div className="grid gap-3">
        <FormInput icon={Phone} type="tel" value={phone} onChange={setPhone} placeholder="Số điện thoại/Zalo của bạn *" autoComplete="tel" />
        <FormInput icon={MapPin} value={pickupAddress} onChange={setPickupAddress} placeholder="Lấy hàng tại (địa chỉ hoặc tỉnh) *" />
        <FormInput icon={MapPin} value={deliveryAddress} onChange={setDeliveryAddress} placeholder="Giao đến (địa chỉ hoặc tỉnh) *" />
        <label className="relative block">
          <Package className="pointer-events-none absolute left-3.5 top-4 h-[18px] w-[18px] text-brand-orange-500" />
          <select value={itemType} onChange={(event) => setItemType(event.target.value as ItemType)} className="h-12 w-full appearance-none rounded-lg border border-[var(--border-default)] bg-white px-11 text-sm text-[var(--text-primary)] outline-none transition focus:border-brand-orange-500">
            {itemTypes.map((type) => <option key={type} value={type}>{ITEM_TYPE_LABELS[type]}</option>)}
          </select>
        </label>
      </div>
      {error && <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold leading-5 text-red-700">{error}</p>}
      <button type="button" onClick={submit} disabled={loading} className="mt-4 flex min-h-[52px] w-full items-center justify-center gap-2 rounded-lg bg-brand-orange-500 text-base font-bold text-brand-navy-900 shadow-[var(--shadow-sm)] transition hover:bg-brand-orange-600 disabled:cursor-not-allowed disabled:opacity-60">
        {loading ? "Đang gửi yêu cầu..." : <><Send className="h-5 w-5" /> Nhận báo giá & đặt lịch lấy</>}
      </button>
      <p className="mt-3 text-center text-[12px] leading-5 text-[var(--text-muted)]">Không cần thanh toán trước. Giá chính thức được xác nhận trước khi nhận hàng.</p>
    </div>
  );
}

function FormInput({ icon: Icon, value, onChange, ...props }: InputHTMLAttributes<HTMLInputElement> & { icon: LucideIcon; value: string; onChange: (value: string) => void }) {
  return <label className="relative block"><Icon className="pointer-events-none absolute left-3.5 top-4 h-[18px] w-[18px] text-brand-orange-500" /><input {...props} value={value} onChange={(event) => onChange(event.target.value)} className="h-12 w-full rounded-lg border border-[var(--border-default)] bg-white px-11 text-sm text-[var(--text-primary)] outline-none transition placeholder:text-[var(--text-muted)] focus:border-brand-orange-500" /></label>;
}
