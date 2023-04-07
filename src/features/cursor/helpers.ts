import type { TileCursorMetadata, Metadata } from './cursorSlice'

export function isTileCursorMetadata(
  metadata: Metadata
): metadata is TileCursorMetadata {
  return metadata !== null && 'tilesetName' in metadata
}
