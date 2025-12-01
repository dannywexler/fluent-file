import { fcmd } from "fluent-command"
import { zparse } from "zerde"

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
        .opt({
            v: "error",
            // biome-ignore lint/style/useNamingConvention: option is snake case
            hide_banner: "",
            // biome-ignore lint/style/useNamingConvention: option is snake case
            print_format: "json",
            // biome-ignore lint/style/useNamingConvention: option is snake case
            show_format: "",
            // biome-ignore lint/style/useNamingConvention: option is snake case
            show_streams: "",
        })
        .args(path)
        .read()
        .andThen((commandSuccess) =>
            zparse(commandSuccess.stdout, videoMetaDataSchema, "json"),
        )
}

//
// const ffProbePromise = (filePath: string) =>
//     new Promise<FfprobeData>((resolve, reject) =>
//         ffmpeg.ffprobe(filePath, (ffprobeError, data) => {
//             if (ffprobeError) {
//                 reject(ffprobeError)
//             }
//             resolve(data)
//         }),
//     )
//
// const thumbnailHelper = (
//     videoPath: string,
//     folder: string,
//     filename: string,
//     timestamp: string | number,
// ) =>
//     new Promise<void>((resolve, reject) =>
//         ffmpeg(videoPath)
//             .on("error", (err) => reject(err))
//             .on("end", () => resolve())
//             .screenshot({
//                 filename,
//                 folder,
//                 // types are confused about number[] vs. string[] vs. Array<string | number>
//                 timestamps:
//                     typeof timestamp === "string" ? [timestamp] : [timestamp],
//             }),
//     )
//
// export class VideoFile extends AFile {
//     getMetaData = () =>
//         this.getStats().andThen(() =>
//             ResultAsync.fromThrowable(
//                 () => ffProbePromise(this.path),
//                 (ffprobeError) =>
//                     new VideoMetaDataError(this.path, ffprobeError as Error),
//             )().andThen((ffprobeData) =>
//                 zodResult(VideoMetaDataSchema, ffprobeData),
//             ),
//         )
//
//     getThumbnail = (timestamp: string | number, destination: ImageFile) =>
//         ResultAsync.fromThrowable(
//             async () => {
//                 const alreadyExists = await destination.exists()
//                 if (alreadyExists) {
//                     return destination
//                 }
//                 const targetFolder = destination.getParentFolder()
//                 await targetFolder.ensureExists()
//                 await thumbnailHelper(
//                     this.path,
//                     targetFolder.path,
//                     `${destination.name}.png`,
//                     timestamp,
//                 )
//                 return destination
//             },
//             (ffmpegError) =>
//                 new VideoThumbNailError(this.path, ffmpegError as Error),
//         )()
// }
//
// export function videoFile(
//     file: AFile | Folder | string,
//     ...extraPathPieces: Strings
// ) {
//     return new VideoFile(file, ...extraPathPieces)
// }
//
// export function findVideoFiles(
//     inFolder: Folder = folder(),
//     anyGlob: AnyGlob = { extensions: VIDEO_EXTENSIONS },
// ) {
//     return globFiles(videoFile, inFolder, anyGlob)
// }
