import z from 'zod'
import { Tilemap } from './tilemap'
import { Object } from './object'

export const TileLayer = z.object({
  id: z.string().min(1),
  type: z.literal('tilelayer'),
  name: z.string().min(1),
  data: Tilemap,
  isVisible: z.boolean(),
  sortOrder: z.number().int().min(0),
})

export const ObjectLayer = z.object({
  id: z.string().min(1),
  type: z.literal('objectlayer'),
  name: z.string().min(1),
  data: z.array(Object),
  isVisible: z.boolean(),
  sortOrder: z.number().int().min(0),
})

export const Layer = z.union([TileLayer, ObjectLayer])

export type Type = 'tilelayer' | 'objectlayer' | 'structurelayer'

export type TileLayerType = z.infer<typeof TileLayer>
export type ObjectLayerType = z.infer<typeof ObjectLayer>
export type LayerType = z.infer<typeof Layer>
