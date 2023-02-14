import z from 'zod'
import { Tilemap } from './tilemap'

export const Layer = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  tilemap: Tilemap,
  isVisible: z.boolean(),
  sortOrder: z.number().int().min(0),
})
export type LayerType = z.infer<typeof Layer>
