/* @jsxRuntime classic */
/* @jsx h */
/* @jsxFrag Fragment */
import type { Kit } from '../kit'
import Layout from '../layout'
import Sections from '../sections'
import { codeBlocksOf } from './code-blocks-of'
import type { DetailModel } from './detail-model'
import { FILE_FRAME_NODES } from './file-frame-nodes'
import { MAX_CODE_CHARS } from './max-code-chars'
import { placeholderOf } from './placeholder-of'
import type Types from './types'

/**
 * One file's detail (DiffDetailView): its bold name and aside, the ask
 * Button, the built-in's dim rule under them, the body.
 *
 * The name is cut from its start to the width. The body is a placeholder,
 * or the hunks as the engine's diff `Code` blocks (codeBlocksOf) within the
 * room given, then a footer when anything was cut; the room left over.
 *
 * @param kit the elements and the width
 * @param detail the file
 * @param draw the room the bodies have left, and the ask's press
 * @returns the detail element and the room after it
 */
export function detailView(
  kit: Kit,
  detail: DetailModel,
  draw: Types.DetailDraw,
): Types.DrawnDetail {
  const { Box, Text, Button, Code } = kit.ui
  const { room, onToggleAsk } = draw
  const placeholder = placeholderOf(detail)
  const name = Layout.sanitizeName(detail.displayPath)

  const framed: Types.BodyRoom = {
    chars: room.chars - name.length,
    nodes: room.nodes - FILE_FRAME_NODES,
  }

  const code = codeBlocksOf(
    placeholder ? [] : (detail.body?.hunks ?? []),
    framed,
  )

  const isTruncated = detail.body?.isTruncated === true || code.isTruncated
  const path = Layout.sanitizeName(detail.path).slice(-MAX_CODE_CHARS)

  const asides = [
    detail.isUntracked ? 'untracked' : null,
    isTruncated ? 'truncated' : null,
  ].filter(word => word !== null)

  const aside = asides.length === 0 ? '' : ` (${asides.join(', ')})`

  const ask = placeholder
    ? []
    : [
        <Button key={Sections.askKeyOf(detail.path)} onPress={onToggleAsk}>
          {detail.isArmed ? 'asked ✓' : 'ask'}
        </Button>,
      ]

  const footer = isTruncated
    ? [
        <Text dimColor italic>
          … diff truncated (exceeded 400 line limit)
        </Text>,
      ]
    : []

  const notes = (placeholder ?? []).map(line => (
    <Text dimColor italic wrap="wrap">
      {line}
    </Text>
  ))

  const hunks = code.sources.map(source => (
    <Code source={source} format="diff" path={path} />
  ))

  const element = (
    <Box flexDirection="column">
      {[
        <Box flexDirection="row">
          {[
            <Text bold wrap="truncate-start">
              {Layout.truncateStart(name, kit.columns)}
            </Text>,
            <Text dimColor>{aside}</Text>,
            <Box flexGrow={1} />,
            ...ask,
          ]}
        </Box>,
        Sections.divider(kit),
        ...(placeholder ? notes : hunks),
        ...footer,
      ]}
    </Box>
  )

  return { element, room: code.room }
}
