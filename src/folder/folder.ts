import { homedir } from "node:os";
import { type AnyGlob, globFolders } from "$/common/glob";
import { getFolderStats } from "$/common/stats";
import type { Strings } from "$/common/types";
import { emptyDir, ensureDir, remove } from "fs-extra";
import { basename, dirname, resolve } from "pathe";

export class Folder {
    #path: string;
    #name: string;
    #parentName: string;
    #parentPath: string;

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

    toString = () => this.#path;

    // biome-ignore lint/style/useNamingConvention: needs to be this case to print
    toJSON = () => ({ Folder: this.info });

    getStats = () => getFolderStats(this);

    exists = async () => (await this.getStats()).isOk();

    ensureExists = () => ensureDir(this.#path);

    ensureEmpty = () => emptyDir(this.#path);

    delete = () => remove(this.#path);

    getParentFolder = () => new Folder(this.#parentPath);

    subFolder = (folder: string | Folder, ...extraPathPieces: Strings) => {
        const firstPathPiece = folder instanceof Folder ? folder.path : folder;
        return new Folder(this.#path, firstPathPiece, ...extraPathPieces);
    };

    childFolders = (globPattern: AnyGlob) => globFolders(this, globPattern, 1);

    findFolders = (globPattern: AnyGlob) => globFolders(this, globPattern);
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
