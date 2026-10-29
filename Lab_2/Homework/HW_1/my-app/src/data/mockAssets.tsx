import type { ColumnDef, FilterOption } from "@/types/data-grid-contract";
import type { Asset } from "@/types/portfolio";

export const mockAssets: Asset[] = [
  {
    id: "aapl",
    symbol: "AAPL",
    name: "Apple Inc.",
    price: 269.12,
    change24h: 1.24,
    allocation: 12.5,
  },
  {
    id: "nvda",
    symbol: "NVDA",
    name: "NVIDIA Corporation",
    price: 187.65,
    change24h: 2.86,
    allocation: 11.2,
  },
  {
    id: "msft",
    symbol: "MSFT",
    name: "Microsoft Corporation",
    price: 531.42,
    change24h: -0.38,
    allocation: 10.1,
  },
  {
    id: "googl",
    symbol: "GOOGL",
    name: "Alphabet Inc.",
    price: 247.83,
    change24h: 0.67,
    allocation: 8.4,
  },
  {
    id: "amzn",
    symbol: "AMZN",
    name: "Amazon.com, Inc.",
    price: 224.91,
    change24h: -1.12,
    allocation: 7.8,
  },
  {
    id: "meta",
    symbol: "META",
    name: "Meta Platforms, Inc.",
    price: 618.37,
    change24h: 1.73,
    allocation: 6.9,
  },
  {
    id: "tsla",
    symbol: "TSLA",
    name: "Tesla, Inc.",
    price: 338.54,
    change24h: -2.41,
    allocation: 5.6,
  },
  {
    id: "brk-b",
    symbol: "BRK.B",
    name: "Berkshire Hathaway Inc.",
    price: 512.08,
    change24h: 0.23,
    allocation: 5.2,
  },
  {
    id: "avgo",
    symbol: "AVGO",
    name: "Broadcom Inc.",
    price: 342.76,
    change24h: 1.08,
    allocation: 4.8,
  },
  {
    id: "jpm",
    symbol: "JPM",
    name: "JPMorgan Chase & Co.",
    price: 296.34,
    change24h: -0.54,
    allocation: 4.2,
  },
  {
    id: "btc",
    symbol: "BTC",
    name: "Bitcoin",
    price: 109842.5,
    change24h: 3.42,
    allocation: 8.6,
  },
  {
    id: "eth",
    symbol: "ETH",
    name: "Ethereum",
    price: 2634.18,
    change24h: 2.15,
    allocation: 5.7,
  },
  {
    id: "sol",
    symbol: "SOL",
    name: "Solana",
    price: 178.92,
    change24h: 4.81,
    allocation: 2.9,
  },
  {
    id: "xrp",
    symbol: "XRP",
    name: "XRP",
    price: 2.34,
    change24h: -1.67,
    allocation: 2.1,
  },
  {
    id: "ada",
    symbol: "ADA",
    name: "Cardano",
    price: 0.78,
    change24h: 0.92,
    allocation: 1.8,
  },
  {
    id: "doge",
    symbol: "DOGE",
    name: "Dogecoin",
    price: 0.19,
    change24h: -3.08,
    allocation: 1.3,
  },
  {
    id: "link",
    symbol: "LINK",
    name: "Chainlink",
    price: 14.72,
    change24h: 1.56,
    allocation: 1.5,
  },
  {
    id: "avax",
    symbol: "AVAX",
    name: "Avalanche",
    price: 21.64,
    change24h: -0.83,
    allocation: 1.4,
  },
];

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 4,
});

const percent = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const signedPercent = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
  signDisplay: "exceptZero",
});

export const columns: ColumnDef<Asset>[] = [
  {
    header: "Ticker",
    accessorKey: "symbol",
    sortable: true,
    cell: (asset) => <strong>{asset.symbol}</strong>,
  },
  { header: "Asset Name", accessorKey: "name", sortable: true },
  {
    header: "Price ($)",
    accessorKey: "price",
    sortable: true,
    cell: (asset) => usd.format(asset.price),
    cellClassName: () => "text-right tabular-nums",
  },
  {
    header: "24h Change (%)",
    accessorKey: "change24h",
    sortable: true,
    cell: (asset) => `${signedPercent.format(asset.change24h)}%`,
    cellClassName: (asset) =>
      `text-right tabular-nums ${
        asset.change24h > 0
          ? "text-[#22C55E]"
          : asset.change24h < 0
            ? "text-[#F87171]"
            : ""
      }`,
  },
  {
    header: "Allocation (%)",
    accessorKey: "allocation",
    sortable: true,
    cell: (asset) => `${percent.format(asset.allocation)}%`,
    cellClassName: () => "text-right tabular-nums",
  },
];

export const statusFilters: FilterOption<Asset>[] = [
  { label: "Gainers", predicate: (asset) => asset.change24h > 0 },
  { label: "Losers", predicate: (asset) => asset.change24h < 0 },
];
