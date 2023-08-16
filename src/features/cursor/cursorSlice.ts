import { PayloadAction, createSlice } from '@reduxjs/toolkit'

export type ToolType = 'select' | 'add' | 'remove'

export type TileCursorMetadata = {
  tilesetX: number
  tilesetY: number
  tilesetName: string
  tilesetId: string
  /** offsetX is just for mapping the tile metadata to the tilemap space if there is more than one tile selected */
  offsetX: number
  /** offsetY is just for mapping the tile metadata to the tilemap space if there is more than one tile selected */
  offsetY: number
  tileImageData: string
}

export type StructureCursorMetadata = {
  fileId: string
}

export type Metadata = TileCursorMetadata[] | StructureCursorMetadata | null

type State = {
  image: string | null
  toolType: ToolType
  x: number
  y: number
  metadata: Metadata
  width: number
  height: number
}

const initialState: State = {
  toolType: 'select',
  image: null,
  x: 0,
  y: 0,
  metadata: null,
  width: 0,
  height: 0,
}

const cursorSlice = createSlice({
  name: 'cursor',
  initialState,
  reducers: {
    moveCursor: (state, action: PayloadAction<{ x: number; y: number }>) => {
      state.x = action.payload.x
      state.y = action.payload.y
    },
    setCursorSrc: (state, action: PayloadAction<string>) => {
      state.image = action.payload
    },
    changeToolType: (
      state,
      action: PayloadAction<
        | {
            toolType: ToolType
          }
        | {
            toolType: 'remove'
            layerType: 'tile'
            tileWidth: number
            tileHeight: number
          }
      >
    ) => {
      state.toolType = action.payload.toolType

      if (
        action.payload.toolType === 'remove' &&
        'layerType' in action.payload
      ) {
        state.width = action.payload.tileWidth
        state.height = action.payload.tileHeight
      }
    },
    setCursorMetadata: (state, action: PayloadAction<Metadata>) => {
      state.metadata = action.payload
    },
    addTileCursorMetadata: (
      state,
      action: PayloadAction<TileCursorMetadata>
    ) => {
      if (state.metadata && Array.isArray(state.metadata)) {
        state.metadata = [...state.metadata, action.payload]
      }
    },
    setCursorSize: (
      state,
      action: PayloadAction<{ width: number; height: number }>
    ) => {
      state.width = action.payload.width
      state.height = action.payload.height
    },
  },
})

export const {
  moveCursor,
  setCursorSrc,
  changeToolType,
  setCursorMetadata,
  setCursorSize,
  addTileCursorMetadata,
} = cursorSlice.actions

export default cursorSlice.reducer
