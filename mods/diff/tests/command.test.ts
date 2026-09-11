import { describe, expect, test, tier } from 'claude-code/testing'

import Fixtures from './fixtures'

const BUILTIN_HOLDS = '"/diff" refused: it is the built-in /diff'

tier('builtin')

describe('command', () => {
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
    on('process.run', () => ({
      deny: 'git aborted: still running after 5000ms',
    }))

    await $.session.start(Fixtures.SESSION)
    const { text } = await $.command.run(Fixtures.DIFF)

    expect(text).toContain("git didn't answer")
  })

  test('when the built-in holds /diff, the mod stands down', async ($, on) => {
    const logged: string[] = []
    on('session.start', ($, e) => ({ cwd: e.cwd }))
    on('command.register', () => ({ deny: BUILTIN_HOLDS }))
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
})
