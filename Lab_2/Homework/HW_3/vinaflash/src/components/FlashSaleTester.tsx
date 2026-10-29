"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type {
  FlashSaleItem,
  InventoryState,
  ReservationLock,
} from "@/types/flashSale";
import { flashSaleItems } from "@/data/flashSaleItems";
import {
  availableStock,
  createLock,
  isLockExpired,
} from "@/engine/reservation";

const vnd = (n: number) => n.toLocaleString("vi-VN") + "₫";

const statusStyle: Record<InventoryState, string> = {
  AVAILABLE: "bg-emerald-100 text-emerald-800",
  RESERVED: "bg-amber-100 text-amber-800",
  PURCHASED: "bg-sky-100 text-sky-800",
  EXPIRED: "bg-zinc-200 text-zinc-700",
};

export default function FlashSaleTester() {
  const [items, setItems] = useState<FlashSaleItem[]>(flashSaleItems);
  const [locks, setLocks] = useState<ReservationLock[]>([]);
  const [now, setNow] = useState(() => Date.now());

  const locksRef = useRef(locks);
  useEffect(() => {
    locksRef.current = locks;
  }, [locks]);

  // Tick every 250ms: update countdowns, expire timed-out locks and release their reserved stock
  useEffect(() => {
    const id = setInterval(() => {
      const t = Date.now();
      setNow(t);
      const expired = locksRef.current.filter((l) => isLockExpired(l, t));
      if (expired.length === 0) return;
      setItems((its) =>
        its.map((it) => {
          const n = expired.filter((l) => l.itemId === it.id).length;
          return n ? { ...it, reservedStock: it.reservedStock - n } : it;
        }),
      );
      const next = locksRef.current.map((l) =>
        expired.includes(l) ? { ...l, status: "EXPIRED" as const } : l,
      );
      locksRef.current = next;
      setLocks(next);
    }, 250);
    return () => clearInterval(id);
  }, []);

  const reserve = (item: FlashSaleItem) => {
    if (availableStock(item) <= 0) return;
    setItems((its) =>
      its.map((it) =>
        it.id === item.id ? { ...it, reservedStock: it.reservedStock + 1 } : it,
      ),
    );
    setLocks((ls) => [createLock(item.id), ...ls]);
  };

  const purchase = (lock: ReservationLock) => {
    if (lock.status !== "RESERVED" || isLockExpired(lock)) return;
    setItems((its) =>
      its.map((it) =>
        it.id === lock.itemId
          ? { ...it, stock: it.stock - 1, reservedStock: it.reservedStock - 1 }
          : it,
      ),
    );
    setLocks((ls) =>
      ls.map((l) => (l === lock ? { ...l, status: "PURCHASED" } : l)),
    );
  };

  const reset = () => {
    setItems(flashSaleItems);
    setLocks([]);
  };

  const nameOf = (id: string) => items.find((i) => i.id === id)?.name ?? id;

  return (
    <div className="mx-auto w-full max-w-5xl space-y-8 p-6">
      <header className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">VinaFlash ⚡ Test</h1>
        <button
          onClick={reset}
          className="rounded border px-3 py-1.5 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800"
        >
          Reset
        </button>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => {
          const avail = availableStock(item);
          const state: InventoryState =
            avail > 0
              ? "AVAILABLE"
              : item.reservedStock > 0
                ? "RESERVED"
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
                  onClick={() => reserve(item)}
                  disabled={avail <= 0}
                  className="block w-full rounded bg-red-600 py-2 font-medium text-white disabled:cursor-not-allowed disabled:bg-zinc-400"
                >
                  {avail > 0 ? "Giữ hàng (10s)" : "Hết hàng"}
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
                            onClick={() => purchase(lock)}
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
