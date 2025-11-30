import { opendir, stat } from "node:fs/promises"
import { homedir } from "node:os"
import { inspect } from "node:util"

import { emptyDir, ensureDir, remove } from "fs-extra/esm"
import { ResultAsync } from "neverthrow"
import pathe, { basename, resolve } from "pathe"
import picomatch from "picomatch"

import type {
    FindFilesGlobOptions,
    FindFoldersGlobOptions,
} from "$/common/glob"
import {
    getFilePathExtension,
    normalizeAndResolvePath,
    removeDotFromExtension,
} from "$/common/path"
import { ffile } from "$/file/file"

import { FolderError, FolderGlobError } from "./folder.errors"

export class FluentFolder {
    readonly path: string
    readonly name: string

    constructor(...pathPieces: Array<string | number>) {
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

    folder = (...pathPieces: Array<string>) => folder(this.path, ...pathPieces)

    file = (file: string, ...extraPathPieces: Array<string>) =>
        ffile(this.path, file, ...extraPathPieces)

    relativePath = (relativeTo = currentFolder()) => {
        if (this.path.startsWith(relativeTo)) {
            return this.path.slice(relativeTo.length + 1)
        }
        return this.path
    }

    toString = () => this.path

    // biome-ignore lint/style/useNamingConvention: needs to be this case to print
    toJSON = () => ({ Folder: this.info });

    [inspect.custom] = () => this.toJSON()

    stats = ResultAsync.fromThrowable(
        async () => {
            const stats = await stat(this.path)
            if (stats.isDirectory()) {
                return stats
            } else {
                throw new FolderError("stat", this.path, "FolderWasNotFolder")
            }
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

export function folder(
    ...pathPieces: ConstructorParameters<typeof FluentFolder>
) {
    return new FluentFolder(...pathPieces)
}

export function homeFolder(
    ...pathPieces: ConstructorParameters<typeof FluentFolder>
) {
    return folder(homedir(), ...pathPieces)
}

export function currentFolder() {
    return resolve(process.cwd())
}
