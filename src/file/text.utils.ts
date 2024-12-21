import { NodeErrorCode, assertIsNodeError } from "$/common/errors";
import {
    FileNotFoundError,
    FileReadError,
    FileWasFolderError,
    FileWriteError,
} from "$/file/any.errors";
import { readFile, writeFile } from "fs-extra";
import { ResultAsync } from "neverthrow";

export function readFileText(path: string) {
    return ResultAsync.fromThrowable(
        () => readFile(path, "utf8"),
        (nodeErr) => {
            assertIsNodeError(nodeErr);
            if (nodeErr.code === NodeErrorCode.ENOENT) {
                return new FileNotFoundError(path, nodeErr);
            }
            if (nodeErr.code === NodeErrorCode.EISDIR) {
                return new FileWasFolderError(path, nodeErr);
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
                return new FileWasFolderError(path, nodeErr);
            }
            return new FileWriteError(path, nodeErr);
        },
    )();
}
