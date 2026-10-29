export type SalePhase = "UPCOMING" | "LIVE" | "ENDED";

export interface SaleWindow {
  startsAt: number;
  endsAt: number;
}

export interface SaleStatus {
  phase: SalePhase;
  remaining: number;
}

export const PRE_SALE_MS = 15_000;
export const SALE_DURATION_MS = 5 * 60_000;

export function createSaleWindow(
  now: number = Date.now(),
  preSaleMs: number = PRE_SALE_MS,
): SaleWindow {
  const startsAt = now + preSaleMs;
  return { startsAt, endsAt: startsAt + SALE_DURATION_MS };
}

export function getSaleStatus(
  { startsAt, endsAt }: SaleWindow,
  now: number = Date.now(),
): SaleStatus {
  if (now < startsAt) return { phase: "UPCOMING", remaining: startsAt - now };
  if (now < endsAt) return { phase: "LIVE", remaining: endsAt - now };
  return { phase: "ENDED", remaining: 0 };
}
