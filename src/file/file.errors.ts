export type FileOperation =
    | "Append"
    | "Chmod"
    | "Copy"
    | "Link"
    | "Move"
    | "Read"
    | "Remove"
    | "Stat"
    | "SymLink"
    | "Write"
    | "ImageMetadata"
    | "ImageResize"
    | "ImageConvert"
    | "ImagePhash"

const FILE_INDEX = 4
const ERROR_INDEX = -5

abstract class FileError extends Error {
    readonly operation: FileOperation
    readonly path: string
    constructor(path: string, cause: unknown) {
        super()
        this.path = path
        this.operation = this.constructor.name.slice(
            FILE_INDEX,
            ERROR_INDEX,
        ) as FileOperation
        this.message = `Error trying to ${this.operation} file: ${path}`
        this.cause = cause
        this.name = this.constructor.name
    }
}

export class FileStatError extends FileError {}

export class FileChmodError extends FileError {}

export class FileReadError extends FileError {}

export class FileWriteError extends FileError {}

export class FileAppendError extends FileError {}

export class FileRemoveError extends FileError {}

export class FileImageMetadataError extends FileError {}

export class FileImageResizeError extends FileError {}

export class FileImageConvertError extends FileError {}

export class FileImagePhashError extends FileError {}

export const DESTINATION_FALLBACK = "DESTINATION_FALLBACK"

abstract class FileRelocateError extends FileError {
    readonly destinationPath: string
    constructor(path: string, destinationPath: string | null, cause: unknown) {
        super(path, cause)
        this.destinationPath = destinationPath ?? DESTINATION_FALLBACK
    }
}

export class FileCopyError extends FileRelocateError {}

export class FileMoveError extends FileRelocateError {}

export class FileLinkError extends FileRelocateError {}

export class FileSymLinkError extends FileRelocateError {}
