import { expect, test } from "vitest"
import { z } from "zod"

import { expectResult } from "$/common/testing"
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

    await expectResult(helloFile.write(initial))
    const readContents = await expectResult(helloFile.read())
    expect(readContents).toEqual(initial)

    await expectResult(helloFile.write(changed))
    const changedValue = await expectResult(helloFile.read())
    expect(changedValue).toEqual(changed)

    await helloFile.write(initial)
})
