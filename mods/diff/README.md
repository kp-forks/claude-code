# diff

The diff pane as a plugin: `/diff` opens the session's uncommitted changes
beside the transcript, one row per changed file and every file's hunks
beneath, a row's click scrolling to its file, and closes it again; each
toggle leaves `Diff panel shown` or `Diff panel hidden` in the transcript.
The pane refreshes as Claude edits, runs shell commands and finishes turns,
and while it is open it polls the repository's HEAD so a commit or checkout
made elsewhere shows too. The first successful edit of a session opens the
pane by itself where the terminal is wide enough (144 columns when the
person never chose, 110 when they kept it open before; a person who closed
it is left alone). On a terminal under 110 columns `/diff` answers with the
built-in's line asking for a wider terminal and opens nothing; a pane the
surface seats inline on a terminal that wide shows only that line, and on a
wider one (a session without the fullscreen layout) the built-in dialog's
layout: the rows round the selected file and that file's hunks. A file's
ask button arms that file: its hunks ride the next prompt as context, once.

The pane compares the working tree against HEAD, split at the session's
start (the default), against HEAD plainly, or against the merge-base with
the default branch; the choice is kept per repository in the plugin's
store. A second picker shows one earlier turn's edits instead of the
working tree, read from the session's messages. Files that changed before
the session started (by their timestamp, among the paths already dirty at
the start), and noise (lockfiles, generated and test files), are listed
apart and folded until asked for; a rename lists as git prints it. Outside
a git repository `/diff` says so and does nothing else.

`hooks/register.ts` is the module; everything under `hooks/` is its parts.

## What it hooks

| event | what the hook does |
| --- | --- |
| `session.start` | Binds the engine once, registers `/diff` (a session where another `/diff` is listed leaves the plugin idle), and pins the repository. |
| `ui.render` of `PromptHint` | Reads the terminal's width, which decides whether the first edit opens the pane. |
| `ui.render` of `Pane` | Draws the pane: header, the base and source pickers, the file list, the toggles, and the files' hunks. |
| `command.run` of `diff` | Opens or closes the pane, says which, and remembers the choice. |
| `ui.close` of the pane | Remembers the person's close as `/diff`'s. |
| `command.run` of `clear`, `resume` | Closes the pane and forgets the session's state. |
| `tool.call` of `Edit`, `Write`, `NotebookEdit` | After the edit, refreshes an open pane; the session's first successful edit opens it. |
| `tool.call` of `Bash`, `PowerShell` | After the command, refreshes an open pane. |
| `turn.complete` | Refreshes an open pane. |
| `prompt.submit` | Adds the armed file's hunks to the prompt's context and disarms. |

## What it calls on `$`

`clock.after`, `clock.every`, `clock.now`, `command.register`, `fs.list`,
`fs.read`, `fs.stat`, `process.run` (git, read-only), `session.messages`,
`store.get`, `store.set`, `telemetry.log`, `telemetry.mark`, `ui.close`,
`ui.invalidate`, `ui.log`, `ui.open`, `ui.resolve`, `ui.scroll`, `ui.status`.

`$.telemetry` is the telemetry plugin's noun; where it is absent the rows
are dropped and nothing else changes.

## Try it

```sh
claude --plugin-dir /path/to/diff
```

then `/diff` inside a git repository with a modified file.
