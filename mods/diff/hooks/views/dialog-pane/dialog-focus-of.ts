import type PaneState from '../../pane-state'
import Sections from '../sections'
import { dialogEntriesOf } from './dialog-entries-of'
import { dialogWindowOf } from './dialog-window-of'

/**
 * What the focus ring landing on a dialog row makes of the list: that file
 * selected, the window re-centred, the key of the row drawn where it sits.
 *
 * DiffFileList's selection. The engine keeps its ring by position, so the
 * ring is sent to the row that holds the selected file's place once the
 * window has moved; null for a key that is none of the listed rows'.
 *
 * @param model the pane's state
 * @param element the key of the element taking the ring
 * @returns the selected path and the key to land the ring on, or null
 */
export function dialogFocusOf(
  model: PaneState.PaneModel,
  element: string | undefined,
): PaneState.DialogFocus | null {
  const entries = dialogEntriesOf(model)
  const paths = entries.map(entry => entry.path)
  const keys = entries.map(entry => Sections.fileKeyOf(entry))
  const picked = keys.indexOf(element ?? '')
  const selectedPath = paths[picked] ?? null
  const after = dialogWindowOf({ selectedPath }, paths)
  const landing = keys[dialogWindowOf(model, paths) + picked - after]
  const isRow = selectedPath !== null && landing !== undefined

  return isRow ? { selectedPath, landing } : null
}
