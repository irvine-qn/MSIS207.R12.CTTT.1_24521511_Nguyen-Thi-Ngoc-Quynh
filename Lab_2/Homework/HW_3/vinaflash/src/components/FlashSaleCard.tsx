"use client";

import Image from "next/image";
import type { FlashSaleItem, InventoryState } from "@/types/flashSale";
import { availableStock } from "@/engine/reservation";
import { HOLD_DURATION_MS } from "@/engine/inventoryStateMachine";
import type { SaleWindow } from "@/engine/saleSchedule";
import { useSaleCountdown } from "@/hooks/useSaleCountdown";

const LOW_STOCK_THRESHOLD = 3;

const vndFormatter = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
});

export const formatVnd = (amount: number): string =>
  vndFormatter.format(amount).replace(/ /g, " ");

const pad = (n: number, width = 2) => String(n).padStart(width, "0");

export const formatCountdownMs = (ms: number): string => {
  const hours = Math.floor(ms / 3_600_000);
  const minutes = Math.floor((ms % 3_600_000) / 60_000);
  const seconds = Math.floor((ms % 60_000) / 1000);
  const millis = Math.floor(ms % 1000);
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}:${pad(millis, 3)}`;
};

export const statusStyle: Record<InventoryState, string> = {
  AVAILABLE: "bg-emerald-100 text-emerald-800",
  RESERVED: "bg-amber-100 text-amber-800",
  PURCHASED: "bg-sky-100 text-sky-800",
  EXPIRED: "bg-zinc-200 text-zinc-700",
};

interface FlashSaleCardProps {
  item: FlashSaleItem;
  initialStock: number;
  saleWindow: SaleWindow;
  held: boolean;
  onReserve: (itemId: string) => void;
}

export default function FlashSaleCard({
  item,
  initialStock,
  saleWindow,
  held,
  onReserve,
}: FlashSaleCardProps) {
  const { phase, remaining } = useSaleCountdown(saleWindow);
  const ended = phase === "ENDED";
  const upcoming = phase === "UPCOMING";

  const avail = availableStock(item);
  const sold = initialStock - item.stock;
  const soldPercent =
    initialStock > 0 ? Math.round((sold / initialStock) * 100) : 100;
  const state: InventoryState = held
    ? "RESERVED"
    : avail > 0
      ? "AVAILABLE"
      : "PURCHASED";

  const stockLabel =
    avail <= 0
      ? "Hết suất"
      : avail <= LOW_STOCK_THRESHOLD
        ? `Chỉ còn ${avail} suất`
        : `Đã bán ${soldPercent}%`;

  return (
    <article className="overflow-hidden rounded-lg border">
      <Image
        src={item.imageUrl}
        alt={item.name}
        width={400}
        height={300}
        unoptimized
        className="h-40 w-full object-cover"
      />
      <div className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <h2 className="font-semibold">{item.name}</h2>
          <span className="rounded bg-red-600 px-2 py-0.5 text-xs font-bold text-white">
            -{item.discountPercent}%
          </span>
        </div>

        <p>
          <span className="text-lg font-bold text-red-600">
            {formatVnd(item.salePrice)}
          </span>{" "}
          <span className="text-sm text-zinc-500 line-through">
            {formatVnd(item.originalPrice)}
          </span>
        </p>

        <div className="flex items-center justify-between text-sm">
          <span className="text-zinc-500">
            {ended
              ? "Flash sale đã kết thúc"
              : upcoming
                ? "Mở bán sau"
                : "Kết thúc sau"}
          </span>
          {!ended && (
            <span className="rounded bg-zinc-900 px-2 py-0.5 font-mono text-white tabular-nums">
              {formatCountdownMs(remaining)}
            </span>
          )}
        </div>

        <div
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={soldPercent}
          aria-label={stockLabel}
          className="relative h-5 overflow-hidden rounded-full bg-red-100"
        >
          <div
            className="h-full rounded-full bg-gradient-to-r from-orange-500 to-red-600 transition-[width] duration-300"
            style={{ width: `${soldPercent}%` }}
          />
          <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-red-950">
            {stockLabel}
          </span>
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className="text-zinc-500">
            stock {item.stock} · reserved {item.reservedStock} · available{" "}
            {avail}
          </span>
          <span
            className={`rounded px-2 py-0.5 font-medium ${statusStyle[state]}`}
          >
            {state}
          </span>
        </div>

        <button
          onClick={() => onReserve(item.id)}
          disabled={ended || held || avail <= 0}
          className="block w-full rounded bg-red-600 py-2 font-medium text-white disabled:cursor-not-allowed disabled:bg-zinc-400"
        >
          {ended
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
}
