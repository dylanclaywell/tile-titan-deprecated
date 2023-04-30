import React, { MutableRefObject, useCallback, useEffect, useRef } from 'react'
import { createSelector } from 'reselect'
import { isTileCursorMetadata } from '../features/cursor/helpers'
import { addObject, updateTilemap } from '../features/editor/editorSlice'
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
    (state: RootState) => {
      const selectedFile = state.editor.files.find(
        (file) => file.id === state.editor.selectedFileId
      )

      return {
        zoomLevel: state.editor.zoomLevel,
        tileWidth: selectedFile?.tileWidth ?? 0,
        tileHeight: selectedFile?.tileHeight ?? 0,
        tilemapWidth: selectedFile?.width ?? 0,
        tilemapHeight: selectedFile?.height ?? 0,
      }
    },
    (
      state,
      zoomLevel,
      selectedFileId,
      tileWidth,
      tileHeight,
      tilemapWidth,
      tilemapHeight
    ) => ({
      zoomLevel,
      selectedFileId,
      tileWidth,
      tileHeight,
      tilemapWidth,
      tilemapHeight,
    }),
  ],
  (state) => ({
    zoomLevel: state.zoomLevel,
    tileWidth: state.tileWidth,
    tileHeight: state.tileHeight,
    tilemapWidth: state.tilemapWidth,
    tilemapHeight: state.tilemapHeight,
  })
)

export function CursorProvider({ children }: { children: React.ReactNode }) {
  const { zoomLevel, tileWidth, tileHeight, tilemapWidth, tilemapHeight } =
    useAppSelector((state) => {
      const selectedFile = state.editor.files.find(
        (file) => file.id === state.editor.selectedFileId
      )
      return getState(
        state,
        state.editor.zoomLevel,
        state.editor.selectedFileId,
        selectedFile?.tileWidth,
        selectedFile?.tileHeight,
        selectedFile?.width,
        selectedFile?.height
      )
    })
  const toolType = useAppSelector((state) => state.cursor.toolType)
  const currentLayerType = useAppSelector(selectCurrentLayer)?.type
  const currentLayerId = useAppSelector(selectCurrentLayer)?.id
  const objectToolMouseRef = useRef<{
    x: number
    y: number
    x2: number
    y2: number
  } | null>(null)

  const image = useAppSelector((state) => state.cursor.image)
  const x = useAppSelector((state) => state.cursor.x)
  const y = useAppSelector((state) => state.cursor.y)
  const cursorMetadata = useAppSelector((state) => state.cursor.metadata)
  const editorDispatch = useAppDispatch()

  const [cursor, setCursor] = React.useState<HTMLDivElement | null>(null)

  useEffect(() => {
    if (currentLayerType !== 'object' && cursor) {
      cursor.style.visibility = ''
      cursor.style.height = ''
      cursor.style.width = ''
    }
  }, [currentLayerId, currentLayerType, cursor])

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

  const handleTileMouseDown = useCallback(() => {
    if (cursorMetadata && !isTileCursorMetadata(cursorMetadata)) return

    if (x < 0 || y < 0) return
    if (
      x > (tilemapWidth - 1) * tileWidth ||
      y > (tilemapHeight - 1) * tileHeight
    )
      return

    if (toolType === 'add') {
      editorDispatch(
        updateTilemap({
          layerId: currentLayerId ?? '',
          tileX: x / tileWidth,
          tileY: y / tileHeight,
          tilesetX: cursorMetadata?.tilesetX ?? -1,
          tilesetY: cursorMetadata?.tilesetY ?? -1,
          tilesetName: cursorMetadata?.tilesetName ?? 'unknown',
          tilesetId: cursorMetadata?.tilesetId ?? 'unknown',
          tileData: image ?? '',
        })
      )
    } else if (toolType === 'remove') {
      editorDispatch(
        updateTilemap({
          layerId: currentLayerId ?? '',
          tileX: x / tileWidth,
          tileY: y / tileHeight,
          tilesetX: -1,
          tilesetY: -1,
          tilesetName: 'unknown',
          tilesetId: 'unknown',
          tileData: '',
        })
      )
    }
  }, [
    currentLayerId,
    cursorMetadata,
    editorDispatch,
    image,
    x,
    y,
    tileWidth,
    tileHeight,
    tilemapWidth,
    tilemapHeight,
    toolType,
  ])

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
        cursor.style.zIndex = '1000'
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
        cursor.style.zIndex = '0'
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
      } else if (currentLayerType === 'tile') {
        handleTileMouseDown()
      }
    },
    [toolType, handleObjectMouseDown, handleTileMouseDown, currentLayerType]
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
