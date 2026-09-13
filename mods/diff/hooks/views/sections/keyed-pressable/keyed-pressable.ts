import type { Pressable } from '../pressable'

/**
 * A plain Button's face, press and address: a list row's Button.
 */
export type KeyedPressable = Pressable & {
  key: string
}
