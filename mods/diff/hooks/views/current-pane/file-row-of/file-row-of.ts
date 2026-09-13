import Git from '../../../git'
import Sections from '../../sections'

/**
 * A fetched row as the inline list draws it (DiffFileList FileItem): its
 * counts or a note for them (`untracked`, `Binary file`), name, selection.
 *
 * @param file the row
 * @param selectedPath the selected file's path, or null
 * @returns the row model
 */
export function fileRowOf(
  file: Git.FileStat,
  selectedPath: string | null,
): Sections.FileRowModel {
  const note = file.isUntracked
    ? 'untracked'
    : file.isBinary
      ? 'Binary file'
      : null

  return {
    key: Sections.fileKeyOf(file.path),
    path: file.path,
    displayPath: Git.displayPathOf(file),
    added: file.added,
    removed: file.removed,
    note,
    isSelected: file.path === selectedPath,
  }
}
