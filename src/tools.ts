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
  cursorRef: React.MutableRefObject<HTMLDivElement | null>
  tileHeight: number
  tileWidth: number
  zoomLevel: number
}

export type Tools = Record<
  ToolType,
  Partial<
    Record<
      LayerType,
      Partial<{
        move: (args: MoveArgs) => void
        click: () => void
      }>
    >
  >
>

function defaultMove({
  e,
  anchor,
  cursorRef,
  tileHeight,
  tileWidth,
  zoomLevel,
}: MoveArgs) {
  const { clientX, clientY } = e

  if (!(e.target instanceof HTMLDivElement)) return

  if (!cursorRef.current || !anchor) return

  const { x: offsetX, y: offsetY } =
    'current' in anchor
      ? anchor.current?.getBoundingClientRect() ?? { x: 0, y: 0 }
      : anchor.getBoundingClientRect()

  const top =
    tileHeight * Math.floor((clientY - offsetY) / zoomLevel / tileHeight)
  const left =
    tileWidth * Math.floor((clientX - offsetX) / zoomLevel / tileWidth)

  cursorRef.current.classList.remove('hidden')
  cursorRef.current.style.top = `${top}px`
  cursorRef.current.style.left = `${left}px`
}

export const tools: Tools = {
  select: {},
  tile: {
    tile: {
      move: defaultMove,
    },
  },
  object: {},
  structure: {
    structure: {
      move: defaultMove,
    },
  },
  grid: {},
  eraser: {
    tile: {
      move: defaultMove,
    },
  },
}
