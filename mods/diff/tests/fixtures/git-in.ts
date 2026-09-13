import type { ProcessRunResult } from 'claude-code'

import { NOT_A_REPOSITORY } from './not-a-repository.js'

/**
 * What git answers in /work; an invocation the answers do not know fails
 * as git does outside a repository.
 *
 * @param argv the invocation, program first
 * @param answers git's output by a key the invocation's command line holds
 * @returns git's exit code and output
 */
export function gitIn(
  argv: readonly string[],
  answers: Readonly<Record<string, string>>,
): ProcessRunResult {
  const line = argv.join(' ')
  const found = Object.entries(answers).find(([key]) => line.includes(key))

  return found
    ? { exitCode: 0, stdout: found[1], stderr: '' }
    : NOT_A_REPOSITORY
}
