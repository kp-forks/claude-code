/**
 * `/diff`'s answer when git did not say whether this is a repository.
 *
 * It timed out or could not start: the directory is unknown, not outside
 * one.
 */
export const GIT_UNANSWERED_TEXT =
  'The diff panel couldn’t read git state — git didn’t answer; run /diff ' +
  'again'
