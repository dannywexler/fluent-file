import z from "zod"

import { posIntSchema, positiveFloatSchema } from "$/common/schema"

const commonInfoSchema = z.object({
    duration: positiveFloatSchema,
    // biome-ignore lint/style/useNamingConvention: is snake case in actual object
    bit_rate: posIntSchema,
})

const MS_IN_SEC = 1000

export function transformDuration(totalSeconds: number) {
    const millis = Math.round(totalSeconds * MS_IN_SEC)
    const seconds = Math.trunc(totalSeconds % 60)
    const minutes = Math.trunc((totalSeconds / 60) % 60)
    const hours = Math.trunc((totalSeconds / 60 / 60) % 60)
    // "1:23:45" or "12:34" if hours is 0
    // or "1:23" if minutes is 1 digit instead of 2
    const hms = [hours, minutes, seconds]
        // skip hours if hours is 0
        .filter((value, index) => index > 0 || value > 0)
        .map((value, index) => {
            let res = value.toString()
            // if index is 0, dont pad with 0s in front
            if (index > 0) {
                res = res.padStart(2, "0")
            }
            return res
        })
        .join(":")
    return {
        millis,
        seconds,
        minutes,
        hours,
        hms,
    }
}

const commonStreamSchema = z.object({
    ...commonInfoSchema.shape,
    // biome-ignore lint/style/useNamingConvention: is snake case in actual object
    codec_name: z.string(),
    // biome-ignore lint/style/useNamingConvention: is snake case in actual object
    codec_long_name: z.string(),
    // biome-ignore lint/style/useNamingConvention: is snake case in actual object
    codec_tag_string: z.string(),
    // biome-ignore lint/style/useNamingConvention: is snake case in actual object
    nb_frames: posIntSchema,
})

export const audioStreamSchema = z.object({
    ...commonStreamSchema.shape,
    // biome-ignore lint/style/useNamingConvention: is snake case in actual object
    codec_type: z.literal("audio"),
    channels: posIntSchema,
    // biome-ignore lint/style/useNamingConvention: is snake case in actual object
    channel_layout: z.string(),
})

export const videoStreamSchema = z.object({
    ...commonStreamSchema.shape,
    // biome-ignore lint/style/useNamingConvention: is snake case in actual object
    codec_type: z.literal("video"),
    height: posIntSchema,
    width: posIntSchema,
})

const formatSchema = z.object({
    ...commonInfoSchema.shape,
    // biome-ignore lint/style/useNamingConvention: is snake case in actual object
    nb_streams: posIntSchema,
    // biome-ignore lint/style/useNamingConvention: is snake case in actual object
    format_name: z.string(),
    // biome-ignore lint/style/useNamingConvention: is snake case in actual object
    format_long_name: z.string(),
    size: posIntSchema,
})

export const videoMetaDataSchema = z
    .object({
        format: formatSchema,
        streams: z
            .array(z.union([audioStreamSchema, videoStreamSchema]))
            .min(2),
    })
    .transform(
        ({ format: { duration, ...restOfFormat }, streams }, { addIssue }) => {
            const videoStream = streams
                .filter((stream) => stream.codec_type === "video")
                .map(({ duration, ...restOfStream }) => ({
                    ...restOfStream,
                    ...transformDuration(duration),
                }))
                .at(0)

            if (!videoStream) {
                addIssue({
                    code: "custom",
                    message: "Video was missing video stream",
                })
                return z.NEVER
            }

            const audioStreams = streams
                .filter((stream) => stream.codec_type === "audio")
                .map(({ duration, ...restOfStream }) => ({
                    ...restOfStream,
                    ...transformDuration(duration),
                }))

            if (audioStreams.length === 0) {
                addIssue({
                    code: "custom",
                    message: "Video was missing audio stream",
                })
                return z.NEVER
            }

            return {
                videoStream,
                audioStreams,
                ...restOfFormat,
                ...transformDuration(duration),
            }
        },
    )
export type VideoMetaData = z.infer<typeof videoMetaDataSchema>
