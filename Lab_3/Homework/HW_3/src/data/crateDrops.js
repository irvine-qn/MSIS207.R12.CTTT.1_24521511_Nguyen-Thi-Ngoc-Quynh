export function createCrateDrops(dropEpochMs) {
  return [
    {
      id: 'pvs-vip-ticket',
      title: 'PVS Grand Finals VIP Ticket',
      priceVnd: 5_000_000,
      remainingStock: 3,
      dropEpochMs,
    },
    {
      id: 'gcoin-crate',
      title: 'G-Coin Contraband Crate',
      priceVnd: 250_000,
      remainingStock: 10,
      dropEpochMs,
    },
  ]
}
