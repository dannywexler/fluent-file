import { imageFile, phashCheck, PhashSimilarity } from "$/file/image";
import { describe, expect, test } from "vitest";

describe("boat.jpg", () => {
    const boatJpg = imageFile("tests", "files", "boat.jpg");

    const phash = "2g6w5vsjt1j40";
    test(`phash equals ${phash}`, async () => {
        const gotPhash = await boatJpg.getPhash();
        expect(gotPhash).toEqual(phash);
    });

    const originalHeight = 720;
    const originalWidth = 1280;
    test(`metadata has height ${originalHeight} and width ${originalWidth}`, async () => {
        const { height, width } = await boatJpg.sharp.metadata();
        console.log({ height, width });
        expect(height).toBe(originalHeight);
        expect(width).toBe(originalWidth);
    });

    test("convert to avif", async () => {
        let avifImg = imageFile("tests", "files", "boat.avif");
        await avifImg.delete();
        avifImg = await boatJpg.convertToAvif();
        const { height, width } = await avifImg.sharp.metadata();
        expect(height).toBe(originalHeight);
        expect(width).toBe(originalWidth);
    });

    const newHeight = 360;
    const newWidth = 640;
    test("convert to avif and shrink", async () => {
        let smallImg = imageFile("tests", "files", "boat_small.avif");
        await smallImg.delete();
        smallImg = await boatJpg.convertToAvif({
            height: newHeight,
            width: newWidth,
            newName: "boat_small",
        });
        const { height, width } = await smallImg.sharp.metadata();
        expect(height).toBe(newHeight);
        expect(width).toBe(newWidth);
    });

    test(`phash check`, async () => {
        const exactHaystack = ["2g6w5vsjt1j40", "1fyflvk9hg7pc"]
        const res = phashCheck(phash, exactHaystack)
        expect(res.case).toEqual(PhashSimilarity.Exact)
        expect(res.phash).toEqual(phash)

        const similar = ["2r9zp5r7kcn40", "3f88o523c8nb4", "1fyflvk9hg7pc"]
        const res2 = phashCheck(phash, similar)
        expect(res2.case).toEqual(PhashSimilarity.Similar)
        expect(res2.phash).toEqual(similar.at(0))

        const unique = ["1fyflvk9hg7pc"]
        const res3 = phashCheck(phash, unique)
        expect(res3.case).toEqual(PhashSimilarity.Unique)
        expect(res3.phash).toEqual(phash)
    });
});
