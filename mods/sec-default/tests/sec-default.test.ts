import type {
  CommandRunInput,
  On,
  PromptSectionInput,
  SessionStartInput,
  Settings,
  ToolInfo,
} from 'claude-code'
import type { Plugin } from 'claude-code/testing'
import { expect, seat, test } from 'claude-code/testing'

seat('prepend')

const SESSION: SessionStartInput = {
  surface: 'terminal',
  isInteractive: true,
  cwd: '/work',
}
const TOOLS_COMMAND: CommandRunInput = {
  command: 'tools',
  args: '',
  origin: { kind: 'composer' },
}
const ALLOWLIST: Settings = { allowedMcpServers: [{ serverName: 'corp' }] }
const NO_ALLOWLIST: Settings = { permissions: { allow: [] } }
const MEMORY: PromptSectionInput = { name: 'memory', text: 'the org says hi' }
const TOOLS: ToolInfo[] = [
  {
    name: 'mcp__corp__search',
    description: 'Searches the corp wiki.',
    mcp: true,
  },
  { name: 'Bash', description: 'Runs a command.', mcp: false },
]

/**
 * A plugin that registers a tool when the session starts, in the tier
 * given: the person's own by default.
 */
const registering = (name: string, tier?: Plugin['tier']): Plugin => ({
  name,
  tier,
  register(on) {
    on('session.start', async ($, e, next) => {
      await $.tool.register({
        name: 'greet',
        description: 'Says hello.',
        inputSchema: { type: 'object' },
      })

      return next(e)
    })
  },
})

/**
 * A session starting, where each tool a plugin asks for is registered and
 * kept by the name of the plugin that asked.
 */
function toolsRegistered(on: On) {
  const registered: string[] = []
  on('session.start', ($, e) => ({ cwd: e.cwd }))
  on('tool.register', ($, e, next) => {
    registered.push(next.origin.plugin)

    return { value: { tool: `mcp__plugin_${next.origin.plugin}__${e.name}` } }
  })

  return registered
}

/**
 * A plugin the person installed that hides the organization's tools from
 * the listing and relabels every other one.
 */
const relabeling: Plugin = {
  name: 'relabeling',
  register(on) {
    on('tool.list', async ($, e, next) => {
      const listed = await next(e)

      return listed.value === undefined
        ? listed
        : {
            value: listed.value
              .filter(tool => !tool.name.startsWith('mcp__corp__'))
              .map(tool => ({ ...tool, description: 'relabeled' })),
          }
    })
  },
}

/**
 * A plugin whose `/tools` answers the tool listing it reads, one
 * `name: description` line per tool.
 */
const listing: Plugin = {
  name: 'listing',
  register(on) {
    on('command.run', { command: 'tools' }, async $ => ({
      text: (await $.tool.list())
        .map(tool => `${tool.name}: ${tool.description}`)
        .join('\n'),
    }))
  },
}

/**
 * A plugin the person installed that drops the memory section.
 */
const dropping: Plugin = {
  name: 'dropping',
  register(on) {
    on('prompt.section', () => ({ text: null }))
  },
}

/**
 * The organization's own plugin, seated last, which signs the section.
 */
const signing: Plugin = {
  name: 'signing',
  tier: 'append',
  register(on) {
    on('prompt.section', ($, e, next) =>
      next({ ...e, text: `${e.text} (signed)` }),
    )
  },
}

test(
  'under an MCP allowlist a plugin the person installed may not add a tool',
  { plugins: [registering('mine'), registering('bundled', 'builtin')] },
  async ($, on) => {
    on('settings.read', () => ({ value: ALLOWLIST }))
    const registered = toolsRegistered(on)

    await $.session.start(SESSION)

    expect(registered).toEqual(['bundled'])
  },
)

test(
  'with no allowlist, a plugin the person installed adds its tool',
  { plugins: [registering('mine')] },
  async ($, on) => {
    on('settings.read', () => ({ value: NO_ALLOWLIST }))
    const registered = toolsRegistered(on)

    await $.session.start(SESSION)

    expect(registered).toEqual(['mine'])
  },
)

test(
  'a policy that cannot be read counts as one in force',
  { plugins: [registering('mine')] },
  async ($, on) => {
    on('settings.read', () => ({ deny: 'managed settings unreadable' }))
    const registered = toolsRegistered(on)

    await $.session.start(SESSION)

    expect(registered).toEqual([])
  },
)

test(
  'the organization tools are listed as its tiers listed them',
  { plugins: [relabeling, listing] },
  async ($, on) => {
    on('settings.read', () => ({ value: ALLOWLIST }))
    on('tool.list', () => ({ value: TOOLS }))

    const { text } = await $.command.run(TOOLS_COMMAND)

    expect(text?.split('\n')).toEqual([
      'mcp__corp__search: Searches the corp wiki.',
      'Bash: relabeled',
    ])
  },
)

test(
  'a prompt section skips the plugins the person installed, never the organization ones',
  { plugins: [dropping, signing] },
  async ($, on) => {
    on('prompt.section', ($, e) => ({ text: e.text }))

    expect(await $.prompt.section(MEMORY)).toEqual({
      text: 'the org says hi (signed)',
    })
  },
)
