/* @jsxRuntime classic */
/* @jsx h */
/* @jsxFrag Fragment */
import type { RenderElement } from 'claude-code'

import Limits from '../../../limits'
import type { Kit } from '../../kit'

/**
 * A list's `more` row as a dim plain Button that moves its window: the
 * docked list's a file, under the built-in's keys too; the dialog's a page.
 *
 * The built-in dialog moves its window with the selection; a plugin cannot
 * see the person walk the rows, so there the row itself carries the move.
 *
 * @param kit the elements and the handlers
 * @param edge which list and which edge, the Button's key
 * @param label the row's text
 * @returns the Button
 */
export function listEdgeButton(
  kit: Kit,
  edge: 'list-up' | 'list-down' | 'files-up' | 'files-down',
  label: string,
): RenderElement {
  const { Button } = kit.ui
  const isDocked = edge === 'list-up' || edge === 'list-down'
  const isUp = edge === 'list-up' || edge === 'files-up'
  const size = isDocked ? 1 : Limits.MAX_VISIBLE_FILES
  const action = isUp ? 'app:diffFileListUp' : 'app:diffFileListDown'

  return (
    <Button
      key={edge}
      plain
      dimColor
      {...(isDocked ? { action } : {})}
      onPress={() => kit.actions.scrollList(isUp ? -size : size)}
    >
      {label}
    </Button>
  )
}
