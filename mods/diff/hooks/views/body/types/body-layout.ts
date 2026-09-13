import type { Segment } from './segment'

/**
 * The docked pane's scrolling body laid out: its segments, their rows in
 * all, the window's rows, its last top, the row each file's block starts.
 */
export type BodyLayout = {
  segments: readonly Segment[]
  extent: number
  visibleRows: number
  maxTop: number
  tops: ReadonlyMap<string, number>
}
