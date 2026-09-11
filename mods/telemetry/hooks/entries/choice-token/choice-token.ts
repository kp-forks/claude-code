/**
 * The shape of a Choice member: a snake_case token of at most 64
 * characters.
 *
 * Unlike a name or a key (TOKEN), it may start with a digit (a bucket such
 * as `110_to_143`).
 */
export const CHOICE_TOKEN = /^[a-z0-9][a-z0-9_]{0,63}$/
