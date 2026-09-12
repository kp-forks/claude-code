import { describe, expect, mock, test, tier } from 'claude-code/testing'

import Limits from '../hooks/limits'
import Fixtures from './fixtures'

tier('builtin')

describe('register', () => {
  test('/diff at boot joins the boot probe, then asks again', async ($, on) => {
    const probes: (readonly string[])[] = []
    const clock = Fixtures.startsSession(on)

    on('process.run', async ($, e) => {
      probes.push(e.argv)

      if (probes.length === 1) {
        await clock.sleep(Limits.GIT_TIMEOUT_MS)

        return { deny: Fixtures.GIT_HUNG }
      }

      return { value: Fixtures.NOT_A_REPOSITORY }
    })

    const booting = $.session.start(Fixtures.SESSION)

    await clock.settle()

    const ran = $.command.run(Fixtures.DIFF)

    await clock.settle()

    expect(probes, 'the boot probe, which /diff joined').toHaveLength(1)

    await clock.advance(Limits.GIT_TIMEOUT_MS)
    await booting

    expect(await ran).toEqual({
      text: expect.stringContaining("isn't in a git repository"),
    })

    expect(probes, 'then one more of its own').toHaveLength(2)
  })

  test('outside a repository /diff says so, opens nothing', async ($, on) => {
    const opened: string[] = []

    Fixtures.startsSession(on)
    on('process.run', () => ({ value: Fixtures.NOT_A_REPOSITORY }))

    on('ui.open', ($, e, next) => {
      opened.push(e.id)

      return next(e)
    })

    await $.session.start(Fixtures.SESSION)

    const { text } = await $.command.run(Fixtures.DIFF)

    expect(text).toContain("isn't in a git repository")
    expect(opened).toEqual([])
  })

  test('a git that never answers is not "no repository"', async ($, on) => {
    Fixtures.startsSession(on)
    on('process.run', () => ({ deny: Fixtures.GIT_HUNG }))

    await $.session.start(Fixtures.SESSION)

    const { text } = await $.command.run(Fixtures.DIFF)

    expect(text).toContain("git didn't answer")
  })

  test('when the built-in holds /diff, the mod stands down', async ($, on) => {
    const logged: string[] = []

    mock.clock(on)
    on('session.start', ($, e) => ({ cwd: e.cwd }))
    on('command.register', () => ({ deny: Fixtures.BUILTIN_HOLDS }))
    on('command.run', () => ({ text: 'the built-in /diff ran' }))

    on('ui.log', ($, e) => {
      logged.push(e.text)

      return { value: undefined }
    })

    await $.session.start(Fixtures.SESSION)

    expect(await $.command.run(Fixtures.DIFF)).toEqual({
      text: 'the built-in /diff ran',
    })

    expect(logged).toEqual([])
  })

  test('a refusal the built-in did not cause is said aloud', async ($, on) => {
    const logged: string[] = []

    mock.clock(on)
    on('session.start', ($, e) => ({ cwd: e.cwd }))

    on('command.register', () => ({
      deny: '32 commands are registered already',
    }))

    on('ui.log', ($, e) => {
      logged.push(e.text)

      return { value: undefined }
    })

    await $.session.start(Fixtures.SESSION)

    expect(logged).toEqual([
      'could not register /diff: diff: $.command.register: 32 commands are ' +
        'registered already; the diff panel is unavailable this session',
    ])
  })

  test('/diff opens the pane over the session changes', async ($, on) => {
    const world = Fixtures.inRepository(on)

    await $.session.start(Fixtures.SESSION)

    expect(await $.command.run(Fixtures.DIFF)).toEqual({})
    expect(world.opened.map(pane => pane.id)).toEqual(['diff'])

    await world.clock.advance(Fixtures.SETTLE_MS)

    const drawn = Fixtures.textOf(await $.ui.render(Fixtures.PANE))

    expect(drawn).toContain('1 file changed')
    expect(drawn).toContain('app.ts')
  })

  test('the close button closes the pane; /diff reopens it', async ($, on) => {
    const world = Fixtures.inRepository(on)

    await $.session.start(Fixtures.SESSION)
    await $.command.run(Fixtures.DIFF)
    await world.clock.advance(Fixtures.SETTLE_MS)
    await $.ui.render(Fixtures.PANE)

    expect(await $.ui.press({ plugin: 'diff', key: 'close' })).toEqual({
      element: 'close',
    })

    await world.clock.settle()

    expect(world.closed.map(pane => pane.id)).toEqual(['diff'])
    expect(await $.command.run(Fixtures.DIFF)).toEqual({})
    expect(world.opened.map(pane => pane.id)).toEqual(['diff', 'diff'])
  })

  test('a wide terminal opens the pane at the first edit', async ($, on) => {
    const world = Fixtures.inRepository(on)

    on('tool.call', () => ({ result: 'edited' }))

    await $.session.start(Fixtures.SESSION)
    await $.ui.render(Fixtures.HINT)

    await $.tool.call({
      tool: 'Edit',
      file_path: '/work/app.ts',
      old_string: '1',
      new_string: '2',
    })

    await world.clock.advance(Fixtures.SETTLE_MS)

    expect(world.opened.map(pane => pane.id)).toEqual(['diff'])
  })

  test('/clear closes the pane it finds open', async ($, on) => {
    const world = Fixtures.inRepository(on)

    on('command.run', { command: 'clear' }, () => ({}))

    await $.session.start(Fixtures.SESSION)
    await $.command.run(Fixtures.DIFF)
    await $.command.run(Fixtures.CLEAR)

    expect(world.closed.map(pane => pane.id)).toEqual(['diff'])
  })
})
