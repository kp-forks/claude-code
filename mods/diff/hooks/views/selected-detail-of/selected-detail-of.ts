import type { RenderElement } from 'claude-code'

import type PaneState from '../../pane-state'
import Detail from '../detail'
import Entries from '../entries'
import type { Kit } from '../kit'
import Sections from '../sections'

/**
 * The inline pane's one body: a rule, then the selected file's detail with
 * the whole body budget to itself; nothing when no file is selected.
 *
 * @param kit the elements, the handlers, the width
 * @param entry the selected file, or null
 * @param model which file is armed, and the backend's words
 * @returns the rule and the detail, or none
 */
export function selectedDetailOf(
  kit: Kit,
  entry: Entries.BodyEntry | null,
  model: Pick<PaneState.PaneModel, 'armedPath' | 'words'>,
): RenderElement[] {
  if (!entry) {
    return []
  }

  const drawn = Detail.detailView(kit, Entries.detailModelOf(entry, model), {
    room: Detail.BODY_BUDGET,
    onToggleAsk: () => kit.actions.toggleAsk(entry.path),
  })

  return [Sections.divider(kit), drawn.element]
}
