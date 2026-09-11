import type { LogEntry } from '../../hooks/telemetry-types'

/**
 * A survey answered, as a plugin logs it.
 *
 * @returns the entry, fresh each call
 */
export const surveyAnswer = (): LogEntry => ({
  event: 'survey_answered',
  props: { answer: 2, seen: true },
})
