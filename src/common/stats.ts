import { type NodeError, checkFileEntryType, isNodeError } from "$/common/node";
import { FolderWasNotFolderError } from "$/folder/folder.errors";
import { stat } from "fs-extra";
import { ResultAsync } from "neverthrow";

export function getFolderStats(path: string) {
    return ResultAsync.fromThrowable(
        async () => {
            const stats = await stat(path);

            if (stats.isDirectory()) {
                return stats;
            }
            throw new FolderWasNotFolderError(path, checkFileEntryType(stats));
        },
        (error) => {
            if (isNodeError(error)) {
                return error as NodeError;
            }
            return error as FolderWasNotFolderError;
        },
    )();
}
