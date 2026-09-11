import { clock, describe, expect, test, tier } from 'claude-code/testing'

import Limits from '../hooks/limits'
import Fixtures from './fixtures'

const GIT_HUNG = `git aborted: still running after ${Limits.GIT_TIMEOUT_MS}ms`

tier('builtin')

describe('boot-probe', () => {
  test('/diff at boot joins the boot probe, then asks again', async ($, on) => {
    const probes: (readonly string[])[] = []
    Fixtures.startsSession(on)
    on('process.run', async ($, e) => {
      probes.push(e.argv)

      if (probes.length === 1) {
        await clock.sleep(Limits.GIT_TIMEOUT_MS)

        return { deny: GIT_HUNG }
      }

      return { value: Fixtures.NOT_A_REPOSITORY }
    })

    const booting = $.session.start(Fixtures.SESSION)
    await clock.advance(0)
    const ran = $.command.run(Fixtures.DIFF)
    await clock.advance(0)

    expect(probes, 'the boot probe, which /diff joined').toHaveLength(1)

    await clock.advance(Limits.GIT_TIMEOUT_MS)
    await booting

    expect(await ran).toEqual({
      text: expect.stringContaining("isn't in a git repository"),
    })
    expect(probes, 'then one more of its own').toHaveLength(2)
  })
})
