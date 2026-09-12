import type { CommandRunInput, TelemetryLogEntry } from 'claude-code'

/**
 * The command that has the recording plugin log an entry, typed as the
 * person would type it.
 *
 * @param entry what to log
 * @returns `/record <entry>`
 */
export const record = (entry: TelemetryLogEntry): CommandRunInput => ({
  command: 'record',
  args: JSON.stringify(entry),
  origin: { kind: 'composer' },
})
