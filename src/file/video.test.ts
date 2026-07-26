import { describe, expect, test } from "vitest"

import { expectResult } from "$/common/testing"
import { folder } from "$/folder/folder"

const corgiUrl = "https://lorem.video/corgi_1080p"
const videosFolder = folder("tests", "video")
const filename = "corgi.mp4"
const corgiFile = videosFolder.file(filename)
const corgiMetaData = {
    // biome-ignore lint/style/useNamingConvention: is snake case in actual object
    bit_rate: 3_763_022,
    hours: 0,
    millis: 20_067,
    minutes: 0,
    seconds: 20,
    size: 9_438_915,
    videoStream: { height: 1080, width: 1920 },
}

test("exists", async () => {
    await corgiFile.folder().ensureExists()
    if (await corgiFile.exists()) {
        expect(true).toEqual(true)
        // console.log(filename, "already exists => skipping download")
    } else {
        // biome-ignore lint/suspicious/noConsole: want to know if downloaded successfully
        console.log(filename, "does not exist => downloading")
        const dlResult = await expectResult(corgiFile.download(corgiUrl))
        expect(dlResult).toEqual("SUCCESS")
        // biome-ignore lint/suspicious/noConsole: want to know if downloaded successfully
        console.log(filename, "downloaded")
    }
})

describe("metadata", () => {
    test("Got valid metadata", async () => {
        const foundMetadata = await expectResult(corgiFile.video().metadata())
        expect(foundMetadata).toMatchObject(corgiMetaData)
    })
})

describe("thumbnail", async () => {
    await videosFolder.file("corgi.jpg").remove()

    test("created thumbnail", async () => {
        const corgiThumb = await expectResult(
            corgiFile.video().extractFrame({
                time: Math.round(corgiMetaData.seconds / 2),
                ext: "jpg",
            }),
        )
        const destinationFileExists = await corgiThumb.exists()
        expect(destinationFileExists).toBe(true)
    })
})
