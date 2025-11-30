import { stat } from "node:fs/promises"
import { homedir } from "node:os"
import { inspect } from "node:util"

import { emptyDir, ensureDir, remove } from "fs-extra/esm"
import { ResultAsync } from "neverthrow"
import { basename, resolve } from "pathe"

import { normalizeAndResolvePath } from "$/common/path"
import { ffile } from "$/file/file"

import { FolderError } from "./folder.errors"

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

    delete = () => remove(this.path)
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
