import z from 'zod'

export function zodStringToNumber(value: string, context: z.RefinementCtx) {
  const parsedValue = Number(value)
  if (isNaN(parsedValue)) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Not a number',
    })
    return z.NEVER
  }
  if (parsedValue < 0) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Number must be positive',
    })
    return z.NEVER
  }
  return parsedValue
}
