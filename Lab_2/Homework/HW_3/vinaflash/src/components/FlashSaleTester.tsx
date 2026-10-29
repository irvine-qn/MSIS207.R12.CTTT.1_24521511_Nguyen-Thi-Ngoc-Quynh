"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { mockProducts } from "@/data/mockProducts";
import { createInventoryStateMachine } from "@/engine/inventoryStateMachine";
import { createMockPayment } from "@/engine/mockPaymentApi";
import { lockKey } from "@/engine/reservation";
import { createSaleWindow } from "@/engine/saleSchedule";
import { useSaleCountdown } from "@/hooks/useSaleCountdown";
import FlashSaleCard, {
  formatCountdownMs,
  formatVnd,
} from "@/components/FlashSaleCard";
import HoldCountdown from "@/components/HoldCountdown";
import DebugPanel from "@/components/DebugPanel";

const initialStockById = new Map(mockProducts.map((p) => [p.id, p.stock]));
const noopSubscribe = () => () => {};

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
  const [failureRate, setFailureRate] = useState(0);
  const [pendingKeys, setPendingKeys] = useState<Set<string>>(new Set());
  const [saleWindow, setSaleWindow] = useState(() => createSaleWindow());
  const { phase, remaining } = useSaleCountdown(saleWindow);

  useEffect(() => machine.dispose, [machine]);

  const itemOf = (id: string) => items.find((i) => i.id === id);

  const reserve = (itemId: string) => {
    if (phase !== "LIVE") return;
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
        : {
            tone: "error",
            text: `${itemOf(itemId)?.name ?? itemId}: ${result.reason}`,
          },
    );
  };

  const reset = () => {
    machine.reset();
    setMessage(null);
    setPendingKeys(new Set());
    setSaleWindow(createSaleWindow());
  };

  const startNow = () => setSaleWindow(createSaleWindow(Date.now(), 0));

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
            {phase === "UPCOMING"
              ? `Mở bán lúc ${new Date(saleWindow.startsAt).toLocaleTimeString("vi-VN")} · còn`
              : phase === "LIVE"
                ? "Đang mở bán · kết thúc sau"
                : "Flash sale"}
          </p>
          <p className="rounded bg-black/30 px-3 py-1 font-mono text-2xl font-bold tabular-nums">
            {phase === "ENDED" ? "Đã kết thúc" : formatCountdownMs(remaining)}
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
              saleWindow={saleWindow}
              held={cartLocks.some((l) => l.itemId === item.id)}
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

      <DebugPanel
        locks={locks}
        pendingKeys={pendingKeys}
        itemName={(id) => itemOf(id)?.name ?? id}
        failureRate={failureRate}
        onFailureRateChange={setFailureRate}
        onStartNow={startNow}
        onReset={reset}
      />
    </div>
  );
}
