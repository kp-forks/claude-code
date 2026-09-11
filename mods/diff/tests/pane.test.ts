import type {
  Args,
  CommandRunInput,
  On,
  ProcessRunResult,
  RenderElement,
  RenderInput,
  SessionStartInput,
} from 'claude-code'
import {
  clock,
  expect,
  memoryStore,
  seat,
  test,
  textOf,
} from 'claude-code/testing'

seat('builtin')

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
 * A repository at /work with one changed file, as git's output for each
 * invocation whose command line holds the key.
 */
const REPOSITORY: Readonly<Record<string, string>> = {
  'rev-parse --path-format=absolute': '/work\n/work/.git\n/work/.git\n',
  'HEAD --shortstat': ' 1 file changed, 1 insertion(+)',
  'HEAD --numstat': '1\t0\tapp.ts\0',
  'ls-files': '',
  '-- app.ts': '@@ -1 +1 @@\n-const a = 1\n+const a = 2\n',
}

/**
 * What git answers in that repository; an invocation it does not know
 * fails as git does outside a repository.
 */
function gitIn(argv: readonly string[]): ProcessRunResult {
  const line = argv.join(' ')
  const found = Object.entries(REPOSITORY).find(([key]) => line.includes(key))

  return found
    ? { exitCode: 0, stdout: found[1], stderr: '' }
    : { exitCode: 128, stdout: '', stderr: 'fatal: not a git repository' }
}

/**
 * A session in that repository: /diff registers, git answers, the store
 * starts empty, the engine draws the prompt's hint, and what the plugin
 * asks of the world (each git run, each pane opened or closed) is kept.
 */
function inRepository(on: On) {
  const runs: Args<'process.run'>[] = []
  const opened: Args<'ui.open'>[] = []
  const closed: Args<'ui.close'>[] = []
  on('session.start', ($, e) => ({ cwd: e.cwd }))
  on('command.register', ($, e) => ({ value: { command: e.name } }))
  on('process.run', ($, e) => {
    runs.push(e)
    return { value: gitIn(e.argv) }
  })
  on('ui.open', ($, e) => {
    opened.push(e)
    return { value: undefined }
  })
  on('ui.close', ($, e) => {
    closed.push(e)
    return { value: undefined }
  })
  on('ui.invalidate', () => ({ value: undefined }))
  on('ui.render', { component: 'PromptHint' }, () => HINT_DRAWN)
  on('session.messages', () => ({ value: [] }))
  memoryStore(on)

  return { runs, opened, closed }
}

test('/diff opens the pane over the session’s changes', async ($, on) => {
  const world = inRepository(on)

  await $.session.start(SESSION)

  expect(await $.command.run(DIFF)).toEqual({})
  expect(world.opened.map(pane => pane.id)).toEqual(['diff'])

  await clock.advance(1000)
  const drawn = textOf(await $.ui.render(PANE))

  expect(drawn).toContain('1 file changed')
  expect(drawn).toContain('app.ts')
})

test('every git child is pinned to the repository and reads the C locale', async ($, on) => {
  const world = inRepository(on)

  await $.session.start(SESSION)
  await $.command.run(DIFF)
  await clock.advance(1000)
  const [discovery, ...pinned] = world.runs

  expect(discovery.argv).toContain('--show-toplevel')
  expect(discovery.init?.cwd).toBeUndefined()
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

test('Claude’s first edit opens the pane on a wide terminal', async ($, on) => {
  const world = inRepository(on)
  on('tool.call', () => ({ result: 'edited' }))

  await $.session.start(SESSION)
  await $.ui.render(HINT)
  await $.tool.call({
    tool: 'Edit',
    file_path: '/work/app.ts',
    old_string: '1',
    new_string: '2',
  })
  await clock.advance(1000)

  expect(world.opened.map(pane => pane.id)).toEqual(['diff'])
})

test('/clear closes the pane it finds open', async ($, on) => {
  const world = inRepository(on)
  on('command.run', { command: 'clear' }, () => ({}))

  await $.session.start(SESSION)
  await $.command.run(DIFF)
  await $.command.run(CLEAR)

  expect(world.closed.map(pane => pane.id)).toEqual(['diff'])
})
