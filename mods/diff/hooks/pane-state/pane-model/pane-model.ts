import type Backend from '../../backend'
import type Git from '../../git'
import type Todos from '../../todos'
import type Turns from '../../turns'
import type { Bodies } from '../bodies'
import type { Source } from '../source'

/**
 * Everything one drawing of the pane reads.
 *
 * The last good fetch, what the person picked, the files' bodies read so
 * far, the transcript's turns and todos, where the surface seated the pane
 * last, and the pinned backend's words and base modes (git's until pinned).
 */
export type PaneModel = {
  words: Backend.BackendWords
  baseModes: readonly Git.BaseMode[]
  isLoading: boolean
  hasSettled: boolean
  isOutsideRepository: boolean
  data: Git.DiffData | null
  requestedMode: Git.BaseMode
  selectedPath: string | null
  isNoiseShown: boolean
  isPreSessionShown: boolean
  source: Source
  turns: readonly Turns.TurnDiff[]
  bodies: Bodies
  todos: Todos.TodoProgress
  armedPath: string | null
  placement: 'dock' | 'inline'
}
