import { videoFile } from "$/file/video";
import { describe, expect, test } from "vitest";
describe("metadata", () => {
    const bunnyFile = videoFile("tests", "video", "bunny.mp4");
    const expectedMetaData = {
        bitRate: 2119231,
        bytes: 158008374,
        height: 720,
        hours: 0,
        millis: 596474,
        minutes: 9,
        seconds: 56,
        width: 1280,
    };

    test("Got valid metadata", () => {
        const metadataResult = bunnyFile.getMetaData();
        metadataResult
            .map((validMetaData) => {
                console.log(validMetaData);
                // expect(validMetaData).toEqual(expectedMetaData)
                expect(validMetaData).toEqual(expectedMetaData);
            })
            .mapErr((metaDataError) => {
                console.log(metaDataError);
                throw new Error("ffprobe error");
            });
    });
});
