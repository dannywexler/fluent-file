import dl from "download"
import { beforeAll, describe, expect, test } from "vitest"

import { imageFile } from "$/file/image"
import { videoFile } from "$/file/video"

const bunnyUrl =
    "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
const bunnyFile = videoFile("tests", "video", "bunny.mp4")
const bunnyMetaData = {
    bitRate: 2_119_231,
    bytes: 158_008_374,
    height: 720,
    hours: 0,
    millis: 596_474,
    minutes: 9,
    seconds: 56,
    width: 1280,
}

beforeAll(async () => {
    await bunnyFile.getParentFolder().ensureExists()
    if (await bunnyFile.exists()) {
        console.log(bunnyFile.fullName, "already exists => skipping download")
    } else {
        console.log(bunnyFile.fullName, "does not exist => downloading")
        await dl(bunnyUrl, bunnyFile.parentPath, {
            filename: bunnyFile.fullName,
        })
    }
})

describe("metadata", () => {
    test("Got valid metadata", async () => {
        console.time("metadata")
        const metadataResult = await bunnyFile.getMetaData()
        console.timeEnd("metadata")
        metadataResult
            .map((validMetaData) => {
                console.log(validMetaData)
                // expect(validMetaData).toEqual(expectedMetaData)
                expect(validMetaData).toEqual(bunnyMetaData)
            })
            .mapErr((metaDataError) => {
                // console.log(metaDataError);
                expect(metaDataError).toBeNull()
            })
    })
})

describe("thumbnail", async () => {
    const thumbnailFile = imageFile("tests", "video", "bunny.png")
    await thumbnailFile.delete()

    const label = "created thumbnail"
    test(label, async () => {
        console.time(label)
        const bunnyThumb = await bunnyFile.getThumbnail("50%", thumbnailFile)
        console.timeEnd(label)
        bunnyThumb.match(
            async (destinationFile) => {
                const destinationFileExists = await destinationFile.exists()
                expect(destinationFileExists).toBe(true)
            },
            (thumbnailError) => {
                console.log(thumbnailError)
                expect(thumbnailError).toBeNull()
            },
        )
    })
})
