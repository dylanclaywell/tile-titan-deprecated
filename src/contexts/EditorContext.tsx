import React, { createContext, useCallback, useRef, useState } from 'react'
import { v4 as generateId } from 'uuid'

import {
  LayerType,
  ObjectLayer,
  ObjectLayerType,
  TileLayerType,
} from '../types/layer'
import { generateMap } from '../utils/generateMap'
import { ObjectType } from '../types/object'
import { TilemapType } from '../types/tilemap'

export type ToolType = 'select' | 'tile' | 'eraser' | 'grid' | 'object'

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
  tileWidth: number
  tileHeight: number
  width: number
  height: number
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
  addLayer: (type: 'tilelayer' | 'objectlayer') => void
  addObject: (args: {
    x: number
    y: number
    x2: number
    y2: number
    width: number
    height: number
  }) => void
  updateTilemapSettings: (args: {
    width: number
    height: number
    tileWidth: number
    tileHeight: number
  }) => void
  updateObjectSettings: (
    layerId: string,
    objectId: string,
    object: Partial<ObjectType>
  ) => void
  removeLayer: (id: string) => void
  removeObject: (layerId: string, objectId: string) => void
  regenerateMap: (layerId: string, width: number, height: number) => void
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
  height: 10,
  width: 10,
  tileHeight: 32,
  tileWidth: 32,
  layers: [
    {
      id: initialSelectedLayerId,
      type: 'tilelayer',
      name: 'Layer 1',
      data: generateMap(10, 10),
      isVisible: true,
      sortOrder: 0,
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
    updateTilemapSettings: () => undefined,
    removeLayer: () => undefined,
    addObject: () => undefined,
    updateObjectSettings: () => undefined,
    removeObject: () => undefined,
    regenerateMap: () => undefined,
  },
])

