import Limits from '../../../limits'
import type PaneState from '../../../pane-state'

/**
 * The first of the MAX_VISIBLE_FILES rows the dialog lists (DiffFileList's
 * window): centred on the file last viewed, else where its edge rows put it.
 *
 * @param model the pane's state: the pick and the list's start
 * @param paths the listed files' paths, in order
 * @returns the first listed row's index
 */
export function dialogWindowOf(
  model: Pick<PaneState.PaneModel, 'selectedPath' | 'place'>,
  paths: readonly string[],
): number {
  const last = Math.max(0, paths.length - Limits.MAX_VISIBLE_FILES)
  const picked = paths.indexOf(model.selectedPath ?? '')
  const isPicked = model.selectedPath !== null && picked >= 0

  const wanted = isPicked
    ? picked - Math.floor(Limits.MAX_VISIBLE_FILES / 2)
    : model.place.listStart

  return Math.max(0, Math.min(last, wanted))
}
