export function getDropPhase({
  warmupRemainingMs,
  liveRemainingMs = Number.POSITIVE_INFINITY,
  remainingStock = Number.POSITIVE_INFINITY,
}) {
  if (warmupRemainingMs > 0) return 'WARMUP'
  if (remainingStock <= 0) return 'LOOTED_OUT'
  if (liveRemainingMs <= 0) return 'EXPIRED'
  return 'AIRDROP_LIVE'
}
