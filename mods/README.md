# Mods

A mod is a Claude Code plugin whose behaviour lives in a hooks module: one
`register(on, options)` entry that hooks the engine's events as functions
`($, e, next)`. These three ship inside Claude Code; this folder is their
source, published as it is built into the binary.

| Mod | What it does | Seated |
| --- | --- | --- |
| [`sec-default`](sec-default) | Keeps an organization's classic hooks, prompt content, managed settings and tool policy out of reach of the plugins a person installs; adds no policy of its own. | Outermost, on a machine with managed settings or for a Team or Enterprise organization, unless managed `prependPlugins` says otherwise |
| [`diff`](diff) | `/diff`: the session's uncommitted changes in a pane beside the transcript, file by file with their hunks, refreshed as Claude edits files and runs commands. | Built in |
| [`telemetry`](telemetry) | Adds `$.telemetry` (`log`, `mark`) in the `engine.create` fold so a plugin can record an event as a first-party analytics row; sends nothing wherever Claude Code's analytics are off. | Built in |

Each folder is a complete plugin: `.claude-plugin/plugin.json`, a
`hooks/hooks.json` naming the module, and TypeScript under `hooks/` typed
against the declarations `/plugin-types` writes (`import type … from
'claude-code'`), kept here in `types/`. To read one running from source:

    claude --plugin-dir mods/diff

## Testing

A mod's tests are in its `tests/` folder, and run with

    claude plugin test mods/diff

A test gets the engine's own `$` and a plugin's `on`. Each call on `$` is one
the engine makes, through every hook of the mod loaded as it ships. The hooks
the test registers with `on` sit beneath the mod, where the rest of the world
would be, and nothing is beneath them: a call they leave unanswered throws,
naming its event.

```ts
import { expect, test, tier } from 'claude-code/testing'

tier('builtin')

test('outside a git repository /diff says so and opens nothing', async ($, on) => {
  const opened: string[] = []
  on('session.start', ($, e) => ({ cwd: e.cwd }))
  on('command.register', ($, e) => ({ value: { command: e.name } }))
  on('process.run', () => ({ value: { exitCode: 128, stdout: '', stderr: '' } }))
  on('ui.open', ($, e, next) => {
    opened.push(e.id)
    return next(e)
  })

  await $.session.start({ surface: 'terminal', isInteractive: true, cwd: '/work' })
  const { text } = await $.command.run({
    command: 'diff',
    args: '',
    origin: { kind: 'composer' },
  })

  expect(text).toContain("isn't in a git repository")
  expect(opened).toEqual([])
})
```

`tsc -p mods/tsconfig.json` typechecks every mod's hooks and tests against
`types/`.

Early access: hooks modules load only where function hooks are enabled, and
the API these mods are written against may change between releases without
notice. They are not listed in this repository's marketplace; the copies that
matter are the ones already in your Claude Code.
