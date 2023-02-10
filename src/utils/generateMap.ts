import { TileDataType } from '../types/tilemap'

export function generateMap(width: number, height: number): TileDataType[][] {
  const rows = new Array(height).fill(0)
  const columns = new Array(width).fill(0)

  return rows.map(() =>
    columns.map(() => {
      return {
        tilesetName: '',
        tilesetX: -1,
        tilesetY: -1,
      }
    })
  )
}
