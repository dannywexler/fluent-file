export enum FileError {
    NotFound = "FileNotFoundError",
    Read = "FileReadError",
    Write = "FileWriteError",
    WasFolder = "FileWasFolderError",
}

export class FileNotFoundError extends Error {
    case: FileError;
    constructor(path: string, cause: Error) {
        super(`${FileError.NotFound}: ${path}`, { cause });
        this.name = this.constructor.name;
        this.case = FileError.NotFound;
    }
}

export class FileReadError extends Error {
    case: FileError;
    constructor(path: string, cause: Error) {
        super(`${FileError.Read}: ${path}`, { cause });
        this.name = this.constructor.name;
        this.case = FileError.Read;
    }
}

export class FileWriteError extends Error {
    case: FileError;
    constructor(path: string, cause: Error) {
        super(`${FileError.Write}: ${path}`, { cause });
        this.name = this.constructor.name;
        this.case = FileError.Read;
    }
}

export class FileWasFolderError extends Error {
    case: FileError;
    constructor(path: string, cause: Error) {
        super(`${FileError.WasFolder}: ${path}`, { cause });
        this.name = this.constructor.name;
        this.case = FileError.WasFolder;
    }
}
