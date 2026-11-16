const effortFormatter = new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 2 })

export function formatEffort(value) {
  return effortFormatter.format(value)
}

export function sumEffortByActor(effortLog) {
  return effortLog.reduce(
    (totals, signal) => ({
      ...totals,
      [signal.actor]: totals[signal.actor] + signal.steps * signal.multiplier,
    }),
    { EM: 0, AI_DO: 0 },
  )
}
