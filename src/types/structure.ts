import z from 'zod'

export const Structure = z.object({
  fileId: z.string().min(1),
  x: z.number().min(0),
  y: z.number().min(0),
})

export type StructureType = z.infer<typeof Structure>
