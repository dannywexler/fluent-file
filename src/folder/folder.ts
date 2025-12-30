import { opendir, stat } from "node:fs/promises"
import { inspect } from "node:util"

import { emptyDir, ensureDir, remove } from "fs-extra/esm"
import { ResultAsync } from "neverthrow"
import pathe, { basename } from "pathe"
import picomatch from "picomatch"

import type {
    FindFilesGlobOptions,
    FindFoldersGlobOptions,
} from "$/common/glob"
import type { PathPieces } from "$/common/path"
import {
    getFilePathExtension,
    normalizeAndResolvePath,
    removeDotFromExtension,
} from "$/common/path"
import { ffile } from "$/file/file"
import { FolderError, FolderGlobError } from "$/folder/folder.errors"
import { currentFolder } from "$/folder/xdg"

export class FluentFolder {
    readonly path: string
    readonly name: string

    constructor(...pathPieces: PathPieces) {
        this.path = normalizeAndResolvePath(...pathPieces)
        this.name = basename(this.path)
        if (!this.name) {
            this.name = this.path
        }
    }

    get info() {
        return {
            path: this.path,
            name: this.name,
        }
    }

    folder = (...pathPieces: PathPieces) => folder(this.path, ...pathPieces)

    file = (file: string, ...extraPathPieces: PathPieces) =>
        ffile(this.path, file, ...extraPathPieces)

    relativePath = (relativeTo = currentFolder()) => {
        let relative = this.path
        if (relative.startsWith(relativeTo.path)) {
            relative = relative.slice(relativeTo.path.length)
            if (relative.startsWith("/")) {
                return relative.slice(1)
            }
        }
        return relative
    }

    toString = () => this.path

    // biome-ignore lint/style/useNamingConvention: needs to be this case to print
    toJSON = () => ({ FluentFolder: this.info });

    [inspect.custom] = () => this.toJSON()

    stats = ResultAsync.fromThrowable(
        async () => {
            const stats = await stat(this.path)
            if (!stats.isDirectory()) {
                throw new FolderError("stat", this.path, "FolderWasNotFolder")
            }
            return stats
        },
        (someError) => {
            if (someError instanceof FolderError) {
                return someError
            }
            return new FolderError("stat", this.path, someError)
        },
    )

    exists = async () => (await this.stats()).isOk()

    ensureExists = () => ensureDir(this.path)

    ensureEmpty = () => emptyDir(this.path)

    remove = () => remove(this.path)

    findFolders = ResultAsync.fromThrowable(
        async (findFoldersOptions: FindFoldersGlobOptions = {}) => {
            const matcher = findFoldersOptions.glob
                ? picomatch(findFoldersOptions.glob, { cwd: this.path })
                : null
            const dir = await opendir(this.path, {
                recursive: findFoldersOptions.recursive ?? true,
            })
            const absolutePaths: Array<string> = []
            for await (const dirent of dir) {
                if (!dirent.isDirectory()) {
                    continue
                }
                const absolutePath = pathe.resolve(
                    dirent.parentPath,
                    dirent.name,
                )
                if (matcher && !matcher(absolutePath)) {
                    continue
                }
                absolutePaths.push(absolutePath)
            }
            return absolutePaths
                .sort()
                .map((absolutePath) => folder(absolutePath))
        },
        (someError) => new FolderGlobError(this.path, someError),
    )

    findFiles = ResultAsync.fromThrowable(
        async (findFilesOptions: FindFilesGlobOptions = {}) => {
            const matcher = findFilesOptions.glob
                ? picomatch(findFilesOptions.glob, { cwd: this.path })
                : null
            const dir = await opendir(this.path, {
                recursive: findFilesOptions.recursive ?? true,
            })
            const absolutePaths: Array<string> = []
            const normalizedExts = (findFilesOptions.exts ?? []).map(
                removeDotFromExtension,
            )
            for await (const dirent of dir) {
                if (!dirent.isFile()) {
                    continue
                }
                const absolutePath = pathe.resolve(
                    dirent.parentPath,
                    dirent.name,
                )
                if (normalizedExts.length > 0) {
                    const ext = getFilePathExtension(dirent.name)
                    if (!normalizedExts.includes(ext)) {
                        continue
                    }
                }
                if (matcher && !matcher(absolutePath)) {
                    continue
                }

                absolutePaths.push(absolutePath)
            }
            return absolutePaths
                .sort()
                .map((absolutePath) => ffile(absolutePath))
        },
        (someError) => new FolderGlobError(this.path, someError),
    )
}

export function folder(...pathPieces: PathPieces) {
    return new FluentFolder(...pathPieces)
}
