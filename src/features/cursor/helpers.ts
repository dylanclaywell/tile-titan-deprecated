import type { TileCursorMetadata, Metadata } from './cursorSlice'

export function isTileCursorMetadata(
  metadata: Metadata
): metadata is TileCursorMetadata[] {
  return Array.isArray(metadata)
}
