import { describe, expect, test, tier } from 'claude-code/testing'

import Fixtures from './fixtures'

tier('prepend')

describe('register', () => {
  test(
    'under an MCP allowlist a plugin the person installed may not add a tool',
    {
      plugins: [
        Fixtures.registering('mine'),
        Fixtures.registering('bundled', 'builtin'),
      ],
    },
    async ($, on) => {
      on('settings.read', () => ({ value: Fixtures.ALLOWLIST }))
      const registered = Fixtures.toolsRegistered(on)

      await $.session.start(Fixtures.SESSION)

      expect(registered).toEqual(['bundled'])
    },
  )

  test(
    'with no allowlist, a plugin the person installed adds its tool',
    { plugins: [Fixtures.registering('mine')] },
    async ($, on) => {
      on('settings.read', () => ({ value: Fixtures.NO_ALLOWLIST }))
      const registered = Fixtures.toolsRegistered(on)

      await $.session.start(Fixtures.SESSION)

      expect(registered).toEqual(['mine'])
    },
  )

  test(
    'a policy that cannot be read counts as one in force',
    { plugins: [Fixtures.registering('mine')] },
    async ($, on) => {
      on('settings.read', () => ({ deny: 'managed settings unreadable' }))
      const registered = Fixtures.toolsRegistered(on)

      await $.session.start(Fixtures.SESSION)

      expect(registered).toEqual([])
    },
  )

  test(
    'the organization tools are listed as its tiers listed them',
    { plugins: [Fixtures.relabeling, Fixtures.listing] },
    async ($, on) => {
      on('settings.read', () => ({ value: Fixtures.ALLOWLIST }))
      on('tool.list', () => ({ value: [...Fixtures.TOOLS] }))

      const { text } = await $.command.run(Fixtures.TOOLS_COMMAND)

      expect(text?.split('\n')).toEqual([
        'mcp__corp__search: Searches the corp wiki.',
        'Bash: relabeled',
      ])
    },
  )

  test(
    'a prompt section passes over the plugins the person installed',
    { plugins: [Fixtures.dropping, Fixtures.signing] },
    async ($, on) => {
      on('prompt.section', ($, e) => ({ text: e.text }))

      expect(await $.prompt.section(Fixtures.MEMORY)).toEqual({
        text: 'the org says hi (signed)',
      })
    },
  )
})
