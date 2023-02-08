import React, { createContext, useState } from 'react'

export type Tool = {
  type: 'tile'
  tileCanvas: HTMLCanvasElement
}

export type State = {
  tool: Tool
}

export type Actions = {
  updateTileCanvas: (tileCanvas: HTMLCanvasElement) => void
}

const tileCanvas = document.createElement('canvas')
tileCanvas.width = 32
tileCanvas.height = 32

export const ToolContext = createContext<[State, Actions]>([
  {
    tool: {
      type: 'tile',
      tileCanvas,
    },
  },
  {
    updateTileCanvas: () => undefined,
  },
])

export function ToolProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<State>({
    tool: {
      type: 'tile',
      tileCanvas,
    },
  })

  function updateTileCanvas(tileCanvas: HTMLCanvasElement) {
    if (state.tool.type !== 'tile') return

    setState({
      ...state,
      tool: {
        ...state.tool,
        tileCanvas,
      },
    })
  }

  const actions = {
    updateTileCanvas,
  }

  return (
    <ToolContext.Provider value={[state, actions]}>
      {children}
    </ToolContext.Provider>
  )
}
