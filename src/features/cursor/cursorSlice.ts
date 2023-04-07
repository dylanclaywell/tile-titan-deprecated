import { PayloadAction, createSlice } from '@reduxjs/toolkit'

export type ToolType = 'select' | 'add' | 'remove'

export type TileCursorMetadata = {
  tilesetX: number
  tilesetY: number
  tilesetName: string
}

export type Metadata = TileCursorMetadata | null

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
    changeToolType: (state, action: PayloadAction<ToolType>) => {
      state.toolType = action.payload
    },
    setCursorMetadata: (state, action: PayloadAction<Metadata>) => {
      state.metadata = action.payload
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
} = cursorSlice.actions

export default cursorSlice.reducer
