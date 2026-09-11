import type {
  CommandRunInput,
  ProcessRunResult,
  SessionStartInput,
} from 'claude-code'
import { clock, expect, test, tier } from 'claude-code/testing'

tier('builtin')

const SESSION: SessionStartInput = {
  surface: 'terminal',
  isInteractive: true,
  cwd: '/work',
}
const DIFF: CommandRunInput = {
  command: 'diff',
  args: '',
  origin: { kind: 'composer' },
}
const NOT_A_REPOSITORY: ProcessRunResult = {
  exitCode: 128,
  stdout: '',
  stderr: 'fatal: not a git repository',
}
const GIT_TIMEOUT_MS = 5000
const GIT_HUNG = `git aborted: still running after ${GIT_TIMEOUT_MS}ms`

test('/diff at boot joins the boot probe, then asks again', async ($, on) => {
  const probes: (readonly string[])[] = []
  on('session.start', ($, e) => ({ cwd: e.cwd }))
  on('command.register', ($, e) => ({ value: { command: e.name } }))
  on('process.run', async ($, e) => {
    probes.push(e.argv)

    if (probes.length === 1) {
      await clock.sleep(GIT_TIMEOUT_MS)

      return { deny: GIT_HUNG }
    }

    return { value: NOT_A_REPOSITORY }
  })

  const booting = $.session.start(SESSION)
  await clock.advance(0)
  const ran = $.command.run(DIFF)
  await clock.advance(0)

  expect(probes, 'the boot probe, which /diff joined').toHaveLength(1)

  await clock.advance(GIT_TIMEOUT_MS)
  await booting

  expect(await ran).toEqual({
    text: expect.stringContaining("isn't in a git repository"),
  })
  expect(probes, 'then one more of its own').toHaveLength(2)
})
