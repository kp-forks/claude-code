/* @jsxRuntime classic */
/* @jsx h */
/* @jsxFrag Fragment */
import type { RenderElement } from 'claude-code'

import Limits from '../limits'
import Names from '../names'
import PaneState from '../pane-state'
import { currentPane } from './current-pane'
import { insetOf } from './inset-of'
import type { Kit } from './kit'
import type { PaneSeat } from './pane-seat'
import Sections from './sections'
import { sidebarPane } from './sidebar-pane'
import { turnPane } from './turn-pane'

/**
 * The diff pane's body for one `ui.render`: docked, the built-in panel's
 * layout (sidebarPane); inline, its dialog's, or its wider-terminal line.
 *
 * Inline for want of width (under OPEN_MIN_COLUMNS) the built-in shows no
 * panel, only that line; inline on a wider terminal there is no fullscreen
 * layout, where it shows its dialog. Docked, its blank top row and column.
 *
 * @param kit the elements, the handlers, the width
 * @param model the pane's state
 * @param seat where the surface seated the pane, and the terminal's width
 * @returns the tree
 */
export function paneView(
  kit: Kit,
  model: PaneState.PaneModel,
  seat: PaneSeat,
): RenderElement {
  const { Box } = kit.ui
  const isDocked = seat.placement === 'dock'

  const isNarrow =
    seat.terminalColumns !== null &&
    seat.terminalColumns < Limits.OPEN_MIN_COLUMNS

  function dialogOf(): RenderElement {
    const turn = PaneState.pickedTurnOf(model)

    return turn ? turnPane(kit, model, turn) : currentPane(kit, model)
  }

  return isDocked ? (
    <Box
      flexDirection="column"
      paddingTop={Limits.PANE_TOP_PAD_ROWS}
      paddingRight={Limits.PANE_RIGHT_PAD_COLUMNS}
    >
      {sidebarPane(insetOf(kit), model)}
    </Box>
  ) : isNarrow ? (
    <Box>{Sections.dimNote(kit, Names.RESIZE_TERMINAL_TEXT)}</Box>
  ) : (
    <Box flexDirection="column">{dialogOf()}</Box>
  )
}
