import { describe, expect, test, tier } from 'claude-code/testing'

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
})
