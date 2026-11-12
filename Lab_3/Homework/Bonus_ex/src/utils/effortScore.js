export function sumEffortByActor(effortLog) {
  return effortLog.reduce(
    (totals, signal) => ({
      ...totals,
      [signal.actor]: totals[signal.actor] + signal.steps * signal.multiplier,
    }),
    { EM: 0, AI_DO: 0 },
  )
}
