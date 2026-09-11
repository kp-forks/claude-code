import type { On } from 'claude-code'

/**
 * Answers what every /diff session asks first: its start, with its own
 * directory, and each command it registers, under the name asked for.
 *
 * @param on the test's `on`
 */
export function startsSession(on: On) {
  on('session.start', ($, e) => ({ cwd: e.cwd }))
  on('command.register', ($, e) => ({ value: { command: e.name } }))
}
