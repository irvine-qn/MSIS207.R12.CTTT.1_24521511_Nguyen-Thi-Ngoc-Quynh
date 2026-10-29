import type {
  FlashSaleItem,
  InventoryState,
  ReservationLock,
} from "@/types/flashSale";
import { availableStock } from "@/engine/reservation";

export const HOLD_DURATION_MS = 30_000;

export interface InventorySnapshot {
  items: FlashSaleItem[];
  locks: ReservationLock[];
}

export type TransitionResult =
  | { ok: true; lock: ReservationLock }
  | { ok: false; reason: string };

const TRANSITIONS: Record<InventoryState, InventoryState[]> = {
  AVAILABLE: ["RESERVED"],
  RESERVED: ["PURCHASED", "EXPIRED"],
  PURCHASED: [],
  EXPIRED: [],
};

const canTransition = (from: InventoryState, to: InventoryState) =>
  TRANSITIONS[from].includes(to);

export function createInventoryStateMachine(
  initialItems: FlashSaleItem[],
  holdDurationMs: number = HOLD_DURATION_MS,
) {
  let snapshot: InventorySnapshot = { items: initialItems, locks: [] };
  const listeners = new Set<() => void>();
  const expiryTimers = new Map<string, ReturnType<typeof setTimeout>>();

  const commit = (next: InventorySnapshot) => {
    snapshot = next;
    listeners.forEach((listener) => listener());
  };

  const updateItem = (
    itemId: string,
    patch: (item: FlashSaleItem) => FlashSaleItem,
  ) => snapshot.items.map((it) => (it.id === itemId ? patch(it) : it));

  const replaceLock = (target: ReservationLock, next: ReservationLock) =>
    snapshot.locks.map((l) => (l === target ? next : l));

  const findActiveLock = (itemId: string) =>
    snapshot.locks.find((l) => l.itemId === itemId && l.status === "RESERVED");

  const clearExpiryTimer = (itemId: string) => {
    clearTimeout(expiryTimers.get(itemId));
    expiryTimers.delete(itemId);
  };

  const expire = (itemId: string) => {
    clearExpiryTimer(itemId);
    const lock = findActiveLock(itemId);
    if (!lock || !canTransition(lock.status, "EXPIRED")) return;
    commit({
      items: updateItem(itemId, (it) => ({
        ...it,
        reservedStock: it.reservedStock - 1,
      })),
      locks: replaceLock(lock, { ...lock, status: "EXPIRED" }),
    });
  };

  const reserveStock = (itemId: string): TransitionResult => {
    const item = snapshot.items.find((it) => it.id === itemId);
    if (!item) return { ok: false, reason: "Sản phẩm không tồn tại" };
    if (findActiveLock(itemId))
      return { ok: false, reason: "Sản phẩm đang được giữ" };
    if (availableStock(item) <= 0) return { ok: false, reason: "Hết hàng" };

    const now = Date.now();
    const lock: ReservationLock = {
      itemId,
      lockedAt: now,
      expiresAt: now + holdDurationMs,
      status: "RESERVED",
    };
    commit({
      items: updateItem(itemId, (it) => ({
        ...it,
        reservedStock: it.reservedStock + 1,
      })),
      locks: [lock, ...snapshot.locks],
    });
    expiryTimers.set(
      itemId,
      setTimeout(() => expire(itemId), holdDurationMs),
    );
    return { ok: true, lock };
  };

  const confirmCheckout = (itemId: string): TransitionResult => {
    const lock = findActiveLock(itemId);
    if (!lock || !canTransition(lock.status, "PURCHASED"))
      return { ok: false, reason: "Không có lượt giữ hàng hợp lệ" };
    if (Date.now() >= lock.expiresAt) {
      expire(itemId);
      return { ok: false, reason: "Đã hết thời gian giữ hàng" };
    }

    clearExpiryTimer(itemId);
    const purchased: ReservationLock = { ...lock, status: "PURCHASED" };
    commit({
      items: updateItem(itemId, (it) => ({
        ...it,
        stock: it.stock - 1,
        reservedStock: it.reservedStock - 1,
      })),
      locks: replaceLock(lock, purchased),
    });
    return { ok: true, lock: purchased };
  };

  const dispose = () => {
    expiryTimers.forEach(clearTimeout);
    expiryTimers.clear();
  };

  const reset = (items: FlashSaleItem[] = initialItems) => {
    dispose();
    commit({ items, locks: [] });
  };

  return {
    getSnapshot: () => snapshot,
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    reserveStock,
    confirmCheckout,
    reset,
    dispose,
  };
}

export type InventoryStateMachine = ReturnType<
  typeof createInventoryStateMachine
>;
