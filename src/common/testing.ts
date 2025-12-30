import type { Result, ResultAsync } from "neverthrow"
import { expect } from "vitest"

export async function expectResult<T, E = unknown>(
    asyncResult: ResultAsync<T, E> | Promise<Result<T, E>>,
    message = "Should not have an error",
) {
    const res = await asyncResult
    if (res.isOk()) {
        return res.value
    }
    expect(res.error).toBeUndefined()
    throw new Error(message)
}
