import React, { createContext, useState } from 'react'

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
  cursorRef: HTMLDivElement | null
  zoomLevel: number
  showGrid: boolean
}

export type Actions = {
  updateCanvas: (args: {
    canvas: HTMLCanvasElement
    tilesetX: number
    tilesetY: number
    tilesetName: string
  }) => void
  handleToolClick: (type: ToolType) => void
  setCursorRef: (cursorRef: HTMLDivElement | null) => void
  setZoomLevel: (level: number) => void
}

const tileCanvas = document.createElement('canvas')
tileCanvas.width = 32
tileCanvas.height = 32

const initialState: State = {
  tool: {
    type: 'tile',
    canvas: tileCanvas,
  },
  zoomLevel: 1,
  cursorRef: null,
  showGrid: true,
}

export const EditorContext = createContext<[State, Actions]>([
  initialState,
  {
    updateCanvas: () => undefined,
    handleToolClick: () => undefined,
    setCursorRef: () => undefined,
    setZoomLevel: () => undefined,
  },
])

export function EditorProvider({ children }: { children: React.ReactNode }) {
  const [cursorRef, setCursorRef] = useState<HTMLDivElement | null>(null)
  const [state, setState] = useState<State>(initialState)

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
    if (state.tool.type !== 'tile') return

    setState({
      ...state,
      tool: {
        ...state.tool,
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

  const actions = {
    updateCanvas,
    handleToolClick,
    setCursorRef,
    setZoomLevel,
  }

  return (
    <EditorContext.Provider value={[{ ...state, cursorRef }, actions]}>
      {children}
    </EditorContext.Provider>
  )
}
