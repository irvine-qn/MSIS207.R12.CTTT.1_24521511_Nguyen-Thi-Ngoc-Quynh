import type { ReservationLock } from "@/types/flashSale";

export interface MockPaymentOptions {
  latencyMs?: number;
  failureRate?: number;
}

export function createMockPayment({
  latencyMs = 1200,
  failureRate = 0,
}: MockPaymentOptions = {}) {
  return (lock: ReservationLock): Promise<void> =>
    new Promise((resolve, reject) => {
      setTimeout(() => {
        if (Math.random() < failureRate) {
          reject(
            new Error(
              `Cổng thanh toán từ chối giao dịch (${lock.itemId}), đơn hàng đã được hoàn tác`,
            ),
          );
        } else {
          resolve();
        }
      }, latencyMs);
    });
}
