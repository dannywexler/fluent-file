import { type NodeError, checkFileEntryType, isNodeError } from "$/common/node";
import type { Folder } from "$/folder/folder";
import { FolderWasNotFolderError } from "$/folder/folder.errors";
import { stat } from "fs-extra";
import { ResultAsync } from "neverthrow";

export function getFolderStats(folder: Folder) {
    return ResultAsync.fromThrowable(
        async () => {
            const stats = await stat(folder.path);

            if (stats.isDirectory()) {
                return stats;
            }
            throw new FolderWasNotFolderError(
                folder.path,
                checkFileEntryType(stats),
            );
        },
        (error) => {
            if (isNodeError(error)) {
                return error as NodeError;
            }
            return error as FolderWasNotFolderError;
        },
    )();
}
