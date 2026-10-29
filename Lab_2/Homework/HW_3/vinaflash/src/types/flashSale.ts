export type InventoryState = "AVAILABLE" | "RESERVED" | "PURCHASED" | "EXPIRED";

export interface FlashSaleItem {
  id: string;
  name: string;
  originalPrice: number;
  salePrice: number;
  stock: number;
  reservedStock: number;
  discountPercent: number;
  imageUrl: string;
}

export interface ReservationLock {
  itemId: string;
  /** Epoch milliseconds */
  lockedAt: number;
  /** Epoch milliseconds */
  expiresAt: number;
  status: InventoryState;
}
