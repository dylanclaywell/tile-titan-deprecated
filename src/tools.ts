import { store } from './store'
import {
  Tool,
  addStructure as addStructureReducer,
} from './features/editor/editorSlice'

export type ToolType =
  | 'select'
  | 'tile'
  | 'eraser'
  | 'grid'
  | 'object'
  | 'structure'

export type LayerType = 'tile' | 'object' | 'structure'

export type MoveArgs = {
  e: React.MouseEvent<HTMLDivElement, MouseEvent>
  anchor: HTMLElement | React.MutableRefObject<HTMLDivElement | null>
  cursor: HTMLDivElement | null
  tileHeight: number
  tileWidth: number
  zoomLevel: number
}

export type TileUpdateArgs = {
  e: React.MouseEvent<HTMLDivElement, MouseEvent>
  currentLayerId: string
  cursor: HTMLDivElement | null
  tileWidth: number
  tileHeight: number
  tilemapWidth: number
  tilemapHeight: number
  tool: Tool
  onTileClick: (args: {
    layerId: string
    tileX: number
    tileY: number
    tilesetX: number
    tilesetY: number
    tilesetName: string
    tileData: string
  }) => void
}

export type StructureAddArgs = {
  cursor: HTMLDivElement | null
}

export type StructureRemoveArgs = {
  structure: HTMLImageElement | null
}

function getTileImage(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
  if (!(e.target instanceof HTMLDivElement) || e.target.dataset.type !== 'tile')
    return

  const image = e.target.querySelector('img')

  if (!image) return

  return image
}

function getCursorPosition({
  cursor,
  tileWidth,
  tileHeight,
  tilemapWidth,
  tilemapHeight,
}: {
  cursor: HTMLDivElement | null
  tileWidth: number
  tileHeight: number
  tilemapWidth: number
  tilemapHeight: number
}) {
  const cursorX = Math.ceil((cursor?.offsetLeft ?? 0) / tileWidth)
  const cursorY = Math.ceil((cursor?.offsetTop ?? 0) / tileHeight)

  if (
    cursorX < 0 ||
    cursorX > tilemapWidth - 1 ||
    cursorY < 0 ||
    cursorY > tilemapHeight - 1
  )
    return

  return { cursorX, cursorY }
}

export function addTile({
  e,
  currentLayerId,
  cursor,
  tileWidth,
  tileHeight,
  tilemapWidth,
  tilemapHeight,
  tool,
  onTileClick,
}: TileUpdateArgs) {
  const image = getTileImage(e)

  if (!image) return

  const position = getCursorPosition({
    cursor,
    tileWidth,
    tileHeight,
    tilemapWidth,
    tilemapHeight,
  })

  if (!position) return

  image.src = tool.src

  onTileClick({
    layerId: currentLayerId,
    tileX: position.cursorX,
    tileY: position.cursorY,
    tilesetX: tool.tilesetX ?? -1,
    tilesetY: tool.tilesetY ?? -1,
    tilesetName: tool.tilesetName ?? 'unknown',
    tileData: image.src,
  })
}

export function removeTile({
  e,
  currentLayerId,
  cursor,
  tileWidth,
  tileHeight,
  tilemapWidth,
  tilemapHeight,
  onTileClick,
}: TileUpdateArgs) {
  const image = getTileImage(e)

  if (!image) return

  const position = getCursorPosition({
    cursor,
    tileWidth,
    tileHeight,
    tilemapWidth,
    tilemapHeight,
  })

  if (!position) return

  onTileClick({
    layerId: currentLayerId,
    tileX: position.cursorX,
    tileY: position.cursorY,
    tilesetX: -1,
    tilesetY: -1,
    tilesetName: '',
    tileData: '',
  })

  image.src = ''
}

export function addStructure({ cursor }: StructureAddArgs) {
  if (!cursor) return

  const fileId = cursor.dataset.id

  if (!fileId) return

  const { top, left } = cursor.style
  const x = parseInt(left)
  const y = parseInt(top)

  store.dispatch(
    addStructureReducer({
      fileId,
      x,
      y,
    })
  )
}

export function removeStructure({ structure }: StructureRemoveArgs) {
  if (!structure) return

  const fileId = structure.dataset.id

  if (!fileId) return
}

export function moveCursor({
  e,
  anchor,
  cursor,
  tileHeight,
  tileWidth,
  zoomLevel,
}: MoveArgs) {
  const { clientX, clientY } = e

  if (!cursor || !anchor) return

  const { x: offsetX, y: offsetY } =
    'current' in anchor
      ? anchor.current?.getBoundingClientRect() ?? { x: 0, y: 0 }
      : anchor.getBoundingClientRect()

  const top =
    tileHeight * Math.floor((clientY - offsetY) / zoomLevel / tileHeight)
  const left =
    tileWidth * Math.floor((clientX - offsetX) / zoomLevel / tileWidth)

  cursor.classList.remove('hidden')
  cursor.style.top = `${top}px`
  cursor.style.left = `${left}px`
}
