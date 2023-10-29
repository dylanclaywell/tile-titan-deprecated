import React from 'react'
import { ObjectType } from '../../types/object'
import { LayerType } from '../../types/layer'
import clsx from 'clsx'
import { Reshapable } from '../Reshapable/Reshapable'

export type Props = {
  object: ObjectType
  layer: LayerType
}

export default function Object({ object, layer }: Props) {
  return (
    <Reshapable
      className={clsx('z-0 absolute border', {
        hidden: !layer.isVisible || !object.isVisible,
      })}
      style={{
        top: object.y2 > object.y ? object.y : object.y2,
        left: object.x2 > object.x ? object.x : object.x2,
        width: object.width,
        height: object.height,
        borderColor: object.color ?? 'black',
      }}
    ></Reshapable>
  )
}
