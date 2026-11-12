export const PHASES = Object.freeze({
  FRIENDS: 'FRIENDS',
  DATING_NO_LOVE: 'DATING_NO_LOVE',
  OFFICIAL_LOVE: 'OFFICIAL_LOVE',
  GHOSTED_EXIT: 'GHOSTED_EXIT',
})

const ALLOWED_TRANSITIONS = Object.freeze({
  [PHASES.FRIENDS]: Object.freeze([PHASES.DATING_NO_LOVE]),
  [PHASES.DATING_NO_LOVE]: Object.freeze([PHASES.OFFICIAL_LOVE, PHASES.GHOSTED_EXIT]),
  [PHASES.OFFICIAL_LOVE]: Object.freeze([]),
  [PHASES.GHOSTED_EXIT]: Object.freeze([]),
})

export const initialRelationshipState = Object.freeze({
  phase: PHASES.FRIENDS,
  effortLog: Object.freeze([]),
})

export function canTransition(from, to) {
  return ALLOWED_TRANSITIONS[from]?.includes(to) ?? false
}

export function relationshipReducer(state, action) {
  switch (action.type) {
    case 'TRANSITION':
      if (!canTransition(state.phase, action.to)) return state
      return { ...state, phase: action.to }
    case 'GHOSTED':
      if (!canTransition(state.phase, PHASES.GHOSTED_EXIT)) return state
      return { ...state, phase: PHASES.GHOSTED_EXIT }
    default:
      return state
  }
}
