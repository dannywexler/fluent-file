import type { Strings } from "$/common/types";
import { zodResult } from "$/common/zod";
import { AnyFile } from "$/file/any";
import { VideoMetaDataSchema } from "$/file/video.schemas";
import type { Folder } from "$/folder/folder";
import { type FfprobeData, ffprobe } from "fluent-ffmpeg";
import { ResultAsync } from "neverthrow";
import { VideoMetaDataError } from "./video.errors";

const ffProbePromise = (filePath: string) =>
    new Promise<FfprobeData>((resolve, reject) =>
        ffprobe(filePath, (ffprobeError, data) => {
            if (ffprobeError) {
                reject(ffprobeError);
            }
            resolve(data);
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
}

export function videoFile(
    file: AnyFile | Folder | string,
    ...extraPathPieces: Strings
) {
    return new VideoFile(file, ...extraPathPieces);
}
