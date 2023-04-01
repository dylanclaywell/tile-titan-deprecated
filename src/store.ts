import { configureStore } from '@reduxjs/toolkit'

import editorReducer from './features/editor/editorSlice'
import cursorReducer from './features/cursor/cursorSlice'

export const store = configureStore({
  reducer: {
    editor: editorReducer,
    cursor: cursorReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
