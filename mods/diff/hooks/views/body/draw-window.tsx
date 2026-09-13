/* @jsxRuntime classic */
/* @jsx h */
/* @jsxFrag Fragment */
import type { RenderElement } from 'claude-code'

import Limits from '../../limits'
import type { Kit } from '../kit'
import Sections from '../sections'
import Plan from './plan'
import type { BodyLayout, Segment } from './types'

/**
 * The rows of the docked body its window shows from a row down: each
 * segment drawn from the row the window cuts it at, until the window fills.
 *
 * A hunk cut by the window's top draws from the line holding that row on;
 * rows past its foot are the pane's to clip, so a few more are drawn than
 * fit (SCROLL_MARGIN_ROWS) lest a miscounted wrap leave it short.
 *
 * @param kit the elements, the handlers, the width
 * @param layout the body laid out
 * @param top the body row wanted at the window's top; clamped to the body
 * @returns the elements, top to bottom
 */
export function drawWindow(
  kit: Kit,
  layout: BodyLayout,
  top: number,
): RenderElement[] {
  const { Box, Text } = kit.ui
  const drawn: RenderElement[] = []
  const wanted = layout.visibleRows + Limits.SCROLL_MARGIN_ROWS
  const at = Math.max(0, Math.min(top, layout.maxTop))
  const onPress = kit.actions.togglePreSession

  let start = 0
  let filled = 0

  function elementOf(segment: Segment, skip: number): RenderElement {
    switch (segment.kind) {
      case 'rule':
        return Sections.divider(kit)
      case 'blank':
        return <Box height={1} />
      case 'name':
        return Sections.nameRow(kit, segment.name)
      case 'hunk':
        return Plan.hunkCodeOf(kit, segment, skip)
      case 'note':
        return (
          <Text dimColor italic wrap="wrap">
            {segment.text}
          </Text>
        )
      case 'footer':
        return (
          <Text dimColor italic>
            … diff truncated (exceeded 400 line limit)
          </Text>
        )
      case 'text':
        return Sections.dimNote(kit, segment.text)
      case 'toggle':
        return Sections.toggleRow(kit, 'presession', { ...segment, onPress })
      case 'legend':
        return Sections.legendRow(kit, segment.entry)
    }
  }

  for (const segment of layout.segments) {
    const rows = Plan.segmentRowsOf(segment)
    const isShown = start + rows > at && filled < wanted

    if (isShown) {
      const skip = Math.max(0, at - start)

      drawn.push(elementOf(segment, skip))
      filled += rows - skip
    }

    start += rows
  }

  return drawn
}
