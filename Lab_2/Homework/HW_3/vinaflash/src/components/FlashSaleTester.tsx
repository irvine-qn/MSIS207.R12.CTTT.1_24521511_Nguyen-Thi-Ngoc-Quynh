"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import type { ReservationLock } from "@/types/flashSale";
import { mockProducts } from "@/data/mockProducts";
import { createAntiDriftTimer } from "@/engine/antiDriftTimer";
import { createInventoryStateMachine } from "@/engine/inventoryStateMachine";
import { createMockPayment } from "@/engine/mockPaymentApi";
import FlashSaleCard, {
  formatCountdownMs,
  formatVnd,
  statusStyle,
} from "@/components/FlashSaleCard";
import HoldCountdown from "@/components/HoldCountdown";

const SALE_DURATION_MS = 5 * 60_000;

const PAYMENT_FAILURE_OPTIONS = [
  { label: "Luôn thành công", value: 0 },
  { label: "Lỗi ngẫu nhiên 30%", value: 0.3 },
  { label: "Luôn thất bại", value: 1 },
];

const initialStockById = new Map(mockProducts.map((p) => [p.id, p.stock]));
const noopSubscribe = () => () => {};

const lockKey = (lock: ReservationLock) => `${lock.itemId}-${lock.lockedAt}`;

export default function FlashSaleTester() {
  const isClient = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
  if (!isClient) {
    return (
      <p className="p-6 text-center text-sm text-zinc-500">
        Đang tải flash sale...
      </p>
    );
  }
  return <FlashSaleTesterContent />;
}

