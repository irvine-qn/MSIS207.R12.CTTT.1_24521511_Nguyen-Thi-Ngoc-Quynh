export const CRATE_DROP_IDS = {
  vipTicket: 'pvs-vip-ticket',
  gcoinCrate: 'gcoin-crate',
}

export function createCrateDrops(dropEpochMs) {
  return [
    {
      id: CRATE_DROP_IDS.vipTicket,
      title: 'PVS Grand Finals VIP Ticket',
      priceVnd: 5_000_000,
      remainingStock: 3,
      dropEpochMs,
    },
    {
      id: CRATE_DROP_IDS.gcoinCrate,
      title: 'G-Coin Contraband Crate',
      priceVnd: 250_000,
      remainingStock: 10,
      dropEpochMs,
    },
  ]
}
