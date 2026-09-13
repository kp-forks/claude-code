/* @jsxRuntime classic */
/* @jsx h */
/* @jsxFrag Fragment */
import type { RenderElement } from 'claude-code'

import Git from '../../../git'
import Detail from '../../detail'
import type { Kit } from '../../kit'
import Layout from '../../layout'
import type { HunkSegment } from '../types'

/**
 * One hunk of the docked body as the engine's diff `Code` block, drawn from
 * the line holding a wrapped row of it on (hunkAfter); whole at row 0.
 *
 * @param kit the elements
 * @param segment the hunk, whose file it is, the rows its lines take
 * @param skip the wrapped rows the window's top cuts from it
 * @returns the block
 */
export function hunkCodeOf(
  kit: Kit,
  segment: HunkSegment,
  skip: number,
): RenderElement {
  const { Code } = kit.ui

  let passed = 0
  let first = 0

  for (const rows of segment.lineRows) {
    if (passed + rows > skip) {
      break
    }

    passed += rows
    first += 1
  }

  return (
    <Code
      source={Detail.hunkSourceOf(Git.hunkAfter(segment.hunk, first))}
      format="diff"
      path={Layout.sanitizeName(segment.path).slice(-Detail.MAX_CODE_CHARS)}
    />
  )
}
