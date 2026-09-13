import { describe, expect, test, tier } from 'claude-code/testing'

import Fixtures from './fixtures'

tier('builtin')

describe('views', () => {
  test('docked, every file has its hunks under the list', async ($, on) => {
    const world = Fixtures.inRepository(on, Fixtures.TWO_FILES)

    await $.session.start(Fixtures.SESSION)
    await $.command.run(Fixtures.DIFF)
    await world.clock.advance(Fixtures.SETTLE_MS)

    const drawn = Fixtures.textOf(await $.ui.render(Fixtures.PANE))

    expect(drawn).toContain('2 files changed +3 -1')

    expect(drawn, "a closing empty row, as the built-in's").toContain(
      '+const a = 2\n ',
    )

    expect(drawn, 'none after the last file').toMatch(/\+export const c = 2$/)
    expect(drawn).not.toContain('❯')
  })

  test('inline, a row moves the pointer and the body to it', async ($, on) => {
    const world = Fixtures.inRepository(on, Fixtures.TWO_FILES)

    await $.session.start(Fixtures.SESSION)
    await $.command.run(Fixtures.DIFF)
    await world.clock.advance(Fixtures.SETTLE_MS)
    await $.ui.render(Fixtures.INLINE_PANE)

    expect(await $.ui.press({ plugin: 'diff', key: 'file:lib.ts' })).toEqual({
      element: 'file:lib.ts',
    })

    const drawn = Fixtures.textOf(await $.ui.render(Fixtures.INLINE_PANE))

    expect(drawn).toContain('\u276f lib.ts')
    expect(drawn).toContain('+export const c = 2')
    expect(drawn).not.toContain('+const a = 2')
  })

  test('past eight files the docked list counts the rest', async ($, on) => {
    const world = Fixtures.inRepository(on, Fixtures.MANY_FILES)

    await $.session.start(Fixtures.SESSION)
    await $.command.run(Fixtures.DIFF)
    await world.clock.advance(Fixtures.SETTLE_MS)

    const drawn = Fixtures.textOf(await $.ui.render(Fixtures.PANE))

    expect(drawn).toContain('10 files changed +10 -10')
    expect(drawn).toContain('file7.ts')
    expect(drawn).toContain('↓ 2 more below')

    expect(drawn.indexOf('↓ 2 more below')).toBeLessThan(
      drawn.indexOf('file8.ts'),
    )
  })

  test('a rename lists as git prints it, and reads no body', async ($, on) => {
    const world = Fixtures.inRepository(on, Fixtures.RENAMED)

    await $.session.start(Fixtures.SESSION)
    await $.command.run(Fixtures.DIFF)
    await world.clock.advance(Fixtures.SETTLE_MS)

    const drawn = Fixtures.textOf(await $.ui.render(Fixtures.PANE))

    expect(drawn).toContain('1 file changed')
    expect(drawn).toContain('docs/{notes.txt => renamed-notes.txt}')
    expect(drawn).toContain('No diff content')

    expect(
      world.runs.filter(run => run.argv.includes('docs/renamed-notes.txt')),
    ).toEqual([])
  })

  test('inline on a wide terminal, the rows round one file', async ($, on) => {
    const world = Fixtures.inRepository(on, Fixtures.TWO_FILES)

    await $.session.start(Fixtures.SESSION)
    await $.command.run(Fixtures.DIFF)
    await world.clock.advance(Fixtures.SETTLE_MS)

    const drawn = Fixtures.textOf(await $.ui.render(Fixtures.INLINE_PANE))

    expect(drawn).toContain('❯ app.ts')
    expect(drawn).toContain('+const a = 2')
    expect(drawn).not.toContain('+export const c = 2')
  })

  test('inline on a narrow terminal, the resize line', async ($, on) => {
    const world = Fixtures.inRepository(on, Fixtures.TWO_FILES)

    await $.session.start(Fixtures.SESSION)
    await $.command.run(Fixtures.DIFF)
    await world.clock.advance(Fixtures.SETTLE_MS)

    expect(
      Fixtures.textOf(await $.ui.render(Fixtures.NARROW_INLINE_PANE)),
    ).toBe(
      'Resize your terminal to at least 110 columns to show the diff panel',
    )
  })
})
