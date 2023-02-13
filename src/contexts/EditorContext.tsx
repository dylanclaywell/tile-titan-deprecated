import React, { createContext, useCallback, useRef, useState } from 'react'
import { v4 as generateId } from 'uuid'

import { LayerType } from '../types/layer'
import { generateMap } from '../utils/generateMap'
import { TilemapType } from '../types/tilemap'

export type ToolType = 'tile' | 'eraser' | 'grid'

export type Tool = {
  type: ToolType
  canvas: HTMLCanvasElement
  tilesetX?: number
  tilesetY?: number
  tilesetName?: string
}

export type State = {
  tool: Tool
  cursorRef: React.MutableRefObject<HTMLDivElement | null>
  zoomLevel: number
  showGrid: boolean
  selectedLayerId: string | null
  layers: LayerType[]
}

export type Actions = {
  updateCanvas: (args: {
    canvas: HTMLCanvasElement
    tilesetX: number
    tilesetY: number
    tilesetName: string
  }) => void
  updateTilemap: (args: {
    tileX: number
    tileY: number
    tilesetX: number
    tilesetY: number
    tilesetName: string
  }) => void
  updateTilemapSettings: (args: Partial<Omit<TilemapType, 'data'>>) => void
  handleToolClick: (type: ToolType) => void
  setCursorRef: (cursorRef: HTMLDivElement | null) => void
  setZoomLevel: (level: number) => void
  setSelectedLayerId: (id: string) => void
}

const tileCanvas = document.createElement('canvas')
tileCanvas.width = 32
tileCanvas.height = 32

const initialSelectedLayerId = generateId()
const initialState: State = {
  tool: {
    type: 'tile',
    canvas: tileCanvas,
  },
  zoomLevel: 1,
  cursorRef: { current: null },
  showGrid: true,
  layers: [
    {
      id: initialSelectedLayerId,
      name: 'Layer 1',
      tilemap: {
        height: 10,
        width: 10,
        tileHeight: 32,
        tileWidth: 32,
        name: 'Test',
        data: generateMap(10, 10),
      },
    },
  ],
  selectedLayerId: initialSelectedLayerId,
}

export const EditorContext = createContext<[State, Actions]>([
  initialState,
  {
    updateCanvas: () => undefined,
    handleToolClick: () => undefined,
    setCursorRef: () => undefined,
    setZoomLevel: () => undefined,
    updateTilemap: () => undefined,
    setSelectedLayerId: () => undefined,
    updateTilemapSettings: () => undefined,
  },
])

export function EditorProvider({ children }: { children: React.ReactNode }) {
  const cursorRef = useRef<HTMLDivElement | null>(null)
  const [state, setState] = useState<State>(initialState)

  function setCursorRef(ref: HTMLDivElement | null) {
    cursorRef.current = ref
  }

  function updateCanvas({
    canvas,
    tilesetX,
    tilesetY,
    tilesetName,
  }: {
    canvas: HTMLCanvasElement
    tilesetX: number
    tilesetY: number
    tilesetName: string
  }) {
    setState({
      ...state,
      tool: {
        ...state.tool,
        type: 'tile',
        canvas,
        tilesetX,
        tilesetY,
        tilesetName,
      },
    })
  }

  function toggleGrid() {
    setState({
      ...state,
      showGrid: !state.showGrid,
    })
  }

  function handleToolClick(type: ToolType) {
    switch (type) {
      case 'tile':
        {
          const tool: Tool = {
            ...state.tool,
            type,
          }
          setState({
            ...state,
            tool,
          })
        }
        break
      case 'eraser':
        {
          const tool: Tool = {
            ...state.tool,
            type,
          }
          const canvas = tool.canvas
          const context = canvas.getContext('2d')
          context?.clearRect(0, 0, canvas.width, canvas.height)
          setState({
            ...state,
            tool,
          })
        }
        break
      case 'grid':
        toggleGrid()
        break
    }
  }

  function setZoomLevel(level: number) {
    setState({
      ...state,
      zoomLevel: level,
    })
  }

  const updateTilemap = useCallback(
    ({
      tileX,
      tileY,
      tilesetX,
      tilesetY,
      tilesetName,
    }: {
      tileX: number
      tileY: number
      tilesetX: number
      tilesetY: number
      tilesetName: string
    }) => {
      setState((state) => {
        const selectedLayer = state.layers.find(
          (layer) => layer.id === state.selectedLayerId
        )

        if (!selectedLayer) return state

        const newTilemap = { ...selectedLayer.tilemap }
        newTilemap.data[tileY][tileX] = {
          tilesetName,
          tilesetX,
          tilesetY,
        }

        const newLayers = state.layers.map((layer) =>
          layer.id === selectedLayer.id
            ? {
                ...layer,
                tilemap: newTilemap,
              }
            : layer
        )
        return {
          ...state,
          layers: newLayers,
        }
      })
    },
    []
  )

  function setSelectedLayerId(id: string) {
    setState({
      ...state,
      selectedLayerId: id,
    })
  }

  function updateTilemapSettings(tilemap: Partial<Omit<TilemapType, 'data'>>) {
    setState((state) => {
      const selectedLayer = state.layers.find(
        (layer) => layer.id === state.selectedLayerId
      )

      if (!selectedLayer) return state

      const newLayers = state.layers.map((layer) =>
        layer.id === selectedLayer.id
          ? {
              ...layer,
              tilemap: {
                ...layer.tilemap,
                ...tilemap,
              },
            }
          : layer
      )
      return {
        ...state,
        layers: newLayers,
      }
    })
  }

  const actions = {
    updateCanvas,
    handleToolClick,
    setCursorRef,
    setZoomLevel,
    updateTilemap,
    setSelectedLayerId,
    updateTilemapSettings,
  }

  return (
    <EditorContext.Provider value={[{ ...state, cursorRef }, actions]}>
      {children}
    </EditorContext.Provider>
  )
}
