import { inspect } from "node:util"

import { fromThrowable } from "neverthrow"
import type { ZodError, ZodTypeAny, z } from "zod"

import type { UnknownObject } from "$/common/types"

export class ZodParseError extends Error {
    nestedErrors: UnknownObject
    constructor({
        cause,
        nestedErrors,
    }: { cause: ZodError; nestedErrors: UnknownObject }) {
        super(`ZodParseError: ${inspect(nestedErrors)}`, { cause })
        this.nestedErrors = nestedErrors
    }
}

export function zodResult<Zschema extends ZodTypeAny>(
    zodSchema: Zschema,
    unknownContent: unknown,
) {
    return fromThrowable(
        () => zodSchema.parse(unknownContent) as z.infer<Zschema>,
        (error) => {
            const zodErr = error as ZodError
            return new ZodParseError({
                cause: zodErr,
                nestedErrors: zodErr.format((zodIssue) => ({
                    ...zodIssue,
                    actual: burrow(unknownContent, zodIssue.path),
                })),
            })
        },
    )()
}

function burrow(unknownContent: unknown, path: Array<string | number>) {
    // @ts-expect-error we are burrowing into uncharted territory
    let val = unknownContent[path[0]]
    for (const pathPiece of path) {
        val = val[pathPiece]
    }
    return val
}
