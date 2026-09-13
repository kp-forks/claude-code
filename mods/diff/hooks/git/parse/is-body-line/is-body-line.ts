/**
 * Whether a line after a hunk header is a body line (added, removed or
 * context) rather than a note such as `\ No newline at end of file`.
 *
 * The empty line that ends git's output counts, as the built-in panel
 * counts it: the last hunk of a file closes on one more context row.
 *
 * @param line one line of `git diff` output
 * @returns whether it starts with `+`, `-` or a space, or is empty
 */
export const isBodyLine = (line: string) =>
  line === '' ||
  line.startsWith('+') ||
  line.startsWith('-') ||
  line.startsWith(' ')
