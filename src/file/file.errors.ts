export type FileOperation =
    | "copy"
    | "link"
    | "move"
    | "read"
    | "remove"
    | "stat"
    | "symlink"
    | "write"
    | "image_metadata"
    | "image_resize"
    | "image_convert"
    | "image_phash"

abstract class FileError extends Error {
    readonly operation: FileOperation
    readonly path: string
    constructor(operation: FileOperation, path: string, cause?: unknown) {
        const message = `Error trying to ${operation} file: ${path}`
        super(message, { cause })
        this.path = path
        this.operation = operation
        this.name = this.constructor.name
    }
}

export class FileStatError extends FileError {
    constructor(path: string, cause?: unknown) {
        super("stat", path, cause)
    }
}

export class FileReadError extends FileError {
    constructor(path: string, cause?: unknown) {
        super("read", path, cause)
    }
}

export class FileWriteError extends FileError {
    constructor(path: string, cause?: unknown) {
        super("write", path, cause)
    }
}

export class FileRemoveError extends FileError {
    constructor(path: string, cause?: unknown) {
        super("remove", path, cause)
    }
}

export class ImageMetadataError extends FileError {
    constructor(path: string, cause?: unknown) {
        super("image_metadata", path, cause)
    }
}

export class ImageResizeError extends FileError {
    constructor(path: string, cause?: unknown) {
        super("image_resize", path, cause)
    }
}

export class ImageConvertError extends FileError {
    constructor(path: string, cause?: unknown) {
        super("image_convert", path, cause)
    }
}

export class ImagePhashError extends FileError {
    constructor(path: string, cause?: unknown) {
        super("image_phash", path, cause)
    }
}

export const DESTINATION_FALLBACK = "DESTINATION_FALLBACK"

export class FileRelocateError extends FileError {
    readonly destinationPath: string
    constructor(
        operation: FileOperation,
        path: string,
        destinationPath: string | null,
        cause?: unknown,
    ) {
        super(operation, path, cause)
        this.destinationPath = destinationPath ?? DESTINATION_FALLBACK
    }
}

export class FileCopyError extends FileRelocateError {
    constructor(path: string, destinationPath: string | null, cause?: unknown) {
        super("copy", path, destinationPath, cause)
    }
}

export class FileMoveError extends FileRelocateError {
    constructor(path: string, destinationPath: string | null, cause?: unknown) {
        super("move", path, destinationPath, cause)
    }
}

export class FileLinkError extends FileRelocateError {
    constructor(path: string, destinationPath: string | null, cause?: unknown) {
        super("link", path, destinationPath, cause)
    }
}

export class FileSymLinkError extends FileRelocateError {
    constructor(path: string, destinationPath: string | null, cause?: unknown) {
        super("symlink", path, destinationPath, cause)
    }
}
