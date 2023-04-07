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

type State = {
  files: FileType[]
  zoomLevel: number
  showGrid: boolean
  selectedLayerId: string | null
  selectedFileId: string | null
}

const initialState: State = {
  files: [],
  zoomLevel: 1,
  showGrid: true,
  selectedFileId: null,
  selectedLayerId: null,
}

export const editorSlice = createSlice({
  name: 'editor',
  initialState,
  reducers: {
    updateTilemap: (
      state,
      action: PayloadAction<{
        layerId: string
        tileX: number
        tileY: number
        tilesetX: number
        tilesetY: number
        tilesetName: string
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
      }
    },
    updateLayerSettings: (
      state,
      action: PayloadAction<{
        id: string
        layer: Partial<Omit<LayerType, 'data' | 'type'>>
      }>
    ) => {
      const { id, layer: layerType } = action.payload
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

      const layers = currentFile.layers.map((layer) => {
        if (
          layer.type === 'tile' &&
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
} = editorSlice.actions

// The function below is called a selector and allows us to select a value from
// the state. Selectors can also be defined inline where they're used instead of
// in the slice file. For example: `useSelector((state) => state.editor.value)`
// export const selectCount = (state) => state.editor.value

export default editorSlice.reducer
