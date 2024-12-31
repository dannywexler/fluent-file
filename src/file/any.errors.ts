import type { FileEntryType } from "$/common/node";

export enum FileError {
    NotFound = "FileNotFoundError",
    Read = "FileReadError",
    Write = "FileWriteError",
    WasFolder = "FileWasFolderError",
}

export class FileNotFoundError extends Error {
    constructor(path: string, cause: Error) {
        super(path, { cause });
        this.name = this.constructor.name;
    }
}

export class FileReadError extends Error {
    constructor(path: string, cause: Error) {
        super(path, { cause });
        this.name = this.constructor.name;
    }
}

export class FileWriteError extends Error {
    constructor(path: string, cause: Error) {
        super(path, { cause });
        this.name = this.constructor.name;
    }
}

export class FileWasNotFileError extends Error {
    actualFileEntryType: FileEntryType;
    constructor(
        path: string,
        actualFileEntryType: FileEntryType,
        cause?: Error,
    ) {
        const msg = `${path}\nwas actually a ${actualFileEntryType} instead of a Folder`;
        if (cause) {
            super(msg, { cause });
        } else {
            super(msg);
        }
        this.name = this.constructor.name;
        this.actualFileEntryType = actualFileEntryType;
    }
}
