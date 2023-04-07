import React, { MutableRefObject, useCallback, useEffect, useRef } from 'react'
import { createSelector } from 'reselect'
import { addObject } from '../features/editor/editorSlice'
import { selectCurrentLayer } from '../features/editor/selectors'

import { useAppDispatch, useAppSelector } from '../hooks/redux'
import { RootState } from '../store'

type Anchor = (HTMLElement | null) | MutableRefObject<HTMLDivElement | null>

export const CursorContext = React.createContext<
  [
    HTMLDivElement | null,
    {
      setCursor: React.Dispatch<React.SetStateAction<HTMLDivElement | null>>
      handleMouseDown: (
        event: React.MouseEvent<HTMLElement, MouseEvent>,
        anchor: Anchor
      ) => void
      handleMouseUp: (
        event: React.MouseEvent<HTMLElement, MouseEvent>,
        anchor: Anchor
      ) => void
      handleMouseMove: (
        event: React.MouseEvent<HTMLElement, MouseEvent>,
        anchor: Anchor
      ) => void
    }
  ]
>([
  null,
  {
    setCursor: () => undefined,
    handleMouseDown: () => undefined,
    handleMouseUp: () => undefined,
    handleMouseMove: () => undefined,
  },
])

function getAnchorOffset(
  anchor: (HTMLElement | null) | MutableRefObject<HTMLDivElement | null>
) {
  if (!anchor) return { x: 0, y: 0 }

  const { x: offsetX, y: offsetY } =
    'current' in anchor
      ? anchor.current?.getBoundingClientRect() ?? { x: 0, y: 0 }
      : anchor.getBoundingClientRect()

  return { x: offsetX, y: offsetY }
}

const getState = createSelector(
  [
    (state: RootState) => ({
      zoomLevel: state.editor.zoomLevel,
    }),
    (state, zoomLevel) => ({
      zoomLevel,
    }),
  ],
  (state) => ({
    zoomLevel: state.zoomLevel,
  })
)

export function CursorProvider({ children }: { children: React.ReactNode }) {
  const { zoomLevel } = useAppSelector((state) =>
    getState(state, state.editor.zoomLevel)
  )
  const toolType = useAppSelector((state) => state.cursor.toolType)
  const currentLayerType = useAppSelector(selectCurrentLayer)?.type
  const objectToolMouseRef = useRef<{
    x: number
    y: number
    x2: number
    y2: number
  } | null>(null)

  const image = useAppSelector((state) => state.cursor.image)
  const x = useAppSelector((state) => state.cursor.x)
  const y = useAppSelector((state) => state.cursor.y)
  const editorDispatch = useAppDispatch()

  const [cursor, setCursor] = React.useState<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!cursor) return

    cursor.style.left = `${x}px`
    cursor.style.top = `${y}px`

    const img = cursor.querySelector('img')

    if (!img) return

    img.src = image ?? ''
  }, [x, y, cursor, image])

  useEffect(() => {
    if (!cursor) return

    const img = cursor.querySelector('img')

    if (!img) return

    img.src = image ?? ''
  }, [image, cursor])

  const handleObjectMouseDown = useCallback(
    (e: React.MouseEvent<HTMLElement, MouseEvent>, anchor: Anchor) => {
      if (e.button !== 0) return

      if (toolType !== 'add' || currentLayerType !== 'object') return

      const { clientX, clientY } = e
      objectToolMouseRef.current = {
        x: clientX,
        y: clientY,
        x2: clientX,
        y2: clientY,
      }

      if (!anchor) return

      const { x: offsetX, y: offsetY } = getAnchorOffset(anchor)

      const x = (clientX - offsetX) / zoomLevel
      const y = (clientY - offsetY) / zoomLevel

      if (cursor) {
        cursor.style.visibility = 'visible'
        cursor.style.top = `${y}px`
        cursor.style.left = `${x}px`
        cursor.style.width = '0px'
        cursor.style.height = '0px'
      }
    },
    [toolType, zoomLevel, cursor, currentLayerType]
  )

  const handleObjectMouseUp = useCallback(
    (e: React.MouseEvent<HTMLElement, MouseEvent>, anchor: Anchor) => {
      if (
        toolType !== 'add' ||
        currentLayerType !== 'object' ||
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
        if (cursor) cursor.style.visibility = 'hidden'
        objectToolMouseRef.current = null
        return
      }

      const { x: offsetX, y: offsetY } = getAnchorOffset(anchor)

      const x = (objectToolMouseRef.current.x - offsetX) / zoomLevel
      const y = (objectToolMouseRef.current.y - offsetY) / zoomLevel

      const x2 = (objectToolMouseRef.current.x2 - offsetX) / zoomLevel
      const y2 = (objectToolMouseRef.current.y2 - offsetY) / zoomLevel

      const width = Math.abs(x2 - x)
      const height = Math.abs(y2 - y)

      if (cursor) {
        cursor.style.visibility = 'hidden'
      }

      editorDispatch(addObject({ x, y, x2, y2, width, height }))
      objectToolMouseRef.current = null
    },
    [toolType, zoomLevel, editorDispatch, cursor, currentLayerType]
  )

  const handleObjectMouseMove = useCallback(
    (
      e: React.MouseEvent<HTMLElement, MouseEvent>,
      anchor: (HTMLElement | null) | MutableRefObject<HTMLDivElement | null>
    ) => {
      const { clientX, clientY } = e

      if (!objectToolMouseRef.current) return

      objectToolMouseRef.current = {
        ...objectToolMouseRef.current,
        x2: clientX,
        y2: clientY,
      }

      if (cursor) {
        if (!anchor) return

        const movementX = clientX - objectToolMouseRef.current.x
        const movementY = clientY - objectToolMouseRef.current.y

        const width = Math.abs(movementX) / zoomLevel
        const height = Math.abs(movementY) / zoomLevel

        const { x: offsetX, y: offsetY } = getAnchorOffset(anchor)

        const x = (clientX - offsetX) / zoomLevel
        const y = (clientY - offsetY) / zoomLevel

        if (movementY < 0) {
          cursor.style.top = `${y}px`
        } else {
          cursor.style.top = `${y - height}px`
        }

        if (movementX < 0) {
          cursor.style.left = `${x}px`
        } else {
          cursor.style.left = `${x - width}px`
        }

        cursor.style.width = `${width}px`
        cursor.style.height = `${height}px`
      }
    },
    [zoomLevel, cursor]
  )

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLElement, MouseEvent>, anchor: Anchor) => {
      if (toolType === 'add' && currentLayerType === 'object') {
        handleObjectMouseDown(e, anchor)
      }
    },
    [toolType, handleObjectMouseDown, currentLayerType]
  )

  const handleMouseUp = useCallback(
    (e: React.MouseEvent<HTMLElement, MouseEvent>, anchor: Anchor) => {
      if (toolType === 'add' && currentLayerType === 'object') {
        handleObjectMouseUp(e, anchor)
      }
    },
    [toolType, handleObjectMouseUp, currentLayerType]
  )

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLElement, MouseEvent>, anchor: Anchor) => {
      if (toolType === 'add' && currentLayerType === 'object') {
        handleObjectMouseMove(e, anchor)
      }
    },
    [toolType, handleObjectMouseMove, currentLayerType]
  )

  return (
    <CursorContext.Provider
      value={[
        cursor,
        {
          setCursor,
          handleMouseDown,
          handleMouseUp,
          handleMouseMove,
        },
      ]}
    >
      {children}
    </CursorContext.Provider>
  )
}
