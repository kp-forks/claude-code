/**
 * A string property: the value and the list it is chosen from, declared
 * beside it, so no free text reaches the row.
 *
 * Every member of `of` is a lowercase token of letters, digits, `_` and
 * `-`, which may start with a digit, at most CHOICES_LIMIT of them; `value`
 * is one of them.
 */
export type Choice = { value: string; of: readonly string[] }
