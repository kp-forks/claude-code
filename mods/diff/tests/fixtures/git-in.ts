import type { ProcessRunResult } from 'claude-code'

import { NOT_A_REPOSITORY } from './not-a-repository.js'
import { REPOSITORY } from './repository.js'

/**
 * What git answers in /work (REPOSITORY); an invocation it does not know
 * fails as git does outside a repository.
 *
 * @param argv the invocation, program first
 * @returns git's exit code and output
 */
export function gitIn(argv: readonly string[]): ProcessRunResult {
  const line = argv.join(' ')
  const found = Object.entries(REPOSITORY).find(([key]) => line.includes(key))

  return found
    ? { exitCode: 0, stdout: found[1], stderr: '' }
    : NOT_A_REPOSITORY
}
