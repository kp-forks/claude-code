/* @jsxRuntime classic */
/* @jsx h */
/* @jsxFrag Fragment */
import type { RenderElement } from 'claude-code'

import Git from '../../../git'
import Limits from '../../../limits'
import type { Kit } from '../../kit'
import Layout from '../../layout'
import Sections from '../../sections'
import { fileRowOf } from '../file-row-of'

/**
 * The inline list (DiffFileList): MAX_DIALOG_ROWS rows round the selected
 * file, the pointer on it, and over a longer list a dim count each side.
 *
 * A side with no file out of the window keeps its row, blank.
 *
 * @param kit the elements, the handlers, the width
 * @param files the listed files, in order
 * @param selectedPath the selected file's path, or null
 * @returns the rows
 */
export function dialogRowsOf(
  kit: Kit,
  files: readonly Git.FileStat[],
  selectedPath: string | null,
): RenderElement[] {
  const selected = Math.max(
    0,
    files.findIndex(file => file.path === selectedPath),
  )

  const isPaged = files.length > Limits.MAX_DIALOG_ROWS

  const last = Math.min(
    files.length,
    Math.max(0, selected - Math.floor(Limits.MAX_DIALOG_ROWS / 2)) +
      Limits.MAX_DIALOG_ROWS,
  )

  const first = Math.max(0, last - Limits.MAX_DIALOG_ROWS)
  const above = first
  const below = files.length - last

  const edgeOf = (count: number, arrow: string): RenderElement =>
    Sections.dimNote(
      kit,
      count > 0 ? ` ${arrow} ${Layout.plural(count, 'more file')}` : ' ',
    )

  const rows = files
    .slice(first, last)
    .map(file =>
      Sections.dialogFileRow(kit, fileRowOf(file, selectedPath), () =>
        kit.actions.selectFile(file.path),
      ),
    )

  return isPaged ? [edgeOf(above, '↑'), ...rows, edgeOf(below, '↓')] : rows
}
