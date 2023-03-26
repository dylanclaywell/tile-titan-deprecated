import z from 'zod'

import { Tilemap } from './tilemap'
import { Object } from './object'
import { Structure } from './structure'

export const TileLayer = z.object({
  id: z.string().min(1),
  type: z.literal('tile'),
  name: z.string().min(1),
  data: Tilemap,
  isVisible: z.boolean(),
  sortOrder: z.number().int().min(0),
})

export const ObjectLayer = z.object({
  id: z.string().min(1),
  type: z.literal('object'),
  name: z.string().min(1),
  data: z.array(Object),
  isVisible: z.boolean(),
  sortOrder: z.number().int().min(0),
})

export const StructureLayer = z.object({
  id: z.string().min(1),
  type: z.literal('structure'),
  name: z.string().min(1),
  data: z.array(Structure),
  isVisible: z.boolean(),
  sortOrder: z.number().int().min(0),
})

export const Layer = z.union([TileLayer, ObjectLayer, StructureLayer])

export type Type = 'tile' | 'object' | 'structure'

export type TileLayerType = z.infer<typeof TileLayer>
export type ObjectLayerType = z.infer<typeof ObjectLayer>
export type StructureLayerType = z.infer<typeof StructureLayer>
export type LayerType = z.infer<typeof Layer>
