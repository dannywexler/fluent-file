import { jsonFile } from "$/file/json";
import { assert, expect, test } from "vitest";
import { z } from "zod";

test("hello.json", async () => {
    const helloSchema = z.object({
        hello: z.string(),
    });
    type Hello = z.infer<typeof helloSchema>;
    const initial: Hello = {
        hello: "world",
    };

    const changed: Hello = {
        hello: "changed",
    };
    const helloFile = jsonFile(helloSchema, "tests", "json", "hello.json");
    // console.log({ helloFile: helloFile.info })
    console.log(helloFile.info);
    const writeResult = await helloFile.write(initial);
    assert(writeResult.isOk());
    const readResult = await helloFile.read();
    assert(readResult.isOk());
    expect(readResult.value).toEqual(initial);

    const changedWriteResult = await helloFile.write(changed);
    assert(changedWriteResult.isOk());
    const changedReadResult = await helloFile.read();
    assert(changedReadResult.isOk());

    await helloFile.write(initial);
});
