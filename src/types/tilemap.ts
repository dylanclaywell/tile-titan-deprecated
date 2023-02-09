import z from 'zod'

export const Tilemap = z.object({
  name: z.string().min(1),
  tileWidth: z.number().positive(),
  tileHeight: z.number().positive(),
  width: z.number().positive(),
  height: z.number().positive(),
  data: z.array(z.array(z.number())),
})
export type TilemapType = z.infer<typeof Tilemap>
