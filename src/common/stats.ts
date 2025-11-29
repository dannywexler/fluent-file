import { stat } from "node:fs/promises"

import { ResultAsync } from "neverthrow"

import type { NodeError } from "$/common/node"
import { assertIsNodeError, checkFileEntryType } from "$/common/node"
import type { AFile } from "$/file/any"
import { FileWasNotFileError } from "$/file/any.errors"
import type { Folder } from "$/folder/folder"
import { FolderWasNotFolderError } from "$/folder/folder.errors"

export function getFolderStats(folder: Folder) {
    return ResultAsync.fromThrowable(
        async () => {
            const stats = await stat(folder.path)
            if (stats.isDirectory()) {
                return stats
            }
            throw new FolderWasNotFolderError(
                folder.path,
                checkFileEntryType(stats),
            )
        },
        (error) => {
            if (error instanceof FolderWasNotFolderError) {
                return error as FolderWasNotFolderError
            }
            assertIsNodeError(error)
            return error as NodeError
        },
    )()
}

export function getFileStats(file: AFile) {
    return ResultAsync.fromThrowable(
        async () => {
            const stats = await stat(file.path)
            if (stats.isFile()) {
                return stats
            }
            throw new FileWasNotFileError(file.path, checkFileEntryType(stats))
        },
        (error) => {
            if (error instanceof FileWasNotFileError) {
                return error as FileWasNotFileError
            }
            assertIsNodeError(error)
            return error as NodeError
        },
    )()
}
