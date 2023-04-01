import { PayloadAction, createSlice } from '@reduxjs/toolkit'

type State = {
  image: string | null
  x: number
  y: number
}

const initialState: State = {
  image: null,
  x: 0,
  y: 0,
}

const cursorSlice = createSlice({
  name: 'cursor',
  initialState,
  reducers: {
    moveCursor: (state, action: PayloadAction<{ x: number; y: number }>) => {
      state.x = action.payload.x
      state.y = action.payload.y
    },
  },
})

export const { moveCursor } = cursorSlice.actions

export default cursorSlice.reducer
