import { FileEntryType, NodeErrorCode, assertIsNodeError } from "$/common/node";
import {
    FileNotFoundError,
    FileReadError,
    FileWasNotFileError,
    FileWriteError,
} from "$/file/any.errors";
import { readFile, writeFile } from "fs-extra";
import { ResultAsync } from "neverthrow";

export const NEWLINE_REGEX = /\n|\r|\r\n/;

export function readFileText(path: string) {
    return ResultAsync.fromThrowable(
        () => readFile(path, "utf8"),
        (nodeErr) => {
            assertIsNodeError(nodeErr);
            if (nodeErr.code === NodeErrorCode.ENOENT) {
                return new FileNotFoundError(path, nodeErr);
            }
            if (nodeErr.code === NodeErrorCode.EISDIR) {
                return new FileWasNotFileError(
                    path,
                    FileEntryType.Directory,
                    nodeErr,
                );
            }
            return new FileReadError(path, nodeErr);
        },
    )();
}

export function writeFileText(path: string, text: string) {
    return ResultAsync.fromThrowable(
        () => writeFile(path, text),
        (nodeErr) => {
            assertIsNodeError(nodeErr);
            if (nodeErr.code === NodeErrorCode.EISDIR) {
                return new FileWasNotFileError(
                    path,
                    FileEntryType.Directory,
                    nodeErr,
                );
            }
            return new FileWriteError(path, nodeErr);
        },
    )();
}
