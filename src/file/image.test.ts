import dl from "download"
import { assert, beforeAll, describe, expect, test } from "vitest"

import { expectResult } from "$/common/testing"
import { folder } from "$/folder/folder"

import type { PhashString } from "./image"
import { comparePhashes, phashesMatch } from "./image"

const timeout = 240_000
const effort = 0

const boatUrl = "https://images.unsplash.com/photo-1464069668014-99e9cd4abf16"
const imagesFolder = folder("tests", "image")
const boatJPG = imagesFolder.file("boat.jpg")
const boatAVIF = imagesFolder.file("boat.avif")
const boatSmallAVIF = imagesFolder.file("boat_small.avif")

beforeAll(async () => {
    await imagesFolder.ensureExists()
    if (await boatJPG.exists()) {
        // console.log(boatJPG.name(), "already exists => skipping download")
    } else {
        // biome-ignore lint/suspicious/noConsole: want to know if downloading
        console.log(boatJPG.name(), "does not exist => downloading")
        await dl(boatUrl, imagesFolder.path, {
            filename: boatJPG.name(),
        })
        assert(await boatJPG.exists())
        // biome-ignore lint/suspicious/noConsole: want to know if downloaded successfully
        console.log(boatJPG.name(), "downloaded successfully")
    }
})

const ogphash = "bcfcacadb444d212" as PhashString
const similarPhash = "bcfcacadb444d214" as PhashString
const diffPhash = "1bf2a5a7b94012d4" as PhashString
const diffPhashDifference = 22

describe(boatJPG.name(), () => {
    test("similar phashes", () => {
        const { level, diff } = comparePhashes(ogphash, similarPhash)
        expect(diff).toEqual(2)
        expect(level).toEqual("SIMILAR")
        expect(phashesMatch(ogphash, similarPhash)).toEqual(true)
    })

    test("different phashes", () => {
        const { level, diff } = comparePhashes(ogphash, diffPhash)
        expect(diff).toEqual(diffPhashDifference)
        expect(level).toEqual("DIFFERENT")
        expect(phashesMatch(ogphash, diffPhash)).toEqual(false)
    })

    const originalHeight = 3066
    const originalWidth = 5451
    test("metadata has expected height and width", async () => {
        const meta = await expectResult(boatJPG.image().metadata())
        expect(meta.height).toBe(originalHeight)
        expect(meta.width).toBe(originalWidth)
    })

    test(
        "convert to avif",
        async () => {
            await expectResult(boatAVIF.remove())
            const returnedavifImg = await expectResult(
                boatJPG.image().toAVIF({ effort }),
            )
            const returnedavifImgMetadata = await expectResult(
                returnedavifImg.image().metadata(),
            )
            expect(returnedavifImgMetadata.height).toEqual(originalHeight)
            expect(returnedavifImgMetadata.width).toEqual(originalWidth)
            expect(returnedavifImg.ext()).toEqual("avif")
        },
        timeout,
    )

    const newHeight = 360
    const newWidth = 640
    test(
        "convert to avif and shrink",
        async () => {
            await expectResult(boatSmallAVIF.remove())
            const smallerImg = await expectResult(
                boatJPG.image().toAVIF({
                    // height: newHeight,
                    width: newWidth,
                    newBaseName: "boat_small",
                    effort,
                }),
            )
            const smallerImgMeta = await expectResult(
                smallerImg.image().metadata(),
            )
            expect(smallerImgMeta.height).toEqual(newHeight)
            expect(smallerImgMeta.width).toEqual(newWidth)
        },
        timeout,
    )

    test("phash of jpg equals original", async () => {
        const jpgPhash = await expectResult(boatJPG.image().phash())
        expect(jpgPhash).toEqual(ogphash)
    })

    test("phash of avif equals jpg", async () => {
        const avifphash = await expectResult(boatAVIF.image().phash())
        expect(ogphash).toEqual(avifphash)
        const { level, diff } = comparePhashes(ogphash, avifphash)
        expect(level).toEqual("SAME")
        expect(diff).toEqual(0)
        expect(phashesMatch(ogphash, avifphash)).toEqual(true)
    })

    test("phash of avif_small equals jpg", async () => {
        const avifsmallphash = await expectResult(boatSmallAVIF.image().phash())
        expect(ogphash).toEqual(avifsmallphash)
        const { level, diff } = comparePhashes(ogphash, avifsmallphash)
        expect(level).toEqual("SAME")
        expect(diff).toEqual(0)
        expect(phashesMatch(ogphash, avifsmallphash)).toEqual(true)
    })
})
