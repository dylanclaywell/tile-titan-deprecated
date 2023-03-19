import React, {
  Dispatch,
  createContext,
  useEffect,
  useReducer,
  useRef,
} from 'react'
import { v4 as generateId } from 'uuid'

import {
  LayerType,
  ObjectLayer,
  ObjectLayerType,
  StructureLayerType,
  TileLayerType,
  Type,
} from '../types/layer'
import { generateMap } from '../utils/generateMap'
import { ObjectType } from '../types/object'
import { FileType } from '../types/file'
import { StructureType } from '../types/structure'

export type ToolType = 'select' | 'tile' | 'eraser' | 'grid' | 'object'

export type Tool = {
  type: ToolType
  canvas: HTMLCanvasElement
  tilesetX?: number
  tilesetY?: number
  tilesetName?: string
}

export type State = {
  files: FileType[]
  tool: Tool
  cursorRef: React.MutableRefObject<HTMLDivElement | null>
  structureRef: React.MutableRefObject<HTMLDivElement | null>
  zoomLevel: number
  showGrid: boolean
  selectedLayerId: string | null
  selectedFileId: string | null
}

export type Actions =
  | {
      type: 'UPDATE_CANVAS'
      canvas: HTMLCanvasElement
      tilesetX: number
      tilesetY: number
      tilesetName: string
    }
  | {
      type: 'UPDATE_TILEMAP'
      layerId: string
      tileX: number
      tileY: number
      tilesetX: number
      tilesetY: number
      tilesetName: string
      tileData: string
    }
  | {
      type: 'UPDATE_LAYER_SETTINGS'
      id: string
      layer: Partial<Omit<LayerType, 'data' | 'type'>>
    }
  | { type: 'HANDLE_TOOL_CLICK'; tool: ToolType }
  | { type: 'SET_ZOOM_LEVEL'; level: number }
  | { type: 'SET_SELECTED_LAYER_ID'; id: string }
  | { type: 'ADD_LAYER'; layerType: Type }
  | {
      type: 'ADD_OBJECT'
      x: number
      y: number
      x2: number
      y2: number
      width: number
      height: number
    }
  | {
      type: 'UPDATE_OBJECT_SETTINGS'
      layerId: string
      objectId: string
      object: Partial<ObjectType>
    }
  | { type: 'REMOVE_LAYER'; id: string }
  | { type: 'REMOVE_OBJECT'; layerId: string; objectId: string }
  | { type: 'REGENERATE_MAP'; layerId: string; width: number; height: number }
  | { type: 'ADD_FILE' }
  | { type: 'SELECT_FILE'; id: string }
  | {
      type: 'UPDATE_FILE_SETTINGS'
      name: string
      width: number
      height: number
      tileWidth: number
      tileHeight: number
      isStructure: boolean
    }
  | { type: 'DELETE_FILE'; id: string }
  | {
      type: 'ADD_STRUCTURE'
      fileId: string
      x: number
      y: number
    }

const tileCanvas = document.createElement('canvas')
tileCanvas.width = 32
tileCanvas.height = 32

const initialState: State = {
  files: [],
  tool: {
    type: 'tile',
    canvas: tileCanvas,
  },
  zoomLevel: 1,
  cursorRef: { current: null },
  structureRef: { current: null },
  showGrid: true,
  selectedFileId: null,
  selectedLayerId: null,
}

export const EditorContext = createContext<
  [
    State,
    {
      dispatch: Dispatch<Actions>
      setCursorRef: (cursorRef: HTMLDivElement | null) => void
      setStructureRef: (structureRef: HTMLDivElement | null) => void
    }
  ]
>([
  initialState,
  {
    dispatch: () => null,
    setCursorRef: () => null,
    setStructureRef: () => null,
  },
])

