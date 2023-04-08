import z from 'zod'

export const TileData = z.object({
  tilesetName: z.string().min(1),
  tilesetId: z.string(),
  tilesetX: z.number(),
  tilesetY: z.number(),
  tileData: z.string().optional(),
})
export type TileDataType = z.infer<typeof TileData>

export const Tilemap = z.array(z.array(TileData))
export type TilemapType = z.infer<typeof Tilemap>
