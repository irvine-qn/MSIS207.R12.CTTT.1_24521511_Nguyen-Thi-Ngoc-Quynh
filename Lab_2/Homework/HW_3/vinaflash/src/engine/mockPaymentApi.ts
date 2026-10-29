import type { ReservationLock } from "@/types/flashSale";

export interface MockPaymentOptions {
  latencyMs?: number;
  failureRate?: number;
}

export function createMockPayment({
  latencyMs = 1200,
  failureRate = 0.3,
}: MockPaymentOptions = {}) {
  return (lock: ReservationLock): Promise<void> =>
    new Promise((resolve, reject) => {
      setTimeout(() => {
        if (Math.random() < failureRate) {
          reject(
            new Error(
              `Thanh toán thất bại cho ${lock.itemId}, đã hoàn tác đơn hàng`,
            ),
          );
        } else {
          resolve();
        }
      }, latencyMs);
    });
}
