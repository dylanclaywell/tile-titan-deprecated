import { PayloadAction, createSlice } from '@reduxjs/toolkit'
import { v4 as generateId } from 'uuid'

import {
  Type,
  LayerType,
  ObjectLayer,
  ObjectLayerType,
  StructureLayerType,
  TileLayerType,
} from '../../types/layer'
import { generateMap } from '../../utils/generateMap'
import { ObjectType } from '../../types/object'
import { StructureType } from '../../types/structure'
import { FileType } from '../../types/file'
import { TilesetType } from '../../indexedDB/tileset'

type State = {
  files: FileType[]
  tilesets: TilesetType[]
  zoomLevel: number
  showGrid: boolean
  selectedLayerId: string | null
  selectedFileId: string | null
}

const initialState: State = {
  files: [],
  tilesets: [],
  zoomLevel: 1,
  showGrid: true,
  selectedFileId: null,
  selectedLayerId: null,
}

export const editorSlice = createSlice({
  name: 'editor',
  initialState,
  reducers: {
    setFiles: (state, action: PayloadAction<FileType[]>) => {
      state.files = action.payload
    },
    addTileset: (state, action: PayloadAction<TilesetType>) => {
      state.tilesets.push(action.payload)
    },
    renameTileset: (
      state,
      action: PayloadAction<{ id: string; name: string }>
    ) => {
      const { id, name } = action.payload
      const tileset = state.tilesets.find((tileset) => tileset.id === id)

      if (!tileset) return

      tileset.name = name

      state.files.forEach((file) => {
        file.layers.forEach((layer) => {
          if (layer.type === 'tile') {
            layer.data.forEach((row) => {
              row.forEach((tile) => {
                if (tile.tilesetId === id) {
                  tile.tilesetName = name
                }
              })
            })
          }
        })
      })
    },
    deleteTileset: (state, action: PayloadAction<{ id: string }>) => {
      const { id } = action.payload
      state.tilesets = state.tilesets.filter((tileset) => tileset.id !== id)

      state.files.forEach((file) => {
        file.layers.forEach((layer) => {
          if (layer.type === 'tile') {
            layer.data.forEach((row) => {
              row.forEach((tile) => {
                if (tile.tilesetId === id) {
                  tile.tilesetName = 'unknown'
                  tile.tilesetId = 'unknown'
                  tile.tilesetX = -1
                  tile.tilesetY = -1
                  tile.tileData = ''
                }
              })
            })
          }
        })
      })
    },
    setTilesets: (state, action: PayloadAction<TilesetType[]>) => {
      state.tilesets = action.payload
    },
    updateTilemap: (
      state,
      action: PayloadAction<{
        layerId: string
        tileX: number
        tileY: number
        tilesetX: number
        tilesetY: number
        tilesetName: string
        tilesetId: string
        tileData: string
      }>
    ) => {
      const {
        layerId,
        tileX,
        tileY,
        tilesetX,
        tilesetY,
        tilesetName,
        tileData,
        tilesetId,
      } = action.payload
      const selectedFile = state.files.find(
        (file) => file.id === state.selectedFileId
      )

      if (!selectedFile) return state

      const selectedLayer = selectedFile.layers.find(
        (layer) => layer.id === layerId
      )

      if (!selectedLayer) return state

      if (selectedLayer.type !== 'tile') return state

      selectedLayer.data[tileY][tileX] = {
        tilesetName,
        tilesetX,
        tilesetY,
        tileData,
        tilesetId,
      }
    },
    updateLayerSettings: (
      state,
      action: PayloadAction<{
        id: string
        layer: Partial<Omit<LayerType, 'data' | 'type'>>
      }>
    ) => {
      const selectedFile = state.files.find(
        (file) => file.id === state.selectedFileId
      )

      if (!selectedFile) return

      for (let i = 0; i < selectedFile.layers.length; i++) {
        if (selectedFile.layers[i].id === action.payload.id) {
          selectedFile.layers[i] = {
            ...selectedFile.layers[i],
            ...action.payload.layer,
          }
        }
      }
    },
    updateObjectSettings: (
      state,
      action: PayloadAction<{
        layerId: string
        objectId: string
        object: Partial<Omit<ObjectType, 'id'>>
      }>
    ) => {
      const { layerId, objectId, object: newObject } = action.payload
      const selectedFile = state.files.find(
        (file) => file.id === state.selectedFileId
      )

      if (!selectedFile) return state

      for (let i = 0; i < selectedFile.layers.length; i++) {
        const layer = selectedFile.layers[i]
        if (layer.id === layerId && layer.type === 'object') {
          for (let j = 0; j < layer.data.length; j++) {
            const object = layer.data[j]
            if (object.id === objectId) {
              selectedFile.layers[i].data[j] = {
                ...selectedFile.layers[i].data[j],
                ...newObject,
              }
            }
          }
        }
      }
    },
    zoomIn: (state) => {
      state.zoomLevel = state.zoomLevel + 0.1 * state.zoomLevel
    },
    zoomOut: (state) => {
      state.zoomLevel = state.zoomLevel - 0.1 * state.zoomLevel
    },
    setSelectedLayerId: (state, action: PayloadAction<{ id: string }>) => {
      state.selectedLayerId = action.payload.id
    },
    addLayer: (state, action: PayloadAction<{ type: Type }>) => {
      const { type } = action.payload
      const selectedFile = state.files.find(
        (file) => file.id === state.selectedFileId
      )

      if (!selectedFile) return state

      const sortOrder = selectedFile.layers.length + 1

      switch (type) {
        case 'tile': {
          const layer: TileLayerType = {
            id: generateId(),
            type: type,
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
        case 'object': {
          const layer: ObjectLayerType = {
            id: generateId(),
            type: type,
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
        case 'structure': {
          const layer: StructureLayerType = {
            id: generateId(),
            type: type,
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
    },
    addObject: (
      state,
      action: PayloadAction<{
        x: number
        y: number
        x2: number
        y2: number
        width: number
        height: number
      }>
    ) => {
      const { x, y, x2, y2, width, height } = action.payload
      const selectedFile = state.files.find(
        (file) => file.id === state.selectedFileId
      )

      if (!selectedFile) return state

      const selectedLayer = selectedFile.layers.find(
        (layer) => layer.id === state.selectedLayerId
      )

      if (!selectedLayer || selectedLayer.type !== 'object') return state

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
        return layer.id === selectedLayer.id && layer.type === 'object'
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
    },
    removeLayer: (state, action: PayloadAction<{ id: string }>) => {
      const { id } = action.payload
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
    },
    removeObject: (
      state,
      action: PayloadAction<{ objectId: string; layerId: string }>
    ) => {
      const { layerId, objectId } = action.payload
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
    },
    regenerateMap: (
      state,
      action: PayloadAction<{ layerId: string; width: number; height: number }>
    ) => {
      const { layerId, width, height } = action.payload
      const selectedFile = state.files.find(
        (file) => file.id === state.selectedFileId
      )

      if (!selectedFile) return state

      const selectedLayer = selectedFile.layers.find(
        (layer) => layer.id === layerId
      )

      if (!selectedLayer) return state

      if (selectedLayer.type === 'tile') {
        const newTilemap = generateMap(width, height)
        const newLayers: LayerType[] = selectedFile.layers.map((layer) => {
          return layer.id === selectedLayer.id && layer.type === 'tile'
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
    },
    addFile: (state) => {
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
    },
    deleteFile: (state, action: PayloadAction<{ id: string }>) => {
      const { id } = action.payload
      return {
        ...state,
        files: state.files.filter((file) => file.id !== id),
      }
    },
    selectFile: (state, action: PayloadAction<{ id: string }>) => {
      const { id } = action.payload
      return {
        ...state,
        selectedFileId: id,
      }
    },
    updateFileSettings: (
      state,
      action: PayloadAction<{
        name: string
        width: number
        height: number
        tileWidth: number
        tileHeight: number
        isStructure: boolean
      }>
    ) => {
      const { name, width, height, tileWidth, tileHeight, isStructure } =
        action.payload
      const currentFile = state.files.find(
        (file) => file.id === state.selectedFileId
      )

      if (!currentFile) return state

      currentFile.layers.forEach((layer) => {
        if (
          layer.type === 'tile' &&
          (currentFile.width !== width ||
            currentFile.height !== height ||
            currentFile.tileWidth !== tileWidth ||
            currentFile.tileHeight !== tileHeight)
        ) {
          layer.data = generateMap(width, height)
        }
      })

      currentFile.height = height
      currentFile.width = width
      currentFile.tileHeight = tileHeight
      currentFile.tileWidth = tileWidth
      currentFile.name = name
      currentFile.isStructure = isStructure
    },
    addStructure: (
      state,
      action: PayloadAction<{ fileId: string; x: number; y: number }>
    ) => {
      const { x, y, fileId } = action.payload

      const currentFile = state.files.find((f) => f.id === state.selectedFileId)
      if (!currentFile) return state

      const currentLayer = currentFile.layers.find(
        (l) => l.id === state.selectedLayerId
      )
      if (!currentLayer) return state

      if (currentLayer.type !== 'structure') return state

      const newStructure: StructureType = {
        id: generateId(),
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
    },
    removeStructure: (state, action: PayloadAction<{ id: string }>) => {
      const { id } = action.payload

      const currentFile = state.files.find((f) => f.id === state.selectedFileId)
      if (!currentFile) return state

      const currentLayer = currentFile.layers.find(
        (l) => l.id === state.selectedLayerId
      )
      if (!currentLayer || currentLayer.type !== 'structure') return state

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
                data: [...currentLayer.data.filter((s) => s.id !== id)],
              },
            ],
          },
        ],
      }
    },
  },
})

export const {
  addLayer,
  removeLayer,
  setSelectedLayerId,
  updateLayerSettings,
  regenerateMap,
  addFile,
  addObject,
  removeObject,
  updateObjectSettings,
  deleteFile,
  selectFile,
  updateFileSettings,
  addStructure,
  removeStructure,
  zoomIn,
  zoomOut,
  updateTilemap,
  setFiles,
  addTileset,
  renameTileset,
  deleteTileset,
  setTilesets,
} = editorSlice.actions

export default editorSlice.reducer
