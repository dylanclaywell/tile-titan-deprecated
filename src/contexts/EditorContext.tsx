import React, { createContext, useCallback, useRef, useState } from 'react'
import { v4 as generateId } from 'uuid'

import { LayerType } from '../types/layer'
import { generateMap } from '../utils/generateMap'

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
    layerId: string
    tileX: number
    tileY: number
    tilesetX: number
    tilesetY: number
    tilesetName: string
  }) => void
  updateLayerSettings: (
    id: string,
    layer: Partial<Omit<LayerType, 'data'>>
  ) => void
  handleToolClick: (type: ToolType) => void
  setCursorRef: (cursorRef: HTMLDivElement | null) => void
  setZoomLevel: (level: number) => void
  setSelectedLayerId: (id: string) => void
  addLayer: () => void
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
      height: 10,
      width: 10,
      tileHeight: 32,
      tileWidth: 32,
      tilemap: generateMap(10, 10),
      isVisible: true,
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
    updateLayerSettings: () => undefined,
    addLayer: () => undefined,
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
    setState((state) => ({
      ...state,
      zoomLevel: level,
    }))
  }

  const updateTilemap = useCallback(
    ({
      layerId,
      tileX,
      tileY,
      tilesetX,
      tilesetY,
      tilesetName,
    }: {
      layerId: string
      tileX: number
      tileY: number
      tilesetX: number
      tilesetY: number
      tilesetName: string
    }) => {
      setState((state) => {
        const selectedLayer = state.layers.find((layer) => layer.id === layerId)

        if (!selectedLayer) return state

        const newTilemap = selectedLayer.tilemap
        newTilemap[tileY][tileX] = {
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
    setState((state) => ({
      ...state,
      selectedLayerId: id,
    }))
  }

  function updateLayerSettings(
    layerId: string,
    newLayer: Partial<Omit<LayerType, 'tilemap'>>
  ) {
    setState((state) => {
      const selectedLayer = state.layers.find((layer) => layer.id === layerId)

      if (!selectedLayer) return state

      const newLayers = state.layers.map((layer) => {
        return layer.id === selectedLayer.id
          ? {
              ...layer,
              ...newLayer,
            }
          : layer
      })
      return {
        ...state,
        layers: newLayers,
      }
    })
  }

  function addLayer() {
    const layer: LayerType = {
      id: generateId(),
      name: `Layer ${state.layers.length + 1}`,
      height: 10,
      width: 10,
      tileHeight: 32,
      tileWidth: 32,
      tilemap: generateMap(10, 10),
      isVisible: true,
    }
    setState((state) => ({
      ...state,
      layers: [...state.layers, layer],
    }))
  }

  const actions = {
    updateCanvas,
    handleToolClick,
    setCursorRef,
    setZoomLevel,
    updateTilemap,
    setSelectedLayerId,
    updateLayerSettings,
    addLayer,
  }

  return (
    <EditorContext.Provider value={[{ ...state, cursorRef }, actions]}>
      {children}
    </EditorContext.Provider>
  )
}
