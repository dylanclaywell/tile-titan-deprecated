import React, { createContext, useState } from 'react'

export type ToolType = 'tile' | 'eraser' | 'grid'

export type Tool = {
  type: ToolType
  canvas: HTMLCanvasElement
}

export type State = {
  tool: Tool
  showGrid: boolean
}

export type Actions = {
  updateCanvas: (tileCanvas: HTMLCanvasElement) => void
  handleToolClick: (type: ToolType) => void
}

const tileCanvas = document.createElement('canvas')
tileCanvas.width = 32
tileCanvas.height = 32

const initialState: State = {
  tool: {
    type: 'tile',
    canvas: tileCanvas,
  },
  showGrid: true,
}

export const ToolContext = createContext<[State, Actions]>([
  initialState,
  {
    updateCanvas: () => undefined,
    handleToolClick: () => undefined,
  },
])

export function ToolProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<State>(initialState)

  function updateCanvas(canvas: HTMLCanvasElement) {
    if (state.tool.type !== 'tile') return

    setState({
      ...state,
      tool: {
        ...state.tool,
        canvas,
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

  const actions = {
    updateCanvas,
    handleToolClick,
  }

  return (
    <ToolContext.Provider value={[state, actions]}>
      {children}
    </ToolContext.Provider>
  )
}
