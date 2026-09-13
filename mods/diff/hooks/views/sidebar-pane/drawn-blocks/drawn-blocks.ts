import type { RenderElement } from 'claude-code'

import type Detail from '../../detail'

/**
 * A run of file bodies as drawn, and the room left for whatever follows.
 */
export type DrawnBlocks = {
  blocks: RenderElement[]
  room: Detail.BodyRoom
}
