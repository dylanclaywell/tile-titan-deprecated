import React, { useContext, useState } from 'react'
import { v4 as generateId } from 'uuid'

import { Layer } from '../components/Layer/Layer'
import { EditorContext } from '../contexts/EditorContext'

type Layer = {
  id: string
  name: string
}

export function LayerView() {
  const [{ layers, selectedLayerId }, { setSelectedLayerId }] =
    useContext(EditorContext)

  return (
    <div>
      <span className="pl-2">Layers</span>
      <div className="p-2">
        {layers.map((layer) => (
          <Layer
            key={`layer-${layer.name}`}
            isSelected={layer.id === selectedLayerId}
            name={layer.name}
            onClick={() => setSelectedLayerId(layer.id)}
          />
        ))}
      </div>
    </div>
  )
}
