import type {
  Args,
  CommandRunInput,
  HttpResponse,
  On,
  SessionAuthorization,
} from 'claude-code'
import type { Plugin } from 'claude-code/testing'
import { expect, memoryEnv, seat, test } from 'claude-code/testing'

seat('builtin')

const BEARER: SessionAuthorization = { handle: 'the-handle', kind: 'bearer' }
const ACCEPTED: HttpResponse = { status: 200, ok: true, headers: {}, text: '' }

/**
 * `/record <event>`, which the recording plugin answers.
 */
const record = (event: string): CommandRunInput => ({
  command: 'record',
  args: event,
  origin: { kind: 'composer' },
})

/**
 * A plugin whose `/record <event>` logs that event through `$.telemetry`,
 * answering "sent", or why the row was refused.
 */
const recording: Plugin = {
  name: 'recording',
  register(on) {
    on('command.run', { command: 'record' }, ($, e) =>
      $.telemetry.log({ event: e.args, props: { answer: 2, seen: true } }).then(
        () => ({ text: 'sent' }),
        (error: unknown) => ({ text: String(error) }),
      ),
    )
  },
}

/**
 * A first-party session: its id and model, the credential it holds, and
 * the ingest accepting each row, each post kept as it was made.
 */
function firstPartySession(
  on: On,
  authorization: SessionAuthorization = BEARER,
) {
  const posts: Args<'http.fetch'>[] = []
  on('session.id', () => ({ value: 'the-session' }))
  on('session.model', () => ({ value: 'the-model' }))
  on('session.authorize', () => ({ value: authorization }))
  on('http.fetch', ($, e) => {
    posts.push(e)

    return { value: ACCEPTED }
  })

  return posts
}

/**
 * The batch a post to the ingest carries, as it was sent.
 */
function batchOf(post: Args<'http.fetch'>): unknown {
  return JSON.parse(String(post.init?.body))
}

test(
  'a plugin’s $.telemetry.log posts one first-party row',
  { plugins: [recording] },
  async ($, on) => {
    memoryEnv(on, { USER_TYPE: 'ant' })
    const posts = firstPartySession(on)

    expect(await $.command.run(record('survey_answered'))).toEqual({
      text: 'sent',
    })
    expect(posts).toHaveLength(1)

    const [post] = posts

    expect(post.init).toMatchObject({ method: 'POST', auth: 'the-handle' })
    expect(batchOf(post)).toMatchObject({
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
    })
  },
)

test(
  'a row already named tengu_ is sent under its own name',
  { plugins: [recording] },
  async ($, on) => {
    memoryEnv(on, {})
    const posts = firstPartySession(on)

    await $.command.run(record('tengu_repl_diff_panel_shown'))

    expect(posts.map(batchOf)).toMatchObject([
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
  { plugins: [recording] },
  async ($, on) => {
    memoryEnv(on, { DO_NOT_TRACK: '1' })
    const posts = firstPartySession(on)

    expect(await $.command.run(record('survey_answered'))).toEqual({
      text: 'sent',
    })
    expect(posts).toEqual([])
  },
)

test(
  'nothing is sent on a third-party provider',
  { plugins: [recording] },
  async ($, on) => {
    memoryEnv(on, { CLAUDE_CODE_USE_BEDROCK: '1' })
    const posts = firstPartySession(on)

    await $.command.run(record('survey_answered'))

    expect(posts).toEqual([])
  },
)

test(
  'a session with no first-party credential is refused, nothing sent',
  { plugins: [recording] },
  async ($, on) => {
    memoryEnv(on, {})
    const posts = firstPartySession(on, null)
    const { text } = await $.command.run(record('survey_answered'))

    expect(text).toEndWith(
      '$.telemetry.log: this session has no first-party credential to ' +
        'authorize',
    )
    expect(posts).toEqual([])
  },
)
