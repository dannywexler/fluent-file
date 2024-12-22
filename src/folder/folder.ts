import { homedir } from "node:os";
import { type AnyGlob, globFolders } from "$/common/glob";
import type { Strings } from "$/common/types";
import { emptyDir, ensureDir, remove, stat } from "fs-extra";
import { basename, dirname, resolve } from "pathe";
import { ResultAsync } from "neverthrow";
import { getFolderStats } from "$/common/stats";

export class Folder {
    #path: string;
    #name: string;
    #parentName: string;
    #parentPath: string;
    #pathsMapper = (paths: Strings) => paths.map((pth) => folder(pth));

    constructor(folder: string | Folder, ...extraPathPieces: Strings) {
        const firstPathPiece = folder instanceof Folder ? folder.path : folder;
        this.#path = resolve(firstPathPiece, ...extraPathPieces);
        this.#name = basename(this.#path);
        if (!this.#name) {
            this.#name = this.#path;
        }
        this.#parentPath = dirname(this.path);
        this.#parentName = basename(this.#parentPath);
        if (!this.#parentName) {
            this.#parentName = this.#name;
        }
    }

    get path() {
        return this.#path;
    }
    get name() {
        return this.#name;
    }
    get parentName() {
        return this.#parentName;
    }
    get parentPath() {
        return this.#parentPath;
    }

    get info() {
        return {
            path: this.#path,
            name: this.#name,
            parentName: this.#parentName,
            parentPath: this.#parentPath,
        };
    }

    toString() {
        return this.#path;
    }

    getStats() {
        return getFolderStats(this.#path)
    }

    async exists() {
        return this.getStats().map(() => true)
    }

    async ensureExists() {
        await ensureDir(this.#path);
    }

    async ensureEmpty() {
        await emptyDir(this.#path);
    }

    async delete() {
        await remove(this.#path);
    }

    getParentFolder() {
        return new Folder(this.#parentPath);
    }

    subFolder(folder: string | Folder, ...extraPathPieces: Strings) {
        const firstPathPiece = folder instanceof Folder ? folder.path : folder;
        return new Folder(this.#path, firstPathPiece, ...extraPathPieces);
    }

    childFolders(globPattern: AnyGlob) {
        return globFolders(this.#path, globPattern, 1).map(this.#pathsMapper);
    }

    findFolders(globPattern: AnyGlob) {
        return globFolders(this.#path, globPattern).map(this.#pathsMapper);
    }
}

export function folder(folder?: string | Folder): Folder;
export function folder(
    folder: string | Folder,
    ...extraPathPieces: Strings
): Folder;

export function folder(
    folder: string | Folder | undefined,
    ...extraPathPieces: Strings
) {
    if (folder === undefined) {
        return new Folder("");
    }
    return new Folder(folder, ...extraPathPieces);
}

export function homeFolder(...extraPathPieces: Strings) {
    return new Folder(homedir(), ...extraPathPieces);
}
