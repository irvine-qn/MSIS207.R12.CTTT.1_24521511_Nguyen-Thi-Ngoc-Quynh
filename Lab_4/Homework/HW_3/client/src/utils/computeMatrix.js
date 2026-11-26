export const EXPECTED_MATCHES_PER_SEVERITY = 2

export function computeMatrix(dossier) {
  const violations = dossier?.violations ?? []

  const rows = violations.map((violation) => {
    const expectedMatches = violation.severity * EXPECTED_MATCHES_PER_SEVERITY
    const delta = violation.penaltyMatches - expectedMatches
    return {
      code: violation.code,
      description: violation.description,
      severity: violation.severity,
      penaltyMatches: violation.penaltyMatches,
      expectedMatches,
      delta,
      ratio: expectedMatches > 0 ? violation.penaltyMatches / expectedMatches : 0,
      isDisproportionate: delta > 0,
    }
  })

  const totals = rows.reduce(
    (acc, row) => ({
      penaltyMatches: acc.penaltyMatches + row.penaltyMatches,
      expectedMatches: acc.expectedMatches + row.expectedMatches,
      delta: acc.delta + row.delta,
      disproportionateCount: acc.disproportionateCount + (row.isDisproportionate ? 1 : 0),
    }),
    { penaltyMatches: 0, expectedMatches: 0, delta: 0, disproportionateCount: 0 }
  )

  return { rows, totals }
}
