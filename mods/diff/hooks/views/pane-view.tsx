/* @jsxRuntime classic */
/* @jsx h */
/* @jsxFrag Fragment */
import type { RenderElement } from 'claude-code'

import Limits from '../limits'
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
 * Seated inline, only the built-in's wider-terminal line, as it shows no
 * panel there; docked, the built-in's blank row above the header and blank
 * last column, so rows sit and wrap where the built-in's do.
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

  const right = Limits.PANE_RIGHT_PAD_COLUMNS
  const top = Limits.PANE_TOP_PAD_ROWS
  const inset: Kit = {
    ...kit,
    columns: Math.max(1, kit.columns - right),
    rows: Math.max(0, kit.rows - top),
  }

  return (
    <Box flexDirection="column" paddingTop={top} paddingRight={right}>
      {isCurrent ? currentPane(inset, model) : turnPane(inset, model, turn)}
    </Box>
  )
}
