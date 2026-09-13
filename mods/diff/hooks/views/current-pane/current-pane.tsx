/* @jsxRuntime classic */
/* @jsx h */
/* @jsxFrag Fragment */
import type { RenderElement } from 'claude-code'

import type Git from '../../git'
import Names from '../../names'
import PaneState from '../../pane-state'
import Entries from '../entries'
import type { Kit } from '../kit'
import Layout from '../layout'
import { preludeOf } from '../prelude-of'
import Sections from '../sections'
import { selectedDetailOf } from '../selected-detail-of'
import { dialogRowsOf } from './dialog-rows-of'
import { listBodyOf } from './list-body-of'
import { messagePaneOf } from './message-pane-of'

/**
 * The inline pane over the repository's diff now (DiffDialog): header,
 * pickers, todo bar, the rows round the selected file, that file's detail.
 *
 * The toggle sits above the rows; the elision count, withheld-untracked
 * note and pre-session line below. With nothing to list, messagePaneOf
 * draws the body.
 *
 * @param kit the elements, the handlers, the width, the rows
 * @param model the pane's state
 * @returns the pane's tree
 */
export function currentPane(
  kit: Kit,
  model: PaneState.PaneModel,
): RenderElement {
  const { Box } = kit.ui
  const { data } = model
  const prelude = preludeOf(kit, model)

  if (prelude) {
    return prelude
  }

  const noise = model.isNoiseShown ? 'shown' : 'hidden'
  const preSession = model.isPreSessionShown ? 'shown' : 'hidden'
  const partition = PaneState.partitionOf(data?.files ?? [], noise)

  const totals = data
    ? PaneState.headerTotalsOf(data, partition)
    : PaneState.ZERO_TOTALS

  const empty = PaneState.emptyStateOf(model, totals.filesCount)

  const selected = PaneState.selectionOf(
    PaneState.listedOf(partition, preSession),
    model.selectedPath,
  )

  const selectedPath = selected?.path ?? null

  const noteOf = (text: string | null): RenderElement | null =>
    text === null ? null : Sections.dimNote(kit, Layout.sanitizeName(text))

  const noiseFace = model.isNoiseShown ? 'hide' : 'show'
  const noiseCount = Layout.plural(partition.noiseCount, 'test')
  const hasNoise = partition.noiseCount > 0

  const noiseToggle = hasNoise
    ? Sections.toggleRow(kit, 'noise', {
        label: `${noiseCount}/generated (${noiseFace})`,
        onPress: kit.actions.toggleNoise,
      })
    : null

  const earlierFace = model.isPreSessionShown ? 'hide' : 'show'
  const earlierCount = Layout.plural(partition.preSession.length, 'file')
  const hasEarlier = partition.preSession.length > 0

  const earlierToggle = hasEarlier
    ? Sections.toggleRow(kit, 'presession', {
        label: `+${earlierCount} edited before this session (${earlierFace})`,
        onPress: kit.actions.togglePreSession,
      })
    : null

  const earlierFiles = model.isPreSessionShown ? partition.preSession : []
  const isEarlierListed = earlierFiles.length > 0

  const earlierRows = isEarlierListed
    ? [<Box height={1} />, ...dialogRowsOf(kit, earlierFiles, selectedPath)]
    : []

  const isUntrackedNoted = data?.isUntrackedWithheld === true && !empty
  const listed = listBodyOf(kit, { data, partition, totals, empty })

  const notes = listed.flatMap(line => (typeof line === 'string' ? [line] : []))

  const rows = listed.filter(
    (line): line is Git.FileStat => typeof line !== 'string',
  )

  const hasRows = rows.length > 0
  const message = empty ? [empty.headline, ...notes] : hasRows ? [] : notes
  const header = Sections.headerView(kit, empty ? null : totals, null)
  const subline = noteOf(PaneState.unbornNoteOf(model, totals.filesCount))

  const notShownNote = noteOf(
    totals.notShown > 0 ? `${totals.notShown} not shown` : null,
  )

  const untrackedNote = noteOf(
    isUntrackedNoted ? Names.untrackedWithheldTextOf(model) : null,
  )

  const detail = selectedDetailOf(
    kit,
    selected ? Entries.bodyEntryOf(selected, model) : null,
    model,
  )

  const top = Sections.present([
    Sections.titleRow(kit, PaneState.dialogTitleOf(model)),
    header,
    subline,
    Sections.controlsView(kit, model),
    Sections.todoBar(kit, model),
    noiseToggle,
  ])

  const isMessageShown = message.length > 0

  return isMessageShown ? (
    messagePaneOf(kit, {
      top: Sections.present([...top, notShownNote, untrackedNote]),
      message,
      controls: null,
      earlier: earlierToggle,
      rest: [...earlierRows, ...detail],
    })
  ) : (
    <Box flexDirection="column">
      {Sections.present([
        ...top,
        ...dialogRowsOf(kit, rows, selectedPath),
        ...notes.map(noteOf),
        notShownNote,
        untrackedNote,
        hasEarlier ? <Box height={1} /> : null,
        earlierToggle,
        ...earlierRows,
        ...detail,
      ])}
    </Box>
  )
}
