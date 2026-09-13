import type { BodyRoom } from '../body-room'

/**
 * What drawing one file's detail takes besides the file: the room the
 * pane's bodies have left, and the press that arms or disarms its ask.
 */
export type DetailDraw = {
  room: BodyRoom

  /**
   * Arms the file for the next prompt, or disarms it.
   */
  onToggleAsk: () => void
}
