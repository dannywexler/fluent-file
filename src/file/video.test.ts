import { describe, expect, test } from "vitest"

import { expectResult } from "$/common/testing"
import { folder } from "$/folder/folder"

const bunnyUrl =
    "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
const videosFolder = folder("tests", "video")
const filename = "bunny.mp4"
const bunnyFile = videosFolder.file(filename)
const bunnyMetaData = {
    // biome-ignore lint/style/useNamingConvention: is snake case in actual object
    bit_rate: 2_119_231,
    hours: 0,
    millis: 596_474,
    minutes: 9,
    seconds: 56,
    size: 158_008_374,
    videoStream: { height: 720, width: 1280 },
}

test("exists", async () => {
    await bunnyFile.folder().ensureExists()
    if (await bunnyFile.exists()) {
        expect(true).toEqual(true)
        // console.log(filename, "already exists => skipping download")
    } else {
        // biome-ignore lint/suspicious/noConsole: want to know if downloaded successfully
        console.log(filename, "does not exist => downloading")
        const dlResult = await expectResult(bunnyFile.download(bunnyUrl))
        expect(dlResult).toEqual("SUCCESS")
        // biome-ignore lint/suspicious/noConsole: want to know if downloaded successfully
        console.log(filename, "downloaded")
    }
})

describe("metadata", () => {
    test("Got valid metadata", async () => {
        const foundMetadata = await expectResult(bunnyFile.video().metadata())
        expect(foundMetadata).toMatchObject(bunnyMetaData)
    })
})

describe("thumbnail", async () => {
    const thumbnailFile = videosFolder.file("bunny.png")
    await thumbnailFile.remove()

    test("created thumbnail", async () => {
        const bunnyThumb = await expectResult(
            bunnyFile.video().extractFrame({ time: 30 }),
        )
        const destinationFileExists = await bunnyThumb.exists()
        expect(destinationFileExists).toBe(true)
    })
})
