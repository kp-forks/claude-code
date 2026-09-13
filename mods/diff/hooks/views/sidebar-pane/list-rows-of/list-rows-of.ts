import type { RenderElement } from 'claude-code'

import { keptOf } from '../../../kept-of'
import Limits from '../../../limits'
import type Entries from '../../entries'
import type { Kit } from '../../kit'
import Layout from '../../layout'
import Sections from '../../sections'

/**
 * The docked list (ReplDiffSidebar's summary rows): MAX_SUMMARY_ROWS files
 * as rows that scroll the body to their file, then a dim count of the rest.
 *
 * The rest are the rows below the window and the files past the row cap.
 * The built-in moves this window with the wheel over it or a chord; a pane
 * has neither, so the window stays at the top and names no key.
 *
 * @param kit the elements, the handlers, the width
 * @param entries the listed files, in order
 * @param notShown how many session files fell past the row cap
 * @returns the rows
 */
export function listRowsOf(
  kit: Kit,
  entries: readonly Entries.BodyEntry[],
  notShown: number,
): RenderElement[] {
  const shown = entries.slice(0, Limits.MAX_SUMMARY_ROWS)
  const moreBelow = entries.length - shown.length

  const rows = shown.map(entry =>
    Sections.fileRow(
      kit,
      {
        key: Sections.fileKeyOf(entry.path),
        path: entry.path,
        displayPath: entry.displayPath,
        added: entry.added,
        removed: entry.removed,
        note: null,
        isSelected: false,
      },
      () => kit.actions.selectFile(entry.path),
    ),
  )

  const counts = keptOf([
    moreBelow > 0 ? `${moreBelow} more below` : null,
    notShown > 0 ? `${notShown} not shown` : null,
  ])

  const lead = moreBelow > 0 ? '↓ ' : '… '
  const hasCounts = counts.length > 0
  const more = Layout.sanitizeName(`${lead}${counts.join(' · ')}`)

  return hasCounts ? [...rows, Sections.dimNote(kit, more)] : rows
}
