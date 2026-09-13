import type { Pressable } from '../pressable'

/**
 * A plain Button's face, press and address: a list row's Button, dim at
 * rest where the built-in draws the row dim.
 */
export type KeyedPressable = Pressable & {
  key: string
  isDim: boolean
}
