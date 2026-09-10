import type Types from '../types'

/**
 * The theme key behind a run of each kind: the diff's added and removed
 * bands. A context run has none and draws on the terminal's own background
 * (the theme's `background` key is the background-task accent, a cyan).
 */
export const BACKGROUNDS: Readonly<Record<Types.LineKind, string | undefined>> =
  {
    added: 'diffAdded',
    removed: 'diffRemoved',
    context: undefined,
  }
