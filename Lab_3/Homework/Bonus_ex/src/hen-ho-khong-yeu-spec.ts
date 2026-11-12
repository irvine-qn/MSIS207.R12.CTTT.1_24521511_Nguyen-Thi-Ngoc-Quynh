export type RelationshipPhase =
  | 'FRIENDS'
  | 'DATING_NO_LOVE'
  | 'OFFICIAL_LOVE'
  | 'GHOSTED_EXIT';

export interface EffortSignal {
  readonly id: string;
  readonly actor: 'EM' | 'AI_DO';
  readonly steps: number;
  readonly multiplier: number;
}

export interface RelationshipState {
  readonly phase: RelationshipPhase;
  readonly effortLog: readonly EffortSignal[];
}

export type RelationshipAction =
  | { readonly type: 'LOG_EFFORT'; readonly signal: EffortSignal }
  | { readonly type: 'TRANSITION'; readonly to: RelationshipPhase }
  | { readonly type: 'GHOSTED' };
