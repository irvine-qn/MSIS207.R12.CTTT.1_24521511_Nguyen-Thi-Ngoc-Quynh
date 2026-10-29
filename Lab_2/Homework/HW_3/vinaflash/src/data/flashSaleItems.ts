import type { FlashSaleItem } from "@/types/flashSale";

const PRODUCT_IMAGE_DIR = "/images/products";

export const productImageUrl = (slug: string): string =>
  `${PRODUCT_IMAGE_DIR}/${slug}.svg`;

export const flashSaleItems: FlashSaleItem[] = [
  {
    id: "fs-01",
    name: "Tai nghe Bluetooth",
    originalPrice: 890000,
    salePrice: 445000,
    stock: 5,
    reservedStock: 0,
    discountPercent: 50,
    imageUrl: productImageUrl("headphone"),
  },
  {
    id: "fs-02",
    name: "Bàn phím cơ",
    originalPrice: 1490000,
    salePrice: 1043000,
    stock: 3,
    reservedStock: 0,
    discountPercent: 30,
    imageUrl: productImageUrl("keyboard"),
  },
  {
    id: "fs-03",
    name: "Chuột không dây",
    originalPrice: 450000,
    salePrice: 270000,
    stock: 1,
    reservedStock: 0,
    discountPercent: 40,
    imageUrl: productImageUrl("mouse"),
  },
];
