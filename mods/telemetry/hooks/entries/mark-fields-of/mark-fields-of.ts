import type TelemetryTypes from '../../telemetry-types'
import { FEATURE_PREFIX } from '../feature-prefix'
import type { Fields } from '../fields'

/**
 * One checked mark as its fields: the CLI's own feature event,
 * `tengu_feature_<kind>` with `feature_name`, `error_code` when given, and
 * the mark's properties merged in as the CLI's feature events merge their
 * extras: after `feature_name` on an ok row, and beneath `feature_name` and
 * `error_code` on a sad or bad one.
 *
 * @param kind how the feature went
 * @param feature the feature marked
 * @param reason why, on a sad or bad mark; absent on ok
 * @param props the mark's checked properties
 * @returns the event's name and props, ready to log
 */
export const markFieldsOf = (
  kind: TelemetryTypes.MarkKind,
  feature: string,
  reason?: string,
  props: Readonly<Record<string, string | number | boolean>> = {},
): Fields => ({
  name: FEATURE_PREFIX + kind,
  props:
    reason === undefined
      ? { feature_name: feature, ...props }
      : { ...props, feature_name: feature, error_code: reason },
})
