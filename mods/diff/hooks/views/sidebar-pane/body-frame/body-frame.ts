import type PaneState from '../../../pane-state'
import type Detail from '../../detail'

/**
 * What drawing a run of file bodies takes besides the files: the pane's
 * state they read, the room left, and whether a blank row parts the files.
 */
export type BodyFrame = {
  model: Pick<PaneState.PaneModel, 'armedPath' | 'words' | 'isPreSessionShown'>
  room: Detail.BodyRoom

  /**
   * True in the session's body, whose files the built-in parts with a blank
   * row; false among the pre-session bodies, which it stacks flush.
   */
  isSpaced: boolean
}
