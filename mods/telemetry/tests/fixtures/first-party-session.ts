import type { Args, On, SessionAuthorization } from 'claude-code'

import { ACCEPTED } from './accepted.js'
import { BEARER } from './bearer.js'

/**
 * Answers what the telemetry plugin reads of a session signed in first
 * party, and keeps each post the ingest accepts.
 *
 * @param on the test's `on`
 * @param authorization the credential the session holds
 * @returns each post, as it was made
 */
export function firstPartySession(
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
