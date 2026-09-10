/* @jsxRuntime classic */
/* @jsx h */
/* @jsxFrag Fragment */
import type { RenderElement } from 'claude-code'

import type { Kit } from '../../kit'
import Layout from '../../layout'

/**
 * The pane while a message stands in for the list (ReplDiffSidebar's
 * centered body: the first fetch, the empty state, the too-many and
 * only-hidden states): the header block, the built-in's blank row under it,
 * the message with the pickers under it, the pre-session line.
 *
 * With nothing listed below and the rows to hold it, the message's lines
 * sit where the built-in centers them (half the spare rows above, rounded
 * down; each wrapped line centered on its own), the pickers right under
 * them and the pre-session line at the foot; otherwise it all stacks from
 * the top, the pickers on the blank row the built-in leaves above the
 * pre-session line (that blank row itself when there are none).
 *
 * @param kit the elements, the width, the body's rows
 * @param pane the header block, the message's lines, the pickers, the
 *   pre-session line, and what is listed under it
 * @returns the pane's tree
 */
export function messagePaneOf(
  kit: Kit,
  pane: {
    top: readonly RenderElement[]
    message: readonly string[]
    controls: RenderElement | null
    earlier: RenderElement | null
    rest: readonly RenderElement[]
  },
): RenderElement {
  const { Box, Text } = kit.ui
  const { top, controls, earlier, rest } = pane
  const lines = pane.message.flatMap(text =>
    Layout.wrappedLines(Layout.sanitizeName(text), kit.columns),
  )
  const drawn = lines.map(line => <Text dimColor>{line}</Text>)
  const controlRows = controls === null ? [] : [controls]
  const earlierRows = earlier === null ? [] : [earlier]
  const aboveEarlier =
    controlRows.length > 0 || earlierRows.length === 0
      ? controlRows
      : [<Box height={1} />]
  const middleRows = kit.rows - top.length - 1 - (earlier === null ? 0 : 3)
  const above = Math.floor((middleRows - lines.length) / 2)
  const isCentered =
    rest.length === 0 &&
    middleRows - above - lines.length >= controlRows.length

  if (!isCentered) {
    return (
      <Box flexDirection="column">
        {[
          ...top,
          <Box height={1} />,
          ...drawn,
          ...aboveEarlier,
          ...earlierRows,
          ...rest,
        ]}
      </Box>
    )
  }

  const spacer = above > 0 ? [<Box height={above} />] : []
  const foot = earlierRows.map(row => (
    <Box flexDirection="column" marginTop={1} paddingBottom={1}>
      {row}
    </Box>
  ))

  return (
    <Box flexDirection="column" height={kit.rows}>
      {[
        ...top,
        <Box height={1} />,
        <Box flexDirection="column" height={middleRows} alignItems="center">
          {[...spacer, ...drawn, ...controlRows]}
        </Box>,
        ...foot,
      ]}
    </Box>
  )
}