export function EditorProvider({ children }: { children: React.ReactNode }) {
  const cursorRef = useRef<HTMLDivElement | null>(null)
  const [state, setState] = useState<State>(initialState)

  function setCursorRef(ref: HTMLDivElement | null) {
    cursorRef.current = ref
  }

  const updateCanvas = useCallback(
    ({
      canvas,
      tilesetX,
      tilesetY,
      tilesetName,
    }: {
      canvas: HTMLCanvasElement
      tilesetX: number
      tilesetY: number
      tilesetName: string
    }) => {
      setState((state) => ({
        ...state,
        tool: {
          ...state.tool,
          type: 'tile',
          canvas,
          tilesetX,
          tilesetY,
          tilesetName,
        },
      }))
    },
    []
  )

  function toggleGrid() {
    setState((state) => ({
      ...state,
      showGrid: !state.showGrid,
    }))
  }

  function handleToolClick(type: ToolType) {
    switch (type) {
      case 'select':
        {
          setState((state) => {
            const tool: Tool = {
              ...state.tool,
              type,
            }
            return {
              ...state,
              tool,
            }
          })
        }
        break
      case 'object':
        {
          setState((state) => {
            const tool: Tool = {
              ...state.tool,
              type,
            }
            return {
              ...state,
              tool,
            }
          })
        }
        break
      case 'tile':
        {
          setState((state) => {
            const tool: Tool = {
              ...state.tool,
              type,
            }
            return {
              ...state,
              tool,
            }
          })
        }
        break
      case 'eraser':
        {
          setState(() => {
            const tool: Tool = {
              ...state.tool,
              type,
            }
            const canvas = tool.canvas
            const context = canvas.getContext('2d')
            context?.clearRect(0, 0, canvas.width, canvas.height)
            return {
              ...state,
              tool,
            }
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

        if (selectedLayer.type === 'tilelayer') {
          const newTilemap = selectedLayer.data
          newTilemap[tileY][tileX] = {
            tilesetName,
            tilesetX,
            tilesetY,
          }

          const newLayers: LayerType[] = state.layers.map((layer) => {
            return layer.id === selectedLayer.id && layer.type === 'tilelayer'
              ? {
                  ...layer,
                  data: newTilemap,
                }
              : layer
          })
          return {
            ...state,
            layers: newLayers,
          }
        } else {
          return state
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
    newLayer: Partial<Omit<LayerType, 'data' | 'type'>>
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

  function regenerateMap(layerId: string, width: number, height: number) {
    setState((state) => {
      const selectedLayer = state.layers.find((layer) => layer.id === layerId)

      if (!selectedLayer) return state

      if (selectedLayer.type === 'tilelayer') {
        const newTilemap = generateMap(width, height)
        const newLayers: LayerType[] = state.layers.map((layer) => {
          return layer.id === selectedLayer.id && layer.type === 'tilelayer'
            ? {
                ...layer,
                data: newTilemap,
                width,
                height,
              }
            : layer
        })
        return {
          ...state,
          layers: newLayers,
        }
      } else {
        return state
      }
    })
  }

  function updateTilemapSettings({
    width,
    height,
    tileWidth,
    tileHeight,
  }: {
    width: number
    height: number
    tileWidth: number
    tileHeight: number
  }) {
    setState((state) => {
      return {
        ...state,
        width,
        height,
        tileWidth,
        tileHeight,
      }
    })
  }

  function addLayer(type: 'tilelayer' | 'objectlayer') {
    setState((state) => {
      const sortOrder = state.layers.length + 1

      if (type === 'tilelayer') {
        const layer: TileLayerType = {
          id: generateId(),
          type,
          name: `Layer ${state.layers.length + 1}`,
          data: generateMap(state.width, state.height),
          isVisible: true,
          sortOrder,
        }
        return {
          ...state,
          layers: [layer, ...state.layers],
        }
      } else {
        const layer: ObjectLayerType = {
          id: generateId(),
          type,
          name: `Layer ${state.layers.length + 1}`,
          data: [],
          isVisible: true,
          sortOrder,
        }
        return {
          ...state,
          layers: [layer, ...state.layers],
        }
      }
    })
  }

  function removeLayer(layerId: string) {
    setState((state) => {
      const layers = state.layers.filter((layer) => layer.id !== layerId)
      return {
        ...state,
        layers,
      }
    })
  }

  function addObject({
    x,
    y,
    x2,
    y2,
    width,
    height,
  }: {
    x: number
    y: number
    x2: number
    y2: number
    width: number
    height: number
  }) {
    setState((state) => {
      const selectedLayer = state.layers.find(
        (layer) => layer.id === state.selectedLayerId
      )

      if (!selectedLayer || selectedLayer.type !== 'objectlayer') return state

      const newObject: ObjectType = {
        id: generateId(),
        name: `Object ${selectedLayer.data.length + 1}`,
        sortOrder: selectedLayer.data.length + 1,
        isVisible: true,
        x,
        y,
        x2,
        y2,
        width,
        height,
      }

      const newLayers = state.layers.map((layer) => {
        return layer.id === selectedLayer.id && layer.type === 'objectlayer'
          ? {
              ...layer,
              data: [...layer.data, newObject],
            }
          : layer
      })

      return {
        ...state,
        layers: newLayers,
      }
    })
  }

  function updateObjectSettings(
    layerId: string,
    objectId: string,
    newObject: Partial<ObjectType>
  ) {
    setState((state) => {
      const selectedLayer = ObjectLayer.safeParse(
        state.layers.find((layer) => layer.id === layerId)
      )

      if (!selectedLayer.success) return state

      const newLayers = state.layers.map((layer) => {
        const verifiedLayer = ObjectLayer.safeParse(layer)
        if (!verifiedLayer.success) return layer

        if (verifiedLayer.data.id === selectedLayer.data.id) {
          const existingObject = selectedLayer.data.data.find(
            (object) => object.id === objectId
          )

          if (!existingObject) return verifiedLayer.data

          const newObjects = selectedLayer.data.data.map((object) => {
            return object.id === existingObject.id
              ? {
                  ...object,
                  ...newObject,
                }
              : object
          })

          return {
            ...verifiedLayer.data,
            data: newObjects,
          }
        }

        return layer
      })
      return {
        ...state,
        layers: newLayers,
      }
    })
  }

  function removeObject(layerId: string, objectId: string) {
    setState((state) => {
      const selectedLayer = ObjectLayer.safeParse(
        state.layers.find((layer) => layer.id === layerId)
      )

      if (!selectedLayer.success) return state

      const newLayers = state.layers.map((layer) => {
        const verifiedLayer = ObjectLayer.safeParse(layer)
        if (!verifiedLayer.success) return layer

        if (verifiedLayer.data.id === selectedLayer.data.id) {
          const newObjects = selectedLayer.data.data.filter(
            (object) => object.id !== objectId
          )

          return {
            ...verifiedLayer.data,
            data: newObjects,
          }
        }

        return layer
      })
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
    updateLayerSettings,
    addLayer,
    updateTilemapSettings,
    updateObjectSettings,
    removeLayer,
    addObject,
    removeObject,
    regenerateMap,
  }

  return (
    <EditorContext.Provider value={[{ ...state, cursorRef }, actions]}>
      {children}
    </EditorContext.Provider>
  )
}
