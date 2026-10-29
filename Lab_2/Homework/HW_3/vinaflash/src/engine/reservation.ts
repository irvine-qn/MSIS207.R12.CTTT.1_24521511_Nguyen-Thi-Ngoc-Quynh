import type { FlashSaleItem, ReservationLock } from "@/types/flashSale";

export const LOCK_DURATION_MS = 10_000;

export const availableStock = (item: FlashSaleItem): number =>
  item.stock - item.reservedStock;

export function createLock(
  itemId: string,
  now: number = Date.now(),
): ReservationLock {
  return {
    itemId,
    lockedAt: now,
    expiresAt: now + LOCK_DURATION_MS,
    status: "RESERVED",
  };
}

export const isLockExpired = (
  lock: ReservationLock,
  now: number = Date.now(),
): boolean => lock.status === "RESERVED" && now >= lock.expiresAt;
