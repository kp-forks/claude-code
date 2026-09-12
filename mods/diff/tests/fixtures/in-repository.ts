import type { Args, On } from 'claude-code'
import { mock } from 'claude-code/testing'

import { gitIn } from './git-in.js'
import { HINT_DRAWN } from './hint-drawn.js'
import { keeping } from './keeping.js'
import { startsSession } from './starts-session.js'

/**
 * A session in /work (REPOSITORY), keeping each git run and each pane
 * opened or closed.
 *
 * The store starts empty, the clock at 0, and the engine draws the hint.
 *
 * @param on the test's `on`
 * @returns the runs, the panes opened and closed, and the session's clock
 */
export function inRepository(on: On) {
  const runs: Args<'process.run'>[] = []
  const opened = keeping<Args<'ui.open'>>()
  const closed = keeping<Args<'ui.close'>>()
  const clock = startsSession(on)
  on('process.run', ($, e) => {
    runs.push(e)

    return { value: gitIn(e.argv) }
  })
  on('ui.open', opened.hook)
  on('ui.close', closed.hook)
  on('ui.invalidate', () => ({ value: undefined }))
  on('ui.render', { component: 'PromptHint' }, () => HINT_DRAWN)
  on('session.messages', () => ({ value: [] }))
  mock.store(on)

  return { runs, opened: opened.kept, closed: closed.kept, clock }
}
