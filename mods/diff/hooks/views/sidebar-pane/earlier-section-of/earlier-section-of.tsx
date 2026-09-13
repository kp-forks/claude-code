/* @jsxRuntime classic */
/* @jsx h */
/* @jsxFrag Fragment */
import type { RenderElement } from 'claude-code'

import Limits from '../../../limits'
import type Entries from '../../entries'
import type { Kit } from '../../kit'
import Layout from '../../layout'
import Sections from '../../sections'
import type { BodyFrame } from '../body-frame'
import { fileBlocksOf } from '../file-blocks-of'

/**
 * The pre-session section after the body (PreSessionSection): its toggle
 * line, and once open a dim legend of every file, then their bodies.
 *
 * Past PRE_SESSION_BODY_CAP files a line says the bodies are hidden and
 * the legend alone lists them.
 *
 * @param kit the elements, the handlers, the width
 * @param entries the pre-session files, in order; none draws nothing
 * @param frame whether the section is open, the armed file, the room left
 * @returns the section's rows, none without pre-session files
 */
export function earlierSectionOf(
  kit: Kit,
  entries: readonly Entries.BodyEntry[],
  frame: BodyFrame,
): RenderElement[] {
  const { Box, Text } = kit.ui

  if (entries.length === 0) {
    return []
  }

  const face = frame.model.isPreSessionShown ? 'hide' : 'show'
  const count = Layout.plural(entries.length, 'file')

  const toggle = Sections.toggleRow(kit, 'presession', {
    label: `+${count} edited before this session (${face})`,
    onPress: kit.actions.togglePreSession,
  })

  if (!frame.model.isPreSessionShown) {
    return [toggle]
  }

  const nameRoom = Math.max(
    kit.columns - Sections.STAT_CELLS,
    Sections.PATH_FLOOR,
  )

  const legend = entries.map(entry => (
    <Box flexDirection="row">
      {[
        <Text dimColor wrap="truncate-end">
          {Layout.truncateStart(
            Layout.sanitizeName(entry.displayPath),
            nameRoom,
          )}
        </Text>,
        <Box flexGrow={1} />,
        Sections.diffStat(kit, entry.added, entry.removed),
      ]}
    </Box>
  ))

  const isCapped = entries.length > Limits.PRE_SESSION_BODY_CAP

  const bodies = isCapped
    ? [
        Sections.dimNote(
          kit,
          `diffs hidden above ${Limits.PRE_SESSION_BODY_CAP} files`,
        ),
      ]
    : fileBlocksOf(kit, entries, { ...frame, isSpaced: false }).blocks

  return [
    toggle,
    <Box flexDirection="column" marginTop={1}>
      {legend}
    </Box>,
    ...bodies,
  ]
}
