import z from 'zod'

export const TileData = z.object({
  tilesetName: z.string().min(1),
  tilesetX: z.number(),
  tilesetY: z.number(),
})
export type TileDataType = z.infer<typeof TileData>

export const Tilemap = z.object({
  name: z.string().min(1),
  tileWidth: z.number().positive(),
  tileHeight: z.number().positive(),
  width: z.number().positive(),
  height: z.number().positive(),
  data: z.array(z.array(TileData)),
})
export type TilemapType = z.infer<typeof Tilemap>
