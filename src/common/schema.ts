import z from "zod"

export const positiveFloatSchema = z.coerce.number().positive()
const intSchema = z.coerce.number().int()
export const uIntSchema = intSchema.nonnegative()
export const posIntSchema = intSchema.positive()
