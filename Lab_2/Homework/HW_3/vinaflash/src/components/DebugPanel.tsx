"use client";

import type { ReservationLock } from "@/types/flashSale";
import { lockKey } from "@/engine/reservation";
import { statusStyle } from "@/components/FlashSaleCard";

const PAYMENT_FAILURE_OPTIONS = [
  { label: "Luôn thành công", value: 0 },
  { label: "Lỗi ngẫu nhiên 30%", value: 0.3 },
  { label: "Luôn thất bại", value: 1 },
];

interface DebugPanelProps {
  locks: ReservationLock[];
  pendingKeys: Set<string>;
  itemName: (itemId: string) => string;
  failureRate: number;
  onFailureRateChange: (rate: number) => void;
  onStartNow: () => void;
  onReset: () => void;
}

export default function DebugPanel({
  locks,
  pendingKeys,
  itemName,
  failureRate,
  onFailureRateChange,
  onStartNow,
  onReset,
}: DebugPanelProps) {
  return (
    <details className="rounded-lg border border-dashed p-4 text-sm">
      <summary className="cursor-pointer font-semibold text-zinc-600">
        Bảng debug ({locks.length} ReservationLock)
      </summary>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2">
          Cổng thanh toán giả lập:
          <select
            value={failureRate}
            onChange={(e) => onFailureRateChange(Number(e.target.value))}
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
          onClick={onStartNow}
          className="rounded border px-3 py-1 hover:bg-zinc-100"
        >
          Mở bán ngay
        </button>
        <button
          onClick={onReset}
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
                  <td className="py-2">{itemName(lock.itemId)}</td>
                  <td>{new Date(lock.lockedAt).toLocaleTimeString("vi-VN")}</td>
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
  );
}
