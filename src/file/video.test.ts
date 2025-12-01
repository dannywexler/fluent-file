import dl from "download"
import { beforeAll, describe, expect, test } from "vitest"

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

beforeAll(async () => {
    await bunnyFile.folder().ensureExists()
    if (await bunnyFile.exists()) {
        // console.log(filename, "already exists => skipping download")
    } else {
        // biome-ignore lint/suspicious/noConsole: want to know if downloaded successfully
        console.log(filename, "does not exist => downloading")
        await dl(bunnyUrl, videosFolder.path, { filename })
    }
})

describe("metadata", () => {
    test("Got valid metadata", async () => {
        const metadataResult = await bunnyFile.video().metadata()
        metadataResult.match(
            (validMetaData) => {
                // console.log(validMetaData)
                // expect(validMetaData).toEqual(expectedMetaData)
                expect(validMetaData).toMatchObject(bunnyMetaData)
            },
            (metaDataError) => {
                // console.log(metaDataError);
                expect(metaDataError).toBeNull()
            },
        )
    })
})

describe("thumbnail", async () => {
    const thumbnailFile = videosFolder.file("bunny.png")
    await thumbnailFile.remove()

    test("created thumbnail", async () => {
        const bunnyThumb = await bunnyFile.video().extractFrame({ time: 30 })
        bunnyThumb.match(
            async (destinationFile) => {
                const destinationFileExists = await destinationFile.exists()
                expect(destinationFileExists).toBe(true)
            },
            (thumbnailError) => {
                expect(thumbnailError).toBeNull()
            },
        )
    })
})
