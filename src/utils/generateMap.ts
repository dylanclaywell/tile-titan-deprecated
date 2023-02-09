export function generateMap(width: number, height: number) {
  const rows = new Array(height).fill(0)
  const columns = new Array(width).fill(0)

  return rows.map(() => columns.map(() => 0))
}
