import z from 'zod'
import { Tilemap } from './tilemap'

export const Layer = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  tilemap: Tilemap,
  isVisible: z.boolean(),
})
export type LayerType = z.infer<typeof Layer>
