/* @jsxRuntime classic */
/* @jsx h */
/* @jsxFrag Fragment */
import type { RenderElement } from 'claude-code'

import PaneState from '../../pane-state'
import type Turns from '../../turns'
import Entries from '../entries'
import type { Kit } from '../kit'
import Sections from '../sections'
import { selectedDetailOf } from '../selected-detail-of'

/**
 * The inline pane over one past turn's edits (DiffDialog's T<n> tab): its
 * counts, its prompt's opening words, the pickers, its files, one body.
 *
 * @param kit the elements, the handlers, the width
 * @param model the pane's state
 * @param turn the turn picked
 * @returns the pane's tree
 */
export function turnPane(
  kit: Kit,
  model: PaneState.PaneModel,
  turn: Turns.TurnDiff,
): RenderElement {
  const { Box } = kit.ui

  const selected =
    turn.files.find(file => file.path === model.selectedPath) ??
    turn.files[0] ??
    null

  const rows = turn.files.map(file =>
    Sections.dialogFileRow(
      kit,
      {
        key: Sections.fileKeyOf(file.path),
        path: file.path,
        displayPath: file.path,
        added: file.added,
        removed: file.removed,
        note: null,
        isSelected: file.path === selected?.path,
      },
      () => kit.actions.selectFile(file.path),
    ),
  )

  const detail = selectedDetailOf(
    kit,
    selected ? Entries.turnEntryOf(selected) : null,
    model,
  )

  return (
    <Box flexDirection="column">
      {Sections.present([
        Sections.titleRow(kit, PaneState.dialogTitleOf(model)),
        Sections.headerView(kit, PaneState.turnTotalsOf(turn), null),
        Sections.controlsView(kit, model),
        ...rows,
        ...detail,
      ])}
    </Box>
  )
}
