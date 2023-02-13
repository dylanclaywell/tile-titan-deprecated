import React, { useContext, useState } from 'react'
import { v4 as generateId } from 'uuid'

import { Layer } from '../components/Layer/Layer'
import { EditorContext } from '../contexts/EditorContext'
import { Tool } from '../components/Tool'
import { Tools } from '../components/Tools/Tools'
import { ToolSection } from '../components/Tools/ToolSection'

type Layer = {
  id: string
  name: string
}

export function LayerView() {
  const [{ layers, selectedLayerId }, { setSelectedLayerId }] =
    useContext(EditorContext)

  return (
    <div>
      <Tools>
        <ToolSection>
          <Tool onClick={() => undefined} icon="circle-plus" name="Add layer" />
        </ToolSection>
      </Tools>
      <div className="p-2 border-gray-300">
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
