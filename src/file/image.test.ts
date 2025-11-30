// import dl from "download"
// import { beforeAll, describe, expect, test } from "vitest"
//
// import { imageFile, PhashSimilarity, phashCheck } from "$/file/image"
// import { folder } from "$/folder/folder"
//
// const boatUrl = "https://images.unsplash.com/photo-1464069668014-99e9cd4abf16"
// const imagesFolder = folder("tests", "image")
// const boatJpg = imageFile(imagesFolder, "boat.jpg")
//
// beforeAll(async () => {
//     await imagesFolder.ensureExists()
//     if (await boatJpg.exists()) {
//         console.log(boatJpg.fullName, "already exists => skipping download")
//     } else {
//         console.log(boatJpg.fullName, "does not exist => downloading")
//         await dl(boatUrl, boatJpg.parentPath, {
//             filename: boatJpg.fullName,
//         })
//     }
// })
//
// const ogphash = "2vgns49n0x200"
// const similarPhash = "2ve73a8ac17gg"
// const diffPhash = "2npnqsy9m5s74"
//
// describe(boatJpg.fullName, () => {
//     test(`phash equals ${ogphash}`, async () => {
//         const gotPhash = await boatJpg.getPhash()
//         expect(gotPhash).toEqual(ogphash)
//     })
//
//     const originalHeight = 3066
//     const originalWidth = 5451
//     test(`metadata has height ${originalHeight} and width ${originalWidth}`, async () => {
//         const { height, width } = await boatJpg.sharp.metadata()
//         console.log({ height, width })
//         expect(height).toBe(originalHeight)
//         expect(width).toBe(originalWidth)
//     })
//
//     test("convert to avif", async () => {
//         let avifImg = imageFile(imagesFolder, "boat.avif")
//         await avifImg.delete()
//         avifImg = await boatJpg.convertToAvif()
//         const { height, width } = await avifImg.sharp.metadata()
//         expect(height).toBe(originalHeight)
//         expect(width).toBe(originalWidth)
//     })
//
//     const newHeight = 360
//     const newWidth = 640
//     test("convert to avif and shrink", async () => {
//         let smallImg = imageFile(imagesFolder, "boat_small.avif")
//         await smallImg.delete()
//         smallImg = await boatJpg.convertToAvif({
//             height: newHeight,
//             width: newWidth,
//             newName: "boat_small",
//         })
//         const { height, width } = await smallImg.sharp.metadata()
//         expect(height).toBe(newHeight)
//         expect(width).toBe(newWidth)
//     })
//
//     test("phash similarity check", () => {
//         const exactHaystack = [similarPhash, ogphash, diffPhash]
//         const res = phashCheck(ogphash, exactHaystack)
//         expect(res.case).toEqual(PhashSimilarity.Exact)
//         expect(res.phash).toEqual(ogphash)
//
//         const similar = [similarPhash, diffPhash]
//         const res2 = phashCheck(ogphash, similar)
//         expect(res2.case).toEqual(PhashSimilarity.Similar)
//         expect(res2.phash).toEqual(similar.at(0))
//
//         const unique = [diffPhash]
//         const res3 = phashCheck(ogphash, unique)
//         expect(res3.case).toEqual(PhashSimilarity.Unique)
//         expect(res3.phash).toEqual(ogphash)
//     })
// })
