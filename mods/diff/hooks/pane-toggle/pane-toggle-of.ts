import Limits from '../limits'
import type { PaneBelief } from './pane-belief'

/**
 * What `/diff` does, the one place its toggle is decided: close only when
 * the plugin opened the pane and it still draws; otherwise open, focused,
 * unless the terminal is narrower than the built-in panel shows on, where
 * `/diff` answers the built-in's resize line instead (`too-narrow`).
 *
 * The person's close raises nothing this plugin hooks, so a pane believed
 * open is probed with a redraw first. A width not drawn yet opens.
 *
 * @param pane the plugin's belief, the probe's answer and the width
 * @returns `close`, `open` or `too-narrow`
 */
export const paneToggleOf = (
  pane: PaneBelief,
): 'open' | 'close' | 'too-narrow' =>
  pane.isBelievedOpen && pane.wasDrawnWhenProbed
    ? 'close'
    : pane.columns !== null && pane.columns < Limits.OPEN_MIN_COLUMNS
      ? 'too-narrow'
      : 'open'
