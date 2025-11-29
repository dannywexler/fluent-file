import z from "zod"

export const DataStreamSchema = z.object({
    // biome-ignore lint/style/useNamingConvention: is snake case in actual object
    codec_type: z.literal("data"),
})

export const AudioStreamSchema = z.object({
    // biome-ignore lint/style/useNamingConvention: is snake case in actual object
    codec_type: z.literal("audio"),
})

export const VideoStreamSchema = z.object({
    // biome-ignore lint/style/useNamingConvention: is snake case in actual object
    codec_type: z.literal("video"),
    height: z.number().int().positive(),
    width: z.number().int().positive(),
})

export const VideoMetaDataSchema = z
    .object({
        format: z.object({
            // biome-ignore lint/style/useNamingConvention: is snake case in actual object
            bit_rate: z.coerce.number(),
            duration: z.coerce.number(),
            size: z.coerce.number(),
        }),
        streams: z.array(z.union([AudioStreamSchema, VideoStreamSchema])),
    })
    .transform(
        (
            {
                format: { bit_rate, duration: totalSeconds, size: bytes },
                streams,
            },
            { addIssue },
        ) => {
            for (const stream of streams) {
                if (stream.codec_type === "video") {
                    const { height, width } = stream
                    const millis = Math.round(totalSeconds * 1000)
                    const seconds = Math.trunc(totalSeconds % 60)
                    const minutes = Math.trunc((totalSeconds / 60) % 60)
                    const hours = Math.trunc((totalSeconds / 60 / 60) % 60)
                    return {
                        bitRate: bit_rate,
                        bytes,
                        height,
                        hours,
                        millis,
                        minutes,
                        seconds,
                        width,
                    }
                }
            }
            addIssue({
                code: z.ZodIssueCode.custom,
                message: "Video was missing video stream",
            })
            return z.NEVER
        },
    )
export type VideoMetaData = z.infer<typeof VideoMetaDataSchema>