const reducer = (state: State, action: Actions): State => {
  switch (action.type) {
    case 'UPDATE_CANVAS': {
      const { canvas, tilesetX, tilesetY, tilesetName } = action
      return {
        ...state,
        tool: {
          ...state.tool,
          type: 'tile',
          canvas,
          tilesetX,
          tilesetY,
          tilesetName,
        },
      }
    }
    case 'UPDATE_TILEMAP': {
      const {
        layerId,
        tileX,
        tileY,
        tilesetX,
        tilesetY,
        tilesetName,
        tileData,
      } = action
      const selectedFile = state.files.find(
        (file) => file.id === state.selectedFileId
      )

      if (!selectedFile) return state

      const selectedLayer = selectedFile.layers.find(
        (layer) => layer.id === layerId
      )

      if (!selectedLayer) return state

      if (selectedLayer.type !== 'tilelayer') return state

      const newTilemap = selectedLayer.data
      newTilemap[tileY][tileX] = {
        tilesetName,
        tilesetX,
        tilesetY,
        tileData,
      }

      const newLayers: LayerType[] = selectedFile.layers.map((layer) => {
        return layer.id === selectedLayer.id && layer.type === 'tilelayer'
          ? {
              ...layer,
              data: newTilemap,
            }
          : layer
      })
      return {
        ...state,
        files: [
          ...state.files.filter((file) => file.id !== selectedFile.id),
          {
            ...selectedFile,
            layers: newLayers,
          },
        ],
      }
    }
    case 'UPDATE_LAYER_SETTINGS': {
      const { id, layer: layerType } = action
      const selectedFile = state.files.find(
        (file) => file.id === state.selectedFileId
      )

      if (!selectedFile) return state

      const selectedLayer = selectedFile.layers.find((layer) => layer.id === id)

      if (!selectedLayer) return state

      const newLayers = selectedFile.layers.map((layer) => {
        return layer.id === selectedLayer.id
          ? {
              ...layer,
              ...layerType,
            }
          : layer
      })
      return {
        ...state,
        files: [
          ...state.files.filter((file) => file.id !== selectedFile.id),
          {
            ...selectedFile,
            layers: newLayers,
          },
        ],
      }
    }
    case 'HANDLE_TOOL_CLICK': {
      const { tool: type } = action
      switch (type) {
        case 'select': {
          const tool: Tool = {
            ...state.tool,
            type,
          }
          return {
            ...state,
            tool,
          }
        }
        case 'object': {
          const tool: Tool = {
            ...state.tool,
            type,
          }
          return {
            ...state,
            tool,
          }
        }
        case 'tile': {
          const tool: Tool = {
            ...state.tool,
            type,
          }
          return {
            ...state,
            tool,
          }
        }
        case 'eraser': {
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
        }
        case 'grid':
          return {
            ...state,
            showGrid: !state.showGrid,
          }
      }
      break
    }
    case 'UPDATE_OBJECT_SETTINGS': {
      const { layerId, objectId, object: newObject } = action
      const selectedFile = state.files.find(
        (file) => file.id === state.selectedFileId
      )

      if (!selectedFile) return state

      const selectedLayer = ObjectLayer.safeParse(
        selectedFile.layers.find((layer) => layer.id === layerId)
      )

      if (!selectedLayer.success) return state

      const newLayers = selectedFile.layers.map((layer) => {
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
        files: [
          ...state.files.filter((file) => file.id !== selectedFile.id),
          {
            ...selectedFile,
            layers: newLayers,
          },
        ],
      }
    }
    case 'SET_ZOOM_LEVEL': {
      const { level } = action
      return {
        ...state,
        zoomLevel: level,
      }
    }
    case 'SET_SELECTED_LAYER_ID': {
      const { id } = action
      return {
        ...state,
        selectedLayerId: id,
      }
    }
    case 'ADD_LAYER': {
      const { layerType } = action
      const selectedFile = state.files.find(
        (file) => file.id === state.selectedFileId
      )

      if (!selectedFile) return state

      const sortOrder = selectedFile.layers.length + 1

      switch (layerType) {
        case 'tilelayer': {
          const layer: TileLayerType = {
            id: generateId(),
            type: layerType,
            name: `Layer ${selectedFile.layers.length + 1}`,
            data: generateMap(selectedFile.width, selectedFile.height),
            isVisible: true,
            sortOrder,
          }
          return {
            ...state,
            files: [
              ...state.files.filter((file) => file.id !== selectedFile.id),
              {
                ...selectedFile,
                layers: [layer, ...selectedFile.layers],
              },
            ],
          }
        }
        case 'objectlayer': {
          const layer: ObjectLayerType = {
            id: generateId(),
            type: layerType,
            name: `Layer ${selectedFile.layers.length + 1}`,
            data: [],
            isVisible: true,
            sortOrder,
          }
          return {
            ...state,
            files: [
              ...state.files.filter((file) => file.id !== selectedFile.id),
              {
                ...selectedFile,
                layers: [layer, ...selectedFile.layers],
              },
            ],
          }
        }
        case 'structurelayer': {
          const layer: StructureLayerType = {
            id: generateId(),
            type: layerType,
            name: `Layer ${selectedFile.layers.length + 1}`,
            data: [],
            isVisible: true,
            sortOrder,
          }
          return {
            ...state,
            files: [
              ...state.files.filter((file) => file.id !== selectedFile.id),
              {
                ...selectedFile,
                layers: [layer, ...selectedFile.layers],
              },
            ],
          }
        }
        default: {
          return state
        }
      }
    }
    case 'ADD_OBJECT': {
      const { x, y, x2, y2, width, height } = action
      const selectedFile = state.files.find(
        (file) => file.id === state.selectedFileId
      )

      if (!selectedFile) return state

      const selectedLayer = selectedFile.layers.find(
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

      const newLayers = selectedFile.layers.map((layer) => {
        return layer.id === selectedLayer.id && layer.type === 'objectlayer'
          ? {
              ...layer,
              data: [...layer.data, newObject],
            }
          : layer
      })

      return {
        ...state,
        files: [
          ...state.files.filter((file) => file.id !== selectedFile.id),
          {
            ...selectedFile,
            layers: newLayers,
          },
        ],
      }
    }
    case 'REMOVE_LAYER': {
      const { id } = action
      const selectedFile = state.files.find(
        (file) => file.id === state.selectedFileId
      )

      if (!selectedFile) return state

      const layers = selectedFile.layers.filter((layer) => layer.id !== id)
      return {
        ...state,
        files: [
          ...state.files.filter((file) => file.id !== selectedFile.id),
          {
            ...selectedFile,
            layers,
          },
        ],
      }
    }
    case 'REMOVE_OBJECT': {
      const { layerId, objectId } = action
      const selectedFile = state.files.find(
        (file) => file.id === state.selectedFileId
      )

      if (!selectedFile) return state

      const selectedLayer = ObjectLayer.safeParse(
        selectedFile.layers.find((layer) => layer.id === layerId)
      )

      if (!selectedLayer.success) return state

      const newLayers = selectedFile.layers.map((layer) => {
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
        files: [
          ...state.files.filter((file) => file.id !== selectedFile.id),
          {
            ...selectedFile,
            layers: newLayers,
          },
        ],
      }
    }
    case 'REGENERATE_MAP': {
      const { layerId, width, height } = action
      const selectedFile = state.files.find(
        (file) => file.id === state.selectedFileId
      )

      if (!selectedFile) return state

      const selectedLayer = selectedFile.layers.find(
        (layer) => layer.id === layerId
      )

      if (!selectedLayer) return state

      if (selectedLayer.type === 'tilelayer') {
        const newTilemap = generateMap(width, height)
        const newLayers: LayerType[] = selectedFile.layers.map((layer) => {
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
          files: [
            ...state.files.filter((file) => file.id !== selectedFile.id),
            {
              ...selectedFile,
              layers: newLayers,
            },
          ],
        }
      } else {
        return state
      }
    }
    case 'ADD_FILE': {
      const newFile: FileType = {
        id: generateId(),
        width: 10,
        height: 10,
        tileWidth: 32,
        tileHeight: 32,
        name: `Untitled ${state.files.length + 1}`,
        layers: [],
        sortOrder: state.files.length + 1,
        isStructure: false,
      }

      return {
        ...state,
        files: [...state.files, newFile],
        selectedFileId: newFile.id,
      }
    }
    case 'DELETE_FILE': {
      const { id } = action
      return {
        ...state,
        files: state.files.filter((f) => f.id !== id),
      }
    }
    case 'SELECT_FILE': {
      const { id } = action
      return {
        ...state,
        selectedFileId: id,
      }
    }
    case 'UPDATE_FILE_SETTINGS': {
      const { name, width, height, tileWidth, tileHeight, isStructure } = action
      const currentFile = state.files.find(
        (file) => file.id === state.selectedFileId
      )

      if (!currentFile) return state

      const layers = currentFile.layers.map((layer) => {
        if (
          layer.type === 'tilelayer' &&
          (currentFile.width !== width ||
            currentFile.height !== height ||
            currentFile.tileWidth !== tileWidth ||
            currentFile.tileHeight !== tileHeight)
        ) {
          layer.data = generateMap(width, height)
        }

        return layer
      })

      return {
        ...state,
        files: [
          ...state.files.filter((file) => file.id !== currentFile.id),
          {
            ...currentFile,
            name,
            layers,
            width,
            height,
            tileWidth,
            tileHeight,
            isStructure,
          },
        ],
      }
    }
    case 'ADD_STRUCTURE': {
      const { x, y, fileId } = action

      const currentFile = state.files.find((f) => f.id === state.selectedFileId)
      if (!currentFile) return state

      const currentLayer = currentFile.layers.find(
        (l) => l.id === state.selectedLayerId
      )
      if (!currentLayer) return state

      if (currentLayer.type !== 'structurelayer') return state

      const newStructure: StructureType = {
        fileId,
        x,
        y,
      }

      return {
        ...state,
        files: [
          ...state.files.filter((f) => f.id !== currentFile.id),
          {
            ...currentFile,
            layers: [
              ...currentFile.layers.filter((l) => l.id !== currentLayer.id),
              {
                ...currentLayer,
                data: [...currentLayer.data, newStructure],
              },
            ],
          },
        ],
      }
    }
    default:
      return state
  }
}

export function EditorProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState)
  const cursorRef = useRef<HTMLDivElement | null>(null)
  const structureRef = useRef<HTMLDivElement | null>(null)

  function setCursorRef(ref: HTMLDivElement | null) {
    cursorRef.current = ref
  }

  function setStructureRef(ref: HTMLDivElement | null) {
    structureRef.current = ref
  }

  useEffect(
    function updateTileImagesWithLayerData() {
      const selectedFile = state.files.find(
        (file) => file.id === state.selectedFileId
      )

      if (!selectedFile) return

      const tileImages = document.querySelectorAll('.tile')
      const layers = selectedFile.layers.filter(
        (l): l is TileLayerType => l.type === 'tilelayer'
      )

      layers.forEach((layer) => {
        layer.data.forEach((row, j) => {
          row.forEach((tile, k) => {
            const tileImage = tileImages[j * row.length + k]
            if (!tileImage || !(tileImage instanceof HTMLImageElement)) return

            tileImage.src = tile.tileData ?? ''
          })
        })
      })
    },
    [state.selectedFileId]
  )

  const actions = {
    dispatch,
    setCursorRef,
    setStructureRef,
  }

  return (
    <EditorContext.Provider
      value={[{ ...state, cursorRef, structureRef }, actions]}
    >
      {children}
    </EditorContext.Provider>
  )
}
