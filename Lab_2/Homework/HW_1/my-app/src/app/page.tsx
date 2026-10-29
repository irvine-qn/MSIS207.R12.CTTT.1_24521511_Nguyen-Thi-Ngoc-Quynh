"use client";

import { useState } from "react";
import { DataGrid } from "@/components/ui/DataGrid";
import { columns, mockAssets, statusFilters } from "@/data/mockAssets";
import type { Asset } from "@/types/portfolio";

const getAssetId = (asset: Asset) => asset.id;

export default function Home() {
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 bg-[#0F172A] px-4 py-10 text-[#F8FAFC]">
      <h1 className="text-2xl font-semibold">Stock &amp; Crypto Portfolio</h1>

      <DataGrid
        data={mockAssets}
        columns={columns}
        onRowSelect={setSelectedAsset}
        getRowId={getAssetId}
        filterOptions={statusFilters}
        ariaLabel="Enterprise Stock and Crypto Portfolio"
      />

      <p className="text-sm text-[#94A3B8]">
        Use arrow keys to move between cells, Enter to select an asset, Space
        to bookmark a row.
      </p>

      <p aria-live="polite" className="text-[#94A3B8]">
        {selectedAsset
          ? `Selected: ${selectedAsset.symbol} (${selectedAsset.name})`
          : "No asset selected."}
      </p>
    </main>
  );
}
