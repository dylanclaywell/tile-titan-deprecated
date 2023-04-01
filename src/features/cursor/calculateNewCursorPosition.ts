export function calculateNewCursorPosition({
  e,
  anchor,
  cursor,
  tileHeight,
  tileWidth,
  zoomLevel,
}: {
  e: React.MouseEvent<HTMLDivElement, MouseEvent>
  anchor: HTMLElement | React.MutableRefObject<HTMLDivElement | null>
  cursor: HTMLDivElement | null
  tileHeight: number
  tileWidth: number
  zoomLevel: number
}) {
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

  return {
    x: left,
    y: top,
  }
}
