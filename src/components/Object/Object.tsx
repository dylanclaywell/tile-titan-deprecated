import React from 'react'
import { ObjectType } from '../../types/object'
import { LayerType } from '../../types/layer'
import clsx from 'clsx'

export type Props = {
  object: ObjectType
  layer: LayerType
}

export default function Object({ object, layer }: Props) {
  return (
    <div
      className={clsx('z-0 absolute border pointer-events-none', {
        hidden: !layer.isVisible || !object.isVisible,
      })}
      style={{
        top: object.y2 > object.y ? object.y : object.y2,
        left: object.x2 > object.x ? object.x : object.x2,
        width: object.width,
        height: object.height,
        borderColor: object.color ?? 'black',
      }}
    >
      <div className="opacity-0 hover:flex justify-center items-center pointer-events-auto hover:bg-blue-400 hover:opacity-75 absolute top-0 left-0 right-0 h-[0.5rem]">
        <i className="fa-solid fa-arrow-up text-[0.5rem]"></i>
      </div>
      <div className="opacity-0 hover:flex justify-center items-center pointer-events-auto w-[0.5rem] hover:bg-blue-400 hover:opacity-75 absolute top-0 left-0 bottom-0">
        <i className="fa-solid fa-arrow-left text-[0.5rem]"></i>
      </div>
      <div className="opacity-0 hover:flex justify-center items-center pointer-events-auto w-[0.5rem] hover:bg-blue-400 hover:opacity-75 absolute top-0 right-0 bottom-0">
        <i className="fa-solid fa-arrow-right text-[0.5rem]"></i>
      </div>
      <div className="opacity-0 hover:flex justify-center items-center pointer-events-auto hover:bg-blue-400 hover:opacity-75 absolute left-0 right-0 bottom-0 h-[0.5rem]">
        <i className="fa-solid fa-arrow-down text-[0.5rem]"></i>
      </div>
    </div>
  )
}
