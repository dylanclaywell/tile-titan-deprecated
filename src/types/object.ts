import z from 'zod'

export const Object = z.object({
  name: z.string().min(1),
  x: z.number(),
  y: z.number(),
  x2: z.number(),
  y2: z.number(),
  width: z.number(),
  height: z.number(),
})
export type ObjectType = z.infer<typeof Object>
