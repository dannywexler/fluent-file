import type { AvifOptions, ResizeOptions } from "sharp"
import z from "zod"

import type { FluentFolder } from "$/folder/folder"
export const MAX_DIFFERENCES = 6

export const IMAGE_EXTENSIONS = [
    "avif",
    "gif",
    "jpeg",
    "jpg",
    "png",
    "svg",
    "tiff",
    "webp",
]

export type ImageOutputOptions = {
    newFolder?: FluentFolder
    newBaseName?: string
}

export type ImageResizeOptions = ImageOutputOptions & ResizeOptions

// const op: AvifOptions = {}
// const rs: ResizeOptions = {background}
//
export type ToAVIFOptions = ImageOutputOptions & ResizeOptions & AvifOptions

export type PhashSimilarity = "SAME" | "SIMILAR" | "DIFFERENT"

export type PhashSimilarityInfo = {
    readonly case: PhashSimilarity
    readonly diff: number
}

const PHASH_LENGTH = 64
const HEX_RADIX = 16

export const binaryStringRegex = /^[01]+$/

export const phashStringSchema = z.codec(
    z.string().regex(binaryStringRegex).length(PHASH_LENGTH),
    z.hex().brand("PhashString"),
    {
        decode: (binaryString) =>
            BigInt(`0b${binaryString}`).toString(HEX_RADIX),
        encode: (hexString) =>
            BigInt(`0x${hexString}`).toString(2).padStart(PHASH_LENGTH, "0"),
    },
)
export type PhashString = z.output<typeof phashStringSchema>

export const phashThresholdSchema = z
    .int()
    .nonnegative()
    .max(PHASH_LENGTH)
    .brand("PhashThreshold")
export type PhashThreshold = z.infer<typeof phashThresholdSchema>
const DEFAULT_THRESHOLD = 6
export const DEFAULT_PHASH_THRESHOLD =
    phashThresholdSchema.parse(DEFAULT_THRESHOLD)

/**
 * Compares two phashes, and returns information about how similar the two phashes are, based on the (optional) threshold.
 *
 * @param {PhashString} phashA
 * @param {PhashString} phashB
 * @param {PhashThreshold} [threshold] - Must be an integer 0-64 (inclusive). Defaults to 6.
 * If there are fewer than `threshold` differences, the images are similar
 *
 * @example Given a needle and a haystack:
    ```ts
    const phashNeedle = "1a...8f" // (hex-encoded string)
    const phashHaystack = ["2b..3c", "4d..5e"] // (Array of hex-encoded strings)
    ```
 *
 * Can be used for sorting by using the `diff` count of the return value
 * @example
    ```ts
    const sorted = phashHaystack.sort((phashA, phashB) => {
        const adiff = comparePhashes(phashNeedle, phashA).diff
        const bdiff = comparePhashes(phashNeedle, phashB).diff
        return adiff - bdiff
    })
    ```

 * Can be used for filtering by checking the `case` of the return value
 * @example
    ```ts
    // all items in haystack that are the same or similar to the needle
    const matches = phashHaystack.filter(hay => comparePhashes(phashNeedle, hay).case !== "DIFFERENT")
    ```
 *
 * @see `phashesMatch` For a simpler function that returns a boolean of whether the two phashes are similar
 */
export function comparePhashes(
    phashA: PhashString,
    phashB: PhashString,
    threshold: PhashThreshold = DEFAULT_PHASH_THRESHOLD,
): PhashSimilarityInfo {
    const phashAbin = phashStringSchema.encode(phashA)
    const phashBbin = phashStringSchema.encode(phashB)

    if (phashAbin === phashBbin) {
        return Object.freeze({
            case: "SAME",
            diff: 0,
        })
    }
    let diff = 0
    let i = PHASH_LENGTH
    while (i--) {
        if (phashAbin[i] !== phashBbin[i]) {
            diff++
        }
    }
    const casename = diff < threshold ? "SIMILAR" : "DIFFERENT"
    return Object.freeze({
        case: casename,
        diff,
    })
}

/**
 * Checks if two phashes `match` based on the (optional) threshold
 *
 * @param {PhashString} phashA
 * @param {PhashString} phashB
 * @param {PhashThreshold} [threshold] - Must be an integer 0-64 (inclusive). Defaults to 6.
 * If there are fewer than `threshold` differences, the images are similar
 *
 * @returns whether the two phashes are similar
 */
export function phashesMatch(
    phashA: PhashString,
    phashB: PhashString,
    threshold: PhashThreshold = DEFAULT_PHASH_THRESHOLD,
) {
    const phashAbin = phashStringSchema.encode(phashA)
    const phashBbin = phashStringSchema.encode(phashB)

    if (phashAbin === phashBbin) {
        return true
    }
    let diff = 0
    let i = PHASH_LENGTH
    while (i--) {
        if (phashAbin[i] !== phashBbin[i]) {
            diff++
        }
        if (diff >= threshold) {
            return false
        }
    }
    return true
}
