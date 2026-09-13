/**
 * A body line as a hunk keeps it: git's closing empty line becomes the
 * empty context row the built-in panel draws for it; the rest stand.
 *
 * @param line a line isBodyLine passed
 * @returns the line, a lone space for the empty one
 */
export const bodyLineOf = (line: string) => (line === '' ? ' ' : line)