function FlashSaleTesterContent() {
  const [machine] = useState(() => createInventoryStateMachine(mockProducts));
  const { items, locks } = useSyncExternalStore(
    machine.subscribe,
    machine.getSnapshot,
    machine.getSnapshot,
  );
  const [message, setMessage] = useState<{
    tone: "success" | "error";
    text: string;
  } | null>(null);
  const [failureRate, setFailureRate] = useState(0.3);
  const [pendingKeys, setPendingKeys] = useState<Set<string>>(new Set());
  const [saleEndsAt, setSaleEndsAt] = useState(
    () => Date.now() + SALE_DURATION_MS,
  );
  const [saleRemaining, setSaleRemaining] = useState(SALE_DURATION_MS);
  const saleEnded = saleRemaining <= 0;

  useEffect(
    () =>
      createAntiDriftTimer(
        Math.max(0, saleEndsAt - Date.now()),
        setSaleRemaining,
      ),
    [saleEndsAt],
  );

  useEffect(() => machine.dispose, [machine]);

  const itemOf = (id: string) => items.find((i) => i.id === id);

  const reserve = (itemId: string) => {
    if (saleEnded) return;
    const result = machine.reserveStock(itemId);
    setMessage(result.ok ? null : { tone: "error", text: result.reason });
  };

  const checkout = async (itemId: string) => {
    const pay = createMockPayment({ failureRate });
    const resultPromise = machine.checkoutOptimistic(itemId, pay);
    // PURCHASED has already been applied optimistically at this point
    const optimisticLock = machine
      .getSnapshot()
      .locks.find((l) => l.itemId === itemId && l.status === "PURCHASED");
    const key = optimisticLock ? lockKey(optimisticLock) : null;
    if (key) setPendingKeys((prev) => new Set(prev).add(key));

    const result = await resultPromise;
    if (key)
      setPendingKeys((prev) => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
    setMessage(
      result.ok
        ? {
            tone: "success",
            text: `Đặt hàng thành công: ${itemOf(itemId)?.name ?? itemId}`,
          }
        : { tone: "error", text: result.reason },
    );
  };

  const reset = () => {
    machine.reset();
    setMessage(null);
    setPendingKeys(new Set());
    setSaleRemaining(SALE_DURATION_MS);
    setSaleEndsAt(Date.now() + SALE_DURATION_MS);
  };

  const cartLocks = locks.filter(
    (l) => l.status === "RESERVED" || pendingKeys.has(lockKey(l)),
  );

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 p-4 sm:p-6">
      <header className="flex flex-wrap items-center justify-between gap-4 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 p-5 text-white shadow">
        <div>
          <p className="text-sm font-semibold tracking-widest uppercase opacity-90">
            VinaFlash · Midnight Flash Sale
          </p>
          <h1 className="text-3xl font-extrabold sm:text-4xl">
            11.11 Siêu Sale Nửa Đêm
          </h1>
        </div>
        <div className="text-right">
          <p className="text-xs uppercase opacity-90">
            {saleEnded ? "Flash sale" : "Kết thúc sau"}
          </p>
          <p className="rounded bg-black/30 px-3 py-1 font-mono text-2xl font-bold tabular-nums">
            {saleEnded ? "Đã kết thúc" : formatCountdownMs(saleRemaining)}
          </p>
        </div>
      </header>

      {message && (
        <p
          role="status"
          className={`rounded px-3 py-2 text-sm ${message.tone === "success" ? "bg-emerald-100 text-emerald-900" : "bg-amber-100 text-amber-900"}`}
        >
          {message.text}
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <FlashSaleCard
              key={item.id}
              item={item}
              initialStock={initialStockById.get(item.id) ?? item.stock}
              endsAt={saleEndsAt}
              held={locks.some(
                (l) => l.itemId === item.id && l.status === "RESERVED",
              )}
              onReserve={reserve}
            />
          ))}
        </section>

        <aside className="h-fit space-y-3 rounded-lg border p-4 lg:sticky lg:top-6">
          <h2 className="text-lg font-semibold">
            Giỏ giữ hàng ({cartLocks.length})
          </h2>
          {cartLocks.length === 0 ? (
            <p className="text-sm text-zinc-500">
              Bấm &quot;Giữ hàng&quot; để giữ suất trong 30 giây.
            </p>
          ) : (
            <ul className="space-y-2">
              {cartLocks.map((lock) => {
                const item = itemOf(lock.itemId);
                const pending = pendingKeys.has(lockKey(lock));
                return (
                  <li
                    key={lockKey(lock)}
                    className="flex items-center justify-between gap-2 rounded border p-2 text-sm"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium">
                        {item?.name ?? lock.itemId}
                      </p>
                      <p className="text-zinc-500">
                        {item && formatVnd(item.salePrice)} ·{" "}
                        {pending ? (
                          "đang xác nhận..."
                        ) : (
                          <>
                            còn <HoldCountdown expiresAt={lock.expiresAt} />
                          </>
                        )}
                      </p>
                    </div>
                    <button
                      onClick={() => checkout(lock.itemId)}
                      disabled={pending}
                      className="shrink-0 rounded bg-orange-500 px-3 py-1.5 font-medium text-white disabled:bg-zinc-400"
                    >
                      {pending ? "..." : "Thanh toán"}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </aside>
      </div>

      <details className="rounded-lg border p-4 text-sm">
        <summary className="cursor-pointer font-semibold">
          Bảng debug ({locks.length} ReservationLock)
        </summary>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2">
            Cổng thanh toán giả lập:
            <select
              value={failureRate}
              onChange={(e) => setFailureRate(Number(e.target.value))}
              className="rounded border px-2 py-1"
            >
              {PAYMENT_FAILURE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          <button
            onClick={reset}
            className="rounded border px-3 py-1 hover:bg-zinc-100"
          >
            Reset flash sale
          </button>
        </div>
        {locks.length > 0 && (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left">
              <thead className="border-b">
                <tr>
                  <th className="py-2">Item</th>
                  <th>lockedAt</th>
                  <th>expiresAt</th>
                  <th>status</th>
                </tr>
              </thead>
              <tbody>
                {locks.map((lock) => (
                  <tr key={lockKey(lock)} className="border-b">
                    <td className="py-2">
                      {itemOf(lock.itemId)?.name ?? lock.itemId}
                    </td>
                    <td>
                      {new Date(lock.lockedAt).toLocaleTimeString("vi-VN")}
                    </td>
                    <td>
                      {new Date(lock.expiresAt).toLocaleTimeString("vi-VN")}
                    </td>
                    <td>
                      <span
                        className={`rounded px-2 py-0.5 text-xs font-medium ${statusStyle[lock.status]}`}
                      >
                        {lock.status}
                        {pendingKeys.has(lockKey(lock)) && " (chờ xác nhận)"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </details>
    </div>
  );
}
