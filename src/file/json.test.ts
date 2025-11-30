import { assert, expect, test } from "vitest"
import { z } from "zod"

import { ffile } from "$/file/file"

test("hello.json", async () => {
    const helloSchema = z.object({
        hello: z.string(),
    })
    type Hello = z.infer<typeof helloSchema>
    const initial: Hello = {
        hello: "world",
    }

    const changed: Hello = {
        hello: "changed",
    }
    const helloFile = ffile("tests", "json", "hello.json").schema(helloSchema)

    const writeResult = await helloFile.write(initial)
    assert(writeResult.isOk())
    const readResult = await helloFile.read()
    assert(readResult.isOk())
    expect(readResult.value).toEqual(initial)

    const changedWriteResult = await helloFile.write(changed)
    assert(changedWriteResult.isOk())
    const changedReadResult = await helloFile.read()
    assert(changedReadResult.isOk())
    expect(changedReadResult.value).toEqual(changed)

    await helloFile.write(initial)
})
