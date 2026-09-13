/* @jsxRuntime classic */
/* @jsx h */
/* @jsxFrag Fragment */
import type { RenderElement } from 'claude-code'

import type { Kit } from '../../kit'
import type { KeyedPressable } from '../keyed-pressable'

/**
 * One row of a file list: a plain Button under its key, then whatever the
 * row shows at its right edge (its counts, a note).
 *
 * @param kit the elements
 * @param row the Button's key, label and press, and whether it rests dim
 * @param tail the element at the right edge
 * @returns the row element
 */
export function listRow(
  kit: Kit,
  row: KeyedPressable,
  tail: RenderElement,
): RenderElement {
  const { Box, Button } = kit.ui

  return (
    <Box flexDirection="row">
      <Button key={row.key} plain dimColor={row.isDim} onPress={row.onPress}>
        {row.label}
      </Button>
      <Box flexGrow={1} />
      {tail}
    </Box>
  )
}
