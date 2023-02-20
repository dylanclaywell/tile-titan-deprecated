import React, {
  useEffect,
  useContext,
  MutableRefObject,
  useMemo,
  useRef,
} from 'react'

import { EditorContext } from '../../contexts/EditorContext'
import { LayerType } from '../../types/layer'
import clsx from 'clsx'

export interface Props {
  layer: LayerType
  anchor: (HTMLElement | null) | MutableRefObject<HTMLDivElement | null>
}

export function Cursor({ anchor }: Props) {
  const objectToolMouseRef = useRef({
    x: 0,
    y: 0,
    x2: 0,
    y2: 0,
  })
  const [
    { cursorRef, tool, zoomLevel, tileWidth, tileHeight, selectedLayerId },
    { setCursorRef, addObject },
  ] = useContext(EditorContext)

  const width = useMemo(() => tileWidth, [tileWidth])
  const height = useMemo(() => tileHeight, [tileHeight])

  useEffect(
    function registerTileTool() {
      function handleObjectToolMouseDown(e: MouseEvent) {
        if (tool.type !== 'object') return

        const { clientX, clientY } = e
        objectToolMouseRef.current = {
          ...objectToolMouseRef.current,
          x: clientX,
          y: clientY,
        }
      }

      function handleObjectToolMouseUp(e: MouseEvent) {
        if (
          tool.type !== 'object' ||
          !selectedLayerId ||
          !anchor ||
          ('current' in anchor && !anchor.current)
        )
          return

        if (
          e.target !== anchor &&
          'current' in anchor &&
          e.target !== anchor.current
        )
          return

        const { x: offsetX, y: offsetY } =
          'current' in anchor
            ? anchor.current?.getBoundingClientRect() ?? { x: 0, y: 0 }
            : anchor.getBoundingClientRect()

        const x = objectToolMouseRef.current.x / zoomLevel - offsetX
        const y = objectToolMouseRef.current.y / zoomLevel - offsetY

        const x2 = objectToolMouseRef.current.x2 / zoomLevel - offsetX
        const y2 = objectToolMouseRef.current.y2 / zoomLevel - offsetY

        const width = Math.abs(x2 - x)
        const height = Math.abs(y2 - y)

        addObject({
          layerId: selectedLayerId,
          name: 'New Object',
          x,
          y,
          x2,
          y2,
          width,
          height,
        })
      }

      function handleTileToolMouseMove(e: MouseEvent) {
        const { clientX, clientY } = e

        if (!(e.target instanceof HTMLDivElement)) return

        const isHoveringTilemapEditor =
          e.target.id === 'tilemap-editor' ||
          e.target.parentElement?.id === 'tilemap-grid'

        if (!cursorRef.current || !anchor) return

        const { x: offsetX, y: offsetY } =
          'current' in anchor
            ? anchor.current?.getBoundingClientRect() ?? { x: 0, y: 0 }
            : anchor.getBoundingClientRect()

        const top =
          height * Math.floor((clientY / zoomLevel - offsetY) / height)
        const left = width * Math.floor((clientX / zoomLevel - offsetX) / width)

        if (isHoveringTilemapEditor) {
          cursorRef.current.classList.remove('hidden')
          cursorRef.current.style.top = `${top}px`
          cursorRef.current.style.left = `${left}px`
        } else {
          cursorRef.current.classList.add('hidden')
        }
      }

      function handleObjectToolMouseMove(e: MouseEvent) {
        const { clientX, clientY } = e

        objectToolMouseRef.current = {
          ...objectToolMouseRef.current,
          x2: clientX,
          y2: clientY,
        }
      }

      function onMouseMove(e: MouseEvent) {
        if (tool.type !== 'object') {
          handleTileToolMouseMove(e)
        } else {
          handleObjectToolMouseMove(e)
        }
      }

      document.addEventListener('mousemove', onMouseMove)
      document.addEventListener('mousedown', handleObjectToolMouseDown)
      document.addEventListener('mouseup', handleObjectToolMouseUp)

      return () => {
        document.removeEventListener('mousemove', onMouseMove)
        document.removeEventListener('mousedown', handleObjectToolMouseDown)
        document.removeEventListener('mouseup', handleObjectToolMouseUp)
      }
    },
    [zoomLevel, tool, selectedLayerId]
  )

  return (
    <>
      <div
        className={clsx(
          'p-4 absolute pointer-events-none bg-opacity-75 opacity-75 z-50',
          {
            'bg-blue-600': tool.type !== 'object',
            'bg-transparent': tool.type === 'object',
          }
        )}
        ref={(el) => setCursorRef(el)}
        style={{
          width: tileWidth,
          height: tileHeight,
        }}
      >
        <img
          className="absolute top-0 left-0"
          style={{
            width: tileWidth,
            height: tileHeight,
          }}
          src={tool.canvas.toDataURL()}
        />
      </div>
    </>
  )
}
