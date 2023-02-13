import React, { useContext, useState } from 'react'
import { v4 as generateId } from 'uuid'

import { Layer } from '../components/Layer/Layer'
import { EditorContext } from '../contexts/EditorContext'
import { Tool } from '../components/Tool'
import { Tools } from '../components/Tools/Tools'
import { ToolSection } from '../components/Tools/ToolSection'

export function LayerView() {
  const [{ layers, selectedLayerId }, { setSelectedLayerId, addLayer }] =
    useContext(EditorContext)

  const currentLayer = layers.find((layer) => layer.id === selectedLayerId)

  return (
    <div>
      <Tools>
        <ToolSection>
          <Tool
            onClick={() => addLayer()}
            icon="circle-plus"
            name="Add layer"
          />
        </ToolSection>
      </Tools>
      <div className="p-2 border-gray-300">
        {layers.map((layer) => (
          <Layer
            key={`layer-${layer.name}`}
            id={layer.id}
            isSelected={layer.id === selectedLayerId}
            isVisible={layer.isVisible}
            name={layer.name}
            onClick={() => setSelectedLayerId(layer.id)}
          />
        ))}
      </div>
    </div>
  )
}
