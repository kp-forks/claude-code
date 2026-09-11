import type { MarkKind } from '../mark-kind'
import type { Prop } from '../prop'

/**
 * What `$.telemetry.mark` takes: the feature, how it went, why when not
 * ok, and the properties the row carries beside them by snake_case key.
 */
export type MarkEntry = {
  feature: string
  kind: MarkKind
  reason?: string
  props?: Readonly<Record<string, Prop>>
}
