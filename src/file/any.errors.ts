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

export class FileWasFolderError extends Error {
    constructor(path: string, cause: Error) {
        super(path, { cause });
        this.name = this.constructor.name;
    }
}
