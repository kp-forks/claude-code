/* @jsxRuntime classic */
/* @jsx h */
/* @jsxFrag Fragment */
import type { RenderElement } from 'claude-code'

import Names from '../../names'
import PaneState from '../../pane-state'
import CurrentPane from '../current-pane'
import Detail from '../detail'
import Entries from '../entries'
import type { Kit } from '../kit'
import Layout from '../layout'
import { preludeOf } from '../prelude-of'
import Sections from '../sections'
import { earlierSectionOf } from './earlier-section-of'
import { fileBlocksOf } from './file-blocks-of'
import { listRowsOf } from './list-rows-of'

/**
 * The docked pane (ReplDiffSidebarBody): header, pickers, todo bar, the
 * list, then every listed file's hunks stacked, the pre-session after.
 *
 * A row's press scrolls the body to its file. Over a picked turn the rows
 * and bodies are that turn's edits. With nothing to list, messagePaneOf
 * centers the empty state under the pickers.
 *
 * @param kit the elements, the handlers, the width, the rows
 * @param model the pane's state
 * @returns the pane's tree
 */
export function sidebarPane(
  kit: Kit,
  model: PaneState.PaneModel,
): RenderElement {
  const { Box } = kit.ui
  const { data } = model
  const turn = PaneState.pickedTurnOf(model)

  const prelude = preludeOf(kit, model)

  if (prelude) {
    return prelude
  }

  const noise = model.isNoiseShown ? 'shown' : 'hidden'
  const partition = PaneState.partitionOf(data?.files ?? [], noise)

  const totals = turn
    ? PaneState.turnTotalsOf(turn)
    : data
      ? PaneState.headerTotalsOf(data, partition)
      : PaneState.ZERO_TOTALS

  const empty = turn ? null : PaneState.emptyStateOf(model, totals.filesCount)

  const noteOf = (text: string | null): RenderElement | null =>
    text === null ? null : Sections.dimNote(kit, Layout.sanitizeName(text))

  const subline = turn
    ? noteOf(`Turn ${turn.index} "${turn.preview}"`)
    : noteOf(PaneState.unbornNoteOf(model, totals.filesCount))

  const entries = turn
    ? turn.files.map(Entries.turnEntryOf)
    : partition.shown.map(file => Entries.bodyEntryOf(file, model))

  const earlier = turn
    ? []
    : partition.preSession.map(file => Entries.bodyEntryOf(file, model))

  const listed = turn
    ? entries
    : CurrentPane.listBodyOf(kit, { data, partition, totals, empty })

  const notes = listed.flatMap(line => (typeof line === 'string' ? [line] : []))
  const hasRows = notes.length < listed.length
  const message = empty ? [empty.headline, ...notes] : hasRows ? [] : notes

  const header = Sections.headerView(
    kit,
    empty ? null : totals,
    Sections.controlsView(kit, model),
  )

  const hasNoise = !turn && partition.noiseCount > 0
  const noiseFace = model.isNoiseShown ? 'hide' : 'show'

  const noiseToggle = hasNoise
    ? Sections.toggleRow(kit, 'noise', {
        label:
          `${Layout.plural(partition.noiseCount, 'test')}/generated ` +
          `(${noiseFace})`,
        onPress: kit.actions.toggleNoise,
      })
    : null

  const isUntrackedNoted =
    !turn && data?.isUntrackedWithheld === true && empty === null

  const untrackedNote = noteOf(
    isUntrackedNoted ? Names.untrackedWithheldTextOf(model) : null,
  )

  const body = fileBlocksOf(kit, hasRows ? entries : [], {
    model,
    room: Detail.BODY_BUDGET,
    isSpaced: true,
  })

  const earlierRows = earlierSectionOf(kit, earlier, {
    model,
    room: body.room,
    isSpaced: false,
  })

  const top = Sections.present([header, subline, Sections.todoBar(kit, model)])

  const isMessageShown = message.length > 0

  if (isMessageShown) {
    return CurrentPane.messagePaneOf(kit, {
      top: Sections.present([...top, noiseToggle, untrackedNote]),
      message,
      controls: null,
      earlier: earlierRows[0] ?? null,
      rest: earlierRows.slice(1),
    })
  }

  const list = (
    <Box flexDirection="column" marginTop={1} marginBottom={1}>
      {Sections.present([
        ...listRowsOf(kit, entries, totals.notShown),
        untrackedNote,
        noiseToggle,
      ])}
    </Box>
  )

  return (
    <Box flexDirection="column">
      {[...top, list, ...body.blocks, ...earlierRows]}
    </Box>
  )
}
