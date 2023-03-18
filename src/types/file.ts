import z from 'zod'
import { Layer } from './layer'

export const File = z.object({
  id: z.string().min(1),
  width: z.number().min(1),
  height: z.number().min(1),
  tileWidth: z.number().min(1),
  tileHeight: z.number().min(1),
  name: z.string().min(1),
  layers: z.array(Layer),
  sortOrder: z.number().min(0),
})

export type FileType = z.infer<typeof File>
