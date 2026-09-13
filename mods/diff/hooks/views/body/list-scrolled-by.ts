import Limits from '../../limits'
import type PaneState from '../../pane-state'
import DialogPane from '../dialog-pane'
import Plan from './plan'

/**
 * The pane's place with its list window moved by so many files, clamped:
 * docked, ReplDiffSidebar's scrollSummary; inline, the dialog's window.
 *
 * @param model the pane's state
 * @param delta the files to move by, negative toward the top
 * @returns the place
 */
export function listScrolledBy(
  model: PaneState.PaneModel,
  delta: number,
): PaneState.PaneModel['place'] {
  const isDocked = model.placement === 'dock'
  const paths = DialogPane.dialogEntriesOf(model).map(entry => entry.path)

  const last = isDocked
    ? Plan.dockPlanOf(model).rows.length - Limits.MAX_SUMMARY_ROWS
    : paths.length - Limits.MAX_VISIBLE_FILES

  const start = isDocked
    ? Math.min(model.place.listStart, Math.max(0, last))
    : DialogPane.dialogWindowOf(model, paths)

  return {
    ...model.place,
    listStart: Math.max(0, Math.min(Math.max(0, last), start + delta)),
  }
}
