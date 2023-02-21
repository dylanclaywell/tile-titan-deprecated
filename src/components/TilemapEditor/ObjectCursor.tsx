import React, { useEffect, useContext, MutableRefObject, useRef } from 'react'

import { EditorContext } from '../../contexts/EditorContext'
import { LayerType } from '../../types/layer'

export interface Props {
  layer: LayerType
  anchor: (HTMLElement | null) | MutableRefObject<HTMLDivElement | null>
}

export function ObjectCursor({ anchor }: Props) {
  const objectToolPreviewRef = useRef<HTMLDivElement | null>(null)
  const objectToolMouseRef = useRef({
    x: 0,
    y: 0,
    x2: 0,
    y2: 0,
  })
  const [{ tool, zoomLevel, selectedLayerId }, { addObject }] =
    useContext(EditorContext)

  function getAnchorOffset() {
    if (!anchor) return { x: 0, y: 0 }

    const { x: offsetX, y: offsetY } =
      'current' in anchor
        ? anchor.current?.getBoundingClientRect() ?? { x: 0, y: 0 }
        : anchor.getBoundingClientRect()

    return { x: offsetX, y: offsetY }
  }

  useEffect(
    function registerObjectTool() {
      function handleObjectToolMouseDown(e: MouseEvent) {
        if (tool.type !== 'object') return

        const { clientX, clientY } = e
        objectToolMouseRef.current = {
          ...objectToolMouseRef.current,
          x: clientX,
          y: clientY,
        }

        if (!anchor) return

        const { x: offsetX, y: offsetY } = getAnchorOffset()

        const x = clientX / zoomLevel - offsetX
        const y = clientY / zoomLevel - offsetY

        if (objectToolPreviewRef.current) {
          objectToolPreviewRef.current.style.visibility = 'visible'
          objectToolPreviewRef.current.style.top = `${y}px`
          objectToolPreviewRef.current.style.left = `${x}px`
          objectToolPreviewRef.current.style.width = '0px'
          objectToolPreviewRef.current.style.height = '0px'
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
        ) {
          if (objectToolPreviewRef.current)
            objectToolPreviewRef.current.style.visibility = 'hidden'
          return
        }

        const { x: offsetX, y: offsetY } = getAnchorOffset()

        const x = objectToolMouseRef.current.x / zoomLevel - offsetX
        const y = objectToolMouseRef.current.y / zoomLevel - offsetY

        const x2 = objectToolMouseRef.current.x2 / zoomLevel - offsetX
        const y2 = objectToolMouseRef.current.y2 / zoomLevel - offsetY

        const width = Math.abs(x2 - x)
        const height = Math.abs(y2 - y)

        if (objectToolPreviewRef.current) {
          objectToolPreviewRef.current.style.visibility = 'hidden'
        }

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

      function handleObjectToolMouseMove(e: MouseEvent) {
        const { clientX, clientY } = e

        objectToolMouseRef.current = {
          ...objectToolMouseRef.current,
          x2: clientX,
          y2: clientY,
        }

        if (objectToolPreviewRef.current) {
          if (!anchor) return

          const width = Math.abs(clientX - objectToolMouseRef.current.x)
          const height = Math.abs(clientY - objectToolMouseRef.current.y)

          const { x: offsetX, y: offsetY } = getAnchorOffset()

          const x = clientX / zoomLevel - offsetX
          const y = clientY / zoomLevel - offsetY

          if (y < objectToolPreviewRef.current.offsetTop) {
            objectToolPreviewRef.current.style.top = `${y}px`
          }

          if (x < objectToolPreviewRef.current.offsetLeft) {
            objectToolPreviewRef.current.style.left = `${x}px`
          }

          objectToolPreviewRef.current.style.width = `${width}px`
          objectToolPreviewRef.current.style.height = `${height}px`
        }
      }

      function onMouseMove(e: MouseEvent) {
        if (tool.type === 'object') {
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
    <div
      className="absolute pointer-events-none border border-black"
      ref={objectToolPreviewRef}
      style={{ visibility: 'hidden' }}
    />
  )
}
