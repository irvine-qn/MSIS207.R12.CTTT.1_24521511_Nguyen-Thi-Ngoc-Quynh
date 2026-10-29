"use client";

import Image from "next/image";
import { useEffect, useState, useSyncExternalStore } from "react";
import type { InventoryState } from "@/types/flashSale";
import { mockProducts } from "@/data/mockProducts";
import { availableStock } from "@/engine/reservation";
import { createAntiDriftTimer } from "@/engine/antiDriftTimer";
import {
  HOLD_DURATION_MS,
  createInventoryStateMachine,
} from "@/engine/inventoryStateMachine";

const SALE_DURATION_MS = 60_000;

const vnd = (n: number) => n.toLocaleString("vi-VN") + "₫";

const formatCountdown = (ms: number) => {
  const totalSeconds = Math.ceil(ms / 1000);
  const mm = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const ss = String(totalSeconds % 60).padStart(2, "0");
  return `${mm}:${ss}`;
};

const statusStyle: Record<InventoryState, string> = {
  AVAILABLE: "bg-emerald-100 text-emerald-800",
  RESERVED: "bg-amber-100 text-amber-800",
  PURCHASED: "bg-sky-100 text-sky-800",
  EXPIRED: "bg-zinc-200 text-zinc-700",
};

export default function FlashSaleTester() {
  const [machine] = useState(() => createInventoryStateMachine(mockProducts));
  const { items, locks } = useSyncExternalStore(
    machine.subscribe,
    machine.getSnapshot,
    machine.getSnapshot,
  );
  const [message, setMessage] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [saleRemaining, setSaleRemaining] = useState(SALE_DURATION_MS);
  const [saleRound, setSaleRound] = useState(0);
  const saleEnded = saleRemaining <= 0;

  useEffect(
    () => createAntiDriftTimer(SALE_DURATION_MS, setSaleRemaining),
    [saleRound],
  );

  useEffect(() => machine.dispose, [machine]);

  // Display-only clock for the per-lock countdown; expiry itself is driven by the state machine
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
    setSaleRound((r) => r + 1);
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
            : `Kết thúc sau ${formatCountdown(saleRemaining)}`}
        </div>
        <button
          onClick={reset}
          className="rounded border px-3 py-1.5 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800"
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
        {items.map((item) => {
          const avail = availableStock(item);
          const held = locks.some(
            (l) => l.itemId === item.id && l.status === "RESERVED",
          );
          const state: InventoryState = held
            ? "RESERVED"
            : avail > 0
              ? "AVAILABLE"
              : "PURCHASED";
          return (
            <article
              key={item.id}
              className="overflow-hidden rounded-lg border"
            >
              <Image
                src={item.imageUrl}
                alt={item.name}
                width={400}
                height={300}
                unoptimized
                className="h-40 w-full object-cover"
              />
              <div className="space-y-2 p-4">
                <div className="flex items-start justify-between gap-2">
                  <h2 className="font-semibold">{item.name}</h2>
                  <span className="rounded bg-red-600 px-2 py-0.5 text-xs font-bold text-white">
                    -{item.discountPercent}%
                  </span>
                </div>
                <p>
                  <span className="text-lg font-bold text-red-600">
                    {vnd(item.salePrice)}
                  </span>{" "}
                  <span className="text-sm text-zinc-500 line-through">
                    {vnd(item.originalPrice)}
                  </span>
                </p>
                <p className="text-sm">
                  stock: <b>{item.stock}</b> · reserved:{" "}
                  <b>{item.reservedStock}</b> · available: <b>{avail}</b>
                </p>
                <span
                  className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${statusStyle[state]}`}
                >
                  {state}
                </span>
                <button
                  onClick={() => reserve(item.id)}
                  disabled={saleEnded || held || avail <= 0}
                  className="block w-full rounded bg-red-600 py-2 font-medium text-white disabled:cursor-not-allowed disabled:bg-zinc-400"
                >
                  {saleEnded
                    ? "Đã kết thúc"
                    : held
                      ? "Đang giữ hàng"
                      : avail > 0
                        ? `Giữ hàng (${HOLD_DURATION_MS / 1000}s)`
                        : "Hết hàng"}
                </button>
              </div>
            </article>
          );
        })}
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
