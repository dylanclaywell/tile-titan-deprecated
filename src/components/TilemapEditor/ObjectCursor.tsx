import React, { useEffect, MutableRefObject, useRef } from 'react'

import { LayerType } from '../../types/layer'
import { useAppDispatch, useAppSelector } from '../../hooks/redux'
import { addObject } from '../../features/editor/editorSlice'

export interface Props {
  layer: LayerType
  anchor: (HTMLElement | null) | MutableRefObject<HTMLDivElement | null>
}

export function ObjectCursor({ anchor }: Props) {
  const objectToolPreviewRef = useRef<HTMLDivElement | null>(null)
  const objectToolMouseRef = useRef<{
    x: number
    y: number
    x2: number
    y2: number
  } | null>(null)
  const { tool, zoomLevel, selectedLayerId } = useAppSelector((state) => {
    return {
      tool: state.editor.tool,
      zoomLevel: state.editor.zoomLevel,
      selectedLayerId: state.editor.selectedLayerId,
    }
  })
  const dispatch = useAppDispatch()

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
        if (e.button !== 0) return

        if (tool.type !== 'object') return

        const { clientX, clientY } = e
        objectToolMouseRef.current = {
          x: clientX,
          y: clientY,
          x2: clientX,
          y2: clientY,
        }

        if (!anchor) return

        const { x: offsetX, y: offsetY } = getAnchorOffset()

        const x = (clientX - offsetX) / zoomLevel
        const y = (clientY - offsetY) / zoomLevel

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
          ('current' in anchor && !anchor.current) ||
          !objectToolMouseRef.current
        ) {
          objectToolMouseRef.current = null
          return
        }

        if (
          e.target !== anchor &&
          'current' in anchor &&
          e.target !== anchor.current
        ) {
          if (objectToolPreviewRef.current)
            objectToolPreviewRef.current.style.visibility = 'hidden'
          objectToolMouseRef.current = null
          return
        }

        const { x: offsetX, y: offsetY } = getAnchorOffset()

        const x = (objectToolMouseRef.current.x - offsetX) / zoomLevel
        const y = (objectToolMouseRef.current.y - offsetY) / zoomLevel

        const x2 = (objectToolMouseRef.current.x2 - offsetX) / zoomLevel
        const y2 = (objectToolMouseRef.current.y2 - offsetY) / zoomLevel

        const width = Math.abs(x2 - x)
        const height = Math.abs(y2 - y)

        if (objectToolPreviewRef.current) {
          objectToolPreviewRef.current.style.visibility = 'hidden'
        }

        dispatch(addObject({ x, y, x2, y2, width, height }))
        objectToolMouseRef.current = null
      }

      function handleObjectToolMouseMove(e: MouseEvent) {
        const { clientX, clientY } = e

        if (!objectToolMouseRef.current) return

        objectToolMouseRef.current = {
          ...objectToolMouseRef.current,
          x2: clientX,
          y2: clientY,
        }

        if (objectToolPreviewRef.current) {
          if (!anchor) return

          const movementX = clientX - objectToolMouseRef.current.x
          const movementY = clientY - objectToolMouseRef.current.y

          const width = Math.abs(movementX) / zoomLevel
          const height = Math.abs(movementY) / zoomLevel

          const { x: offsetX, y: offsetY } = getAnchorOffset()

          const x = (clientX - offsetX) / zoomLevel
          const y = (clientY - offsetY) / zoomLevel

          if (movementY < 0) {
            objectToolPreviewRef.current.style.top = `${y}px`
          } else {
            objectToolPreviewRef.current.style.top = `${y - height}px`
          }

          if (movementX < 0) {
            objectToolPreviewRef.current.style.left = `${x}px`
          } else {
            objectToolPreviewRef.current.style.left = `${x - width}px`
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
