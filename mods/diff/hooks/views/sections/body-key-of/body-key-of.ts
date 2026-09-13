import Layout from '../../layout'

/**
 * The key of a file's block in the docked body, under `body:`: what a row's
 * press scrolls to (`$.ui.scroll({ to: { key } })`).
 *
 * @param path the file's path as git or the transcript gave it
 * @returns the key
 */
export const bodyKeyOf = (path: string) => `body:${Layout.sanitizeName(path)}`
