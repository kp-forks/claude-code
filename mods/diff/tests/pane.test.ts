import type {
  Args,
  CommandRunInput,
  On,
  ProcessRunResult,
  RenderElement,
  RenderInput,
} from 'claude-code'
import {
  clock,
  describe,
  expect,
  memoryStore,
  test,
  textOf,
  tier,
} from 'claude-code/testing'

import Fixtures from './fixtures'

const CLEAR: CommandRunInput = {
  command: 'clear',
  args: '',
  origin: { kind: 'composer' },
}
const PANE: RenderInput<'Pane'> = {
  component: 'Pane',
  surface: 'terminal',
  requestId: 'diff',
  viewport: { columns: 160, rows: 40 },
  props: {
    title: 'Diff',
    isFocused: false,
    bodyColumns: 80,
    placement: 'dock',
    scroll: { offset: 0, bodyRows: 30 },
  },
}
/**
 * The prompt's hint on a 160-column terminal: drawing it is how the plugin
 * learns how wide the terminal is.
 */
const HINT: RenderInput<'PromptHint'> = {
  component: 'PromptHint',
  surface: 'terminal',
  requestId: 'hint',
  viewport: { columns: 160, rows: 40 },
  props: { isDraft: false, isWorking: false, hint: '' },
}
/**
 * What the engine draws for the hint, standing in beneath the plugin.
 */
const HINT_DRAWN: RenderElement = {
  type: 'Text',
  children: ['? for shortcuts'],
}
/**
 * Git's output in /work, where one file changed, for each invocation whose
 * command line holds the key.
 */
const REPOSITORY: Readonly<Record<string, string>> = {
  'rev-parse --path-format=absolute': '/work\n/work/.git\n/work/.git\n',
  'HEAD --shortstat': ' 1 file changed, 1 insertion(+)',
  'HEAD --numstat': '1\t0\tapp.ts\0',
  'ls-files': '',
  '-- app.ts': '@@ -1 +1 @@\n-const a = 1\n+const a = 2\n',
}
/**
 * Longer than every wait the pane schedules before it fetches and draws
 * (its open probe, refresh debounce and redraw), short of its HEAD poll.
 */
const SETTLE_MS = 1000

tier('builtin')

/**
 * What git answers in that repository; an invocation it does not know
 * fails as git does outside a repository.
 */
function gitIn(argv: readonly string[]): ProcessRunResult {
  const line = argv.join(' ')
  const found = Object.entries(REPOSITORY).find(([key]) => line.includes(key))

  return found
    ? { exitCode: 0, stdout: found[1], stderr: '' }
    : Fixtures.NOT_A_REPOSITORY
}

/**
 * A hook that keeps each input it is asked with, and answers, beside what
 * it kept.
 *
 * @returns the hook, and each input in the order it came
 */
function keeping<E>() {
  const kept: E[] = []

  function hook(_engine: unknown, e: E) {
    kept.push(e)

    return { value: undefined }
  }

  return { hook, kept }
}

/**
 * A session in that repository, keeping each git run and each pane opened
 * or closed; the store starts empty and the engine draws the hint.
 */
function inRepository(on: On) {
  const runs: Args<'process.run'>[] = []
  const opened = keeping<Args<'ui.open'>>()
  const closed = keeping<Args<'ui.close'>>()
  Fixtures.startsSession(on)
  on('process.run', ($, e) => {
    runs.push(e)

    return { value: gitIn(e.argv) }
  })
  on('ui.open', opened.hook)
  on('ui.close', closed.hook)
  on('ui.invalidate', () => ({ value: undefined }))
  on('ui.render', { component: 'PromptHint' }, () => HINT_DRAWN)
  on('session.messages', () => ({ value: [] }))
  memoryStore(on)

  return { runs, opened: opened.kept, closed: closed.kept }
}

describe('pane', () => {
  test('/diff opens the pane over the session changes', async ($, on) => {
    const world = inRepository(on)

    await $.session.start(Fixtures.SESSION)

    expect(await $.command.run(Fixtures.DIFF)).toEqual({})
    expect(world.opened.map(pane => pane.id)).toEqual(['diff'])

    await clock.advance(SETTLE_MS)
    const drawn = textOf(await $.ui.render(PANE))

    expect(drawn).toContain('1 file changed')
    expect(drawn).toContain('app.ts')
  })

  test('each git child runs pinned to /work, in C locale', async ($, on) => {
    const world = inRepository(on)

    await $.session.start(Fixtures.SESSION)
    await $.command.run(Fixtures.DIFF)
    await clock.advance(SETTLE_MS)
    const [discovery, ...pinned] = world.runs

    expect(discovery?.argv).toContain('--show-toplevel')
    expect(discovery?.init?.cwd).toBeUndefined()
    expect(pinned.length).toBeGreaterThan(0)

    for (const run of pinned) {
      expect(run.argv.slice(0, 3)).toEqual([
        'git',
        '--git-dir=/work/.git',
        '--work-tree=/work',
      ])
      expect(run.init).toMatchObject({ cwd: '/work', env: { LC_ALL: 'C' } })
    }
  })

  test('a wide terminal opens the pane at the first edit', async ($, on) => {
    const world = inRepository(on)
    on('tool.call', () => ({ result: 'edited' }))

    await $.session.start(Fixtures.SESSION)
    await $.ui.render(HINT)
    await $.tool.call({
      tool: 'Edit',
      file_path: '/work/app.ts',
      old_string: '1',
      new_string: '2',
    })
    await clock.advance(SETTLE_MS)

    expect(world.opened.map(pane => pane.id)).toEqual(['diff'])
  })

  test('/clear closes the pane it finds open', async ($, on) => {
    const world = inRepository(on)
    on('command.run', { command: 'clear' }, () => ({}))

    await $.session.start(Fixtures.SESSION)
    await $.command.run(Fixtures.DIFF)
    await $.command.run(CLEAR)

    expect(world.closed.map(pane => pane.id)).toEqual(['diff'])
  })
})
