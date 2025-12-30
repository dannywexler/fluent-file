import { fcmd } from "fluent-command"
import { zparse } from "zerde"

import type { FileOutputOptions } from "$/common/path"

import { videoMetaDataSchema } from "./video.schemas"

export const VIDEO_EXTENSIONS = [
    "avi",
    "flv",
    "mkv",
    "mov",
    "mp4",
    "mpeg",
    "mpg",
    "rm",
    "rmvb",
    "webm",
    "wmv",
]

export function getVideoMetaData(path: string) {
    return fcmd("ffprobe")
        .opt("hide_banner")
        .opt("show_format")
        .opt("show_streams")
        .opt({
            v: "error",
            // biome-ignore lint/style/useNamingConvention: option is snake case
            print_format: "json",
        })
        .args(path)
        .read()
        .andThen((commandSuccess) =>
            zparse(commandSuccess.stdout, videoMetaDataSchema, "json"),
        )
}

export type ExtractFrameOptions = FileOutputOptions & {
    time?: number
    unit?: "s" | "ms" | "us"
    ext?: "png" | "jpg"
}
