import { describe, expect, memoryEnv, test, tier } from 'claude-code/testing'

import Fixtures from './fixtures'

tier('builtin')

describe('register', () => {
  test(
    'a $.telemetry.log call from a plugin posts one first-party row',
    { plugins: [Fixtures.recording] },
    async ($, on) => {
      memoryEnv(on, { USER_TYPE: 'ant' })
      const posts = Fixtures.firstPartySession(on)

      expect(
        await $.command.run(Fixtures.record(Fixtures.surveyAnswer())),
      ).toEqual({ text: 'sent' })
      expect(posts.map(post => post.init)).toMatchObject([
        { method: 'POST', auth: 'the-handle' },
      ])
      expect(posts.map(Fixtures.batchOf)).toMatchObject([
        {
          events: [
            {
              event_data: {
                event_name: 'tengu_plugin_survey_answered',
                session_id: 'the-session',
                model: 'the-model',
                user_type: 'ant',
              },
            },
          ],
        },
      ])
    },
  )

  test(
    'a row already named tengu_ is sent under its own name',
    { plugins: [Fixtures.recording] },
    async ($, on) => {
      memoryEnv(on, {})
      const posts = Fixtures.firstPartySession(on)

      await $.command.run(
        Fixtures.record({
          ...Fixtures.surveyAnswer(),
          event: 'tengu_repl_diff_panel_shown',
        }),
      )

      expect(posts.map(Fixtures.batchOf)).toMatchObject([
        {
          events: [
            {
              event_data: {
                event_name: 'tengu_repl_diff_panel_shown',
                user_type: 'external',
              },
            },
          ],
        },
      ])
    },
  )

  test(
    'nothing is sent for a person who asked not to be tracked',
    { plugins: [Fixtures.recording] },
    async ($, on) => {
      memoryEnv(on, { DO_NOT_TRACK: '1' })
      const posts = Fixtures.firstPartySession(on)
      const { text } = await $.command.run(
        Fixtures.record(Fixtures.surveyAnswer()),
      )

      expect({ text, posts }).toEqual({ text: 'sent', posts: [] })
    },
  )

  test(
    'nothing is sent on a third-party provider',
    { plugins: [Fixtures.recording] },
    async ($, on) => {
      memoryEnv(on, { CLAUDE_CODE_USE_BEDROCK: '1' })
      const posts = Fixtures.firstPartySession(on)

      await $.command.run(Fixtures.record(Fixtures.surveyAnswer()))

      expect(posts).toEqual([])
    },
  )

  test(
    'a session with no first-party credential is refused, nothing sent',
    { plugins: [Fixtures.recording] },
    async ($, on) => {
      memoryEnv(on, {})
      const posts = Fixtures.firstPartySession(on, null)
      const { text } = await $.command.run(
        Fixtures.record(Fixtures.surveyAnswer()),
      )

      expect(text).toEndWith(
        '$.telemetry.log: this session has no first-party credential to ' +
          'authorize',
      )
      expect(posts).toEqual([])
    },
  )

  test(
    'free text in a row is refused, nothing sent',
    { plugins: [Fixtures.recording] },
    async ($, on) => {
      memoryEnv(on, {})
      const posts = Fixtures.firstPartySession(on)
      const { text } = await $.command.run({
        ...Fixtures.record(Fixtures.surveyAnswer()),
        args: '{"event":"survey_answered","props":{"note":"hello world"}}',
      })

      expect(text).toContain('props.note: free text is refused')
      expect(posts).toEqual([])
    },
  )
})
