import type { TelemetryLogEntry } from 'claude-code'

/**
 * A survey answered, as a plugin logs it.
 *
 * @returns the entry, fresh each call
 */
export const surveyAnswer = (): TelemetryLogEntry => ({
  event: 'survey_answered',
  props: { answer: 2, seen: true },
})
