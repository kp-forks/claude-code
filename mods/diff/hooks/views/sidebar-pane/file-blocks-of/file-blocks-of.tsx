/* @jsxRuntime classic */
/* @jsx h */
/* @jsxFrag Fragment */
import type { RenderElement } from 'claude-code'

import Detail from '../../detail'
import Entries from '../../entries'
import type { Kit } from '../../kit'
import Sections from '../../sections'
import type { BodyFrame } from '../body-frame'
import type { DrawnBlocks } from '../drawn-blocks'

/**
 * Every listed file's detail, one under the other as ReplDiffSidebar's
 * body stacks them: a rule, the file (Detail.detailView), a gap if spaced.
 *
 * Each block is keyed (Sections.bodyKeyOf) so a row's press scrolls to it.
 * The bodies share one budget in drawing order; a file it runs out on
 * draws truncated, as its footer says.
 *
 * @param kit the elements, the handlers, the width
 * @param entries the files, in drawing order
 * @param frame the pane's state the details read, and the room they share
 * @returns the blocks, and the room left after the last
 */
export function fileBlocksOf(
  kit: Kit,
  entries: readonly Entries.BodyEntry[],
  frame: BodyFrame,
): DrawnBlocks {
  const { Box } = kit.ui
  const blocks: RenderElement[] = []
  const gap = frame.isSpaced ? [<Box height={1} />] : []

  let { room } = frame

  for (const entry of entries) {
    const drawn = Detail.detailView(
      kit,
      Entries.detailModelOf(entry, frame.model),
      { room, onToggleAsk: () => kit.actions.toggleAsk(entry.path) },
    )

    room = drawn.room

    blocks.push(
      <Box key={Sections.bodyKeyOf(entry.path)} flexDirection="column">
        {[Sections.divider(kit), drawn.element, ...gap]}
      </Box>,
    )
  }

  return { blocks, room }
}
