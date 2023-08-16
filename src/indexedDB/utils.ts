import z from 'zod'

export const IDBEvent = z.object({
  result: z.instanceof(IDBDatabase),
})
