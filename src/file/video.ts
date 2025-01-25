import type { Strings } from "$/common/types";
import { zodResult } from "$/common/zod";
import { AnyFile } from "$/file/any";
import type { ImageFile } from "$/file/image";
import { VideoMetaDataSchema } from "$/file/video.schemas";
import { folder, type Folder } from "$/folder/folder";
import ffmpeg, { type FfprobeData, ffprobe } from "fluent-ffmpeg";
import { ResultAsync } from "neverthrow";
import { VideoMetaDataError, VideoThumbNailError } from "./video.errors";
import { globFiles, type AnyGlob } from "$/common/glob";

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

const ffProbePromise = (filePath: string) =>
    new Promise<FfprobeData>((resolve, reject) =>
        ffprobe(filePath, (ffprobeError, data) => {
            if (ffprobeError) {
                reject(ffprobeError);
            }
            resolve(data);
        }),
    );

const thumbnailHelper = (
    videoPath: string,
    folder: string,
    filename: string,
    timestamp: string | number,
) =>
    new Promise<void>((resolve, reject) =>
        ffmpeg(videoPath)
            .on("error", (err) => reject(err))
            .on("end", () => resolve())
            .screenshot({
                filename,
                folder,
                // types are confused about number[] vs. string[] vs. Array<string | number>
                timestamps:
                    typeof timestamp === "string" ? [timestamp] : [timestamp],
            }),
    );

export class VideoFile extends AnyFile {
    getMetaData = () =>
        this.getStats().andThen(() =>
            ResultAsync.fromThrowable(
                () => ffProbePromise(this.path),
                (ffprobeError) =>
                    new VideoMetaDataError(this.path, ffprobeError as Error),
            )().andThen((ffprobeData) =>
                zodResult(VideoMetaDataSchema, ffprobeData),
            ),
        );

    getThumbnail = (timestamp: string | number, destination: ImageFile) =>
        ResultAsync.fromThrowable(
            async () => {
                const alreadyExists = await destination.exists();
                if (alreadyExists) {
                    return destination;
                }
                const targetFolder = destination.getParentFolder();
                await targetFolder.ensureExists();
                await thumbnailHelper(
                    this.path,
                    targetFolder.path,
                    `${destination.name}.png`,
                    timestamp,
                );
                return destination;
            },
            (ffmpegError) =>
                new VideoThumbNailError(this.path, ffmpegError as Error),
        )();
}

export function videoFile(
    file: AnyFile | Folder | string,
    ...extraPathPieces: Strings
) {
    return new VideoFile(file, ...extraPathPieces);
}

export function findVideoFiles(
    inFolder: Folder = folder(),
    anyGlob: AnyGlob = { extensions: VIDEO_EXTENSIONS }
) {
    return globFiles(videoFile, inFolder, anyGlob);
}
