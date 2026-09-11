import type {
  CommandRunInput,
  ProcessRunResult,
  SessionStartInput,
} from 'claude-code'
import { expect, test, tier } from 'claude-code/testing'

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
const BUILTIN_HOLDS = '"/diff" refused: it is the built-in /diff'

test('outside a git repository /diff says so and opens nothing', async ($, on) => {
  const opened: string[] = []
  on('session.start', ($, e) => ({ cwd: e.cwd }))
  on('command.register', ($, e) => ({ value: { command: e.name } }))
  on('process.run', () => ({ value: NOT_A_REPOSITORY }))
  on('ui.open', ($, e, next) => {
    opened.push(e.id)
    return next(e)
  })

  await $.session.start(SESSION)
  const { text } = await $.command.run(DIFF)

  expect(text).toContain("isn't in a git repository")
  expect(opened).toEqual([])
})

test('a git that never answers is not "no repository"', async ($, on) => {
  on('session.start', ($, e) => ({ cwd: e.cwd }))
  on('command.register', ($, e) => ({ value: { command: e.name } }))
  on('process.run', () => ({
    deny: 'git aborted: still running after 5000ms',
  }))

  await $.session.start(SESSION)
  const { text } = await $.command.run(DIFF)

  expect(text).toContain("git didn't answer")
})

test('with the built-in holding /diff, the plugin stands down', async ($, on) => {
  const logged: string[] = []
  on('session.start', ($, e) => ({ cwd: e.cwd }))
  on('command.register', () => ({ deny: BUILTIN_HOLDS }))
  on('command.run', () => ({ text: 'the built-in /diff ran' }))
  on('ui.log', ($, e) => {
    logged.push(e.text)
    return { value: undefined }
  })

  await $.session.start(SESSION)

  expect(await $.command.run(DIFF)).toEqual({ text: 'the built-in /diff ran' })
  expect(logged).toEqual([])
})

test('a refusal the built-in did not cause is said aloud', async ($, on) => {
  const logged: string[] = []
  on('session.start', ($, e) => ({ cwd: e.cwd }))
  on('command.register', () => ({ deny: '32 commands are registered already' }))
  on('ui.log', ($, e) => {
    logged.push(e.text)
    return { value: undefined }
  })

  await $.session.start(SESSION)

  expect(logged).toEqual([
    'could not register /diff: diff: $.command.register: 32 commands are ' +
      'registered already; the diff panel is unavailable this session',
  ])
})
