/* @jsxRuntime classic */
/* @jsx h */
/* @jsxFrag Fragment */
import type { RenderElement } from 'claude-code'

import Names from '../names'
import PaneState from '../pane-state'
import { currentPane } from './current-pane'
import type { Kit } from './kit'
import Sections from './sections'
import { turnPane } from './turn-pane'

/**
 * The diff pane's body for one `ui.render`: the repository's diff now, or
 * the picked turn's edits while that turn still exists (a rewind drops it).
 *
 * Seated inline (no room beside the transcript), only the built-in's line
 * asking for a wider terminal, as the built-in shows no panel there.
 *
 * @param kit the elements, the handlers, the width
 * @param model the pane's state
 * @param placement where the surface seated the pane (`props.placement`)
 * @returns the tree
 */
export function paneView(
  kit: Kit,
  model: PaneState.PaneModel,
  placement: 'dock' | 'inline',
): RenderElement {
  const { Box } = kit.ui
  const turn = PaneState.pickedTurnOf(model)
  const isCurrent = turn === undefined

  if (placement === 'inline') {
    return <Box>{Sections.dimNote(kit, Names.RESIZE_TERMINAL_TEXT)}</Box>
  }

  return isCurrent ? currentPane(kit, model) : turnPane(kit, model, turn)
}
