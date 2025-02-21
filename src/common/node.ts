import type { Stats } from "node:fs";
import { objectKeys } from "$/common/objects";

// This is a basic version of SystemError
// https://nodejs.org/api/errors.html#class-systemerror
// Why is the SystemError class not exported?
export class NodeError extends Error {
    readonly code!: string;
    readonly dest: string | undefined;
    readonly info: Record<string, unknown> | undefined;
    readonly path: string | undefined;
}

// Common system errors
// https://nodejs.org/api/errors.html#common-system-errors
// Why is the list of all these not exported somewhere?
// node:util.getSystemErrorName() from
//     https://nodejs.org/api/util.html#utilgetsystemerrornameerr
// exists, but just returns 'string'
export enum NodeErrorCode {
    // biome-ignore lint/style/useNamingConvention: Node Error code
    EACCES = "EACCES",
    // biome-ignore lint/style/useNamingConvention: Node Error code
    EISDIR = "EISDIR",
    // biome-ignore lint/style/useNamingConvention: Node Error code
    ENOENT = "ENOENT",
    // biome-ignore lint/style/useNamingConvention: Node Error code
    ENOTDIR = "ENOTDIR",
    // biome-ignore lint/style/useNamingConvention: Node Error code
    EPERM = "EPERM",
}

export function assertIsNodeError(
    maybeNodeError: unknown,
): asserts maybeNodeError is NodeError {
    if (
        maybeNodeError instanceof Error &&
        "code" in maybeNodeError &&
        typeof maybeNodeError.code === "string"
    ) {
        return;
    }
    throw new Error("was not a Node error", { cause: maybeNodeError });
}

export function isNodeError(
    maybeNodeError: unknown,
): maybeNodeError is NodeError {
    try {
        assertIsNodeError(maybeNodeError);
        return true;
    } catch (_) {
        return false;
    }
}

// https://nodejs.org/api/fs.html#class-fsstats
// https://nodejs.org/api/fs.html#file-type-constants
// Maps all the is<someType>() functions on fs.Stats
//   to their human readable version
export enum FileEntryType {
    BlockDevice = "BlockDevice",
    CharacterDevice = "CharacterDevice",
    Directory = "Directory",
    // biome-ignore lint/style/useNamingConvention: Node Entry
    FIFO = "FIFO",
    File = "File",
    Socket = "Socket",
    SymbolicLink = "SymbolicLink",
}

export function checkFileEntryType(fsStats: Stats) {
    for (const key of objectKeys(FileEntryType)) {
        const match = fsStats[`is${key}`]();
        if (match) {
            return FileEntryType[key];
        }
    }
    // shold not be possible to get here
    return FileEntryType.File;
}

// File system flags
// https://nodejs.org/api/fs.html#file-system-flags
// Related to File open constants:
// https://nodejs.org/api/fs.html#file-open-constants
export enum FsFlag {
    Append = "a",
    AppendOrFail = "ax",
    AppendAndRead = "a+",
    AppendAndReadOrFail = "ax+",
    Read = "r",
    ReadAndWrite = "r+",
    Write = "w",
    WriteOrFailIfExists = "wx",
}
