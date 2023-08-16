import z from 'zod'

export const Object = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  sortOrder: z.number().int().min(0),
  isVisible: z.boolean(),
  x: z.number(),
  y: z.number(),
  x2: z.number(),
  y2: z.number(),
  width: z.number(),
  height: z.number(),
  color: z
    .string()
    .regex(/^#[0-9a-f]{6}$/i)
    .optional(),
})
export type ObjectType = z.infer<typeof Object>
