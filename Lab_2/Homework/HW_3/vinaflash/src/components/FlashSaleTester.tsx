"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { mockProducts } from "@/data/mockProducts";
import { createAntiDriftTimer } from "@/engine/antiDriftTimer";
import { createInventoryStateMachine } from "@/engine/inventoryStateMachine";
import FlashSaleCard, {
  formatCountdownMs,
  statusStyle,
} from "@/components/FlashSaleCard";

const SALE_DURATION_MS = 5 * 60_000;

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
  const [message, setMessage] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());
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

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, []);

  const reserve = (itemId: string) => {
    if (saleEnded) return;
    const result = machine.reserveStock(itemId);
    setMessage(result.ok ? null : result.reason);
  };

  const purchase = (itemId: string) => {
    const result = machine.confirmCheckout(itemId);
    setMessage(result.ok ? null : result.reason);
  };

  const reset = () => {
    machine.reset();
    setMessage(null);
    setSaleRemaining(SALE_DURATION_MS);
    setSaleEndsAt(Date.now() + SALE_DURATION_MS);
  };

  const nameOf = (id: string) => items.find((i) => i.id === id)?.name ?? id;

  return (
    <div className="mx-auto w-full max-w-5xl space-y-8 p-6">
      <header className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">VinaFlash ⚡ Test</h1>
        <div
          className={`rounded px-3 py-1.5 font-mono text-lg font-bold ${saleEnded ? "bg-zinc-200 text-zinc-700" : "bg-red-600 text-white"}`}
        >
          {saleEnded
            ? "Đã kết thúc"
            : `Kết thúc sau ${formatCountdownMs(saleRemaining)}`}
        </div>
        <button
          onClick={reset}
          className="rounded border px-3 py-1.5 text-sm hover:bg-zinc-100"
        >
          Reset
        </button>
      </header>

      {message && (
        <p className="rounded bg-amber-100 px-3 py-2 text-sm text-amber-900">
          {message}
        </p>
      )}

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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

      <section>
        <h2 className="mb-2 text-xl font-semibold">
          ReservationLock ({locks.length})
        </h2>
        {locks.length === 0 ? (
          <p className="text-sm text-zinc-500">
            Chưa có lock nào. Bấm &quot;Giữ hàng&quot; để tạo.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b">
                <tr>
                  <th className="py-2">Item</th>
                  <th>lockedAt</th>
                  <th>expiresAt</th>
                  <th>Còn lại</th>
                  <th>status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {locks.map((lock) => {
                  const left = Math.max(0, lock.expiresAt - now);
                  return (
                    <tr
                      key={`${lock.itemId}-${lock.lockedAt}`}
                      className="border-b"
                    >
                      <td className="py-2">{nameOf(lock.itemId)}</td>
                      <td>
                        {new Date(lock.lockedAt).toLocaleTimeString("vi-VN")}
                      </td>
                      <td>
                        {new Date(lock.expiresAt).toLocaleTimeString("vi-VN")}
                      </td>
                      <td className="font-mono">
                        {lock.status === "RESERVED"
                          ? `${(left / 1000).toFixed(1)}s`
                          : "—"}
                      </td>
                      <td>
                        <span
                          className={`rounded px-2 py-0.5 text-xs font-medium ${statusStyle[lock.status]}`}
                        >
                          {lock.status}
                        </span>
                      </td>
                      <td>
                        {lock.status === "RESERVED" && (
                          <button
                            onClick={() => purchase(lock.itemId)}
                            className="rounded bg-sky-600 px-3 py-1 text-white"
                          >
                            Mua
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
