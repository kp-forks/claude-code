/**
 * The shape of a Choice member: a snake_case token of at most 64 characters,
 * which may start with a digit (a bucket such as `110_to_143`), unlike a name
 * or a key (TOKEN).
 */
export const CHOICE_TOKEN = /^[a-z0-9][a-z0-9_]{0,63}$/
