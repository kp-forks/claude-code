import { describe, expect, mock, test, tier } from 'claude-code/testing'

import Fixtures from './fixtures'

tier('builtin')

describe('git', () => {
  test('each git child runs pinned to /work, in C locale', async ($, on) => {
    const world = Fixtures.inRepository(on)

    await $.session.start(Fixtures.SESSION)
    await $.command.run(Fixtures.DIFF)
    await world.clock.advance(Fixtures.SETTLE_MS)

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

  test('a file moved in since the start is session work', async ($, on) => {
    const clock = Fixtures.startsSession(on, Fixtures.SETTLE_MS)

    on('process.run', ($, e) => ({
      value: Fixtures.gitIn(e.argv, Fixtures.MOVED_IN),
    }))

    on('ui.open', () => ({ value: undefined }))
    on('ui.invalidate', () => ({ value: undefined }))
    on('session.messages', () => ({ value: [] }))
    Fixtures.oldFiles(on)
    mock.store(on)

    await $.session.start(Fixtures.SESSION)
    await $.command.run(Fixtures.DIFF)
    await clock.advance(Fixtures.SETTLE_MS)

    const drawn = Fixtures.textOf(await $.ui.render(Fixtures.PANE))

    expect(drawn).toContain('1 file changed +1 -1')
    expect(drawn).toContain('moved.ts')
    expect(drawn).toContain('+1 file edited before this session (show)')
  })
})
