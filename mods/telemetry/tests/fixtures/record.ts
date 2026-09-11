import type { CommandRunInput } from 'claude-code'

import type { LogEntry } from '../../hooks/telemetry-types'

/**
 * The command that has the recording plugin log an entry, typed as the
 * person would type it.
 *
 * @param entry what to log
 * @returns `/record <entry>`
 */
export const record = (entry: LogEntry): CommandRunInput => ({
  command: 'record',
  args: JSON.stringify(entry),
  origin: { kind: 'composer' },
})
