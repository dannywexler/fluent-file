import { homedir } from "node:os";
import { NEWLINE_REGEX, readFileText, writeFileText } from "$/common/text";
import type { Strings } from "$/common/types";
import { Folder } from "$/folder/folder";
import { ensureFile, remove, stat } from "fs-extra";
import { basename, dirname, resolve } from "pathe";

export class AnyFile {
    #path: string;
    #fullName: string;
    #name: string;
    #ext: string;
    #parentName: string;
    #parentPath: string;

    constructor(file: AnyFile | Folder | string, ...extraPathPieces: Strings) {
        const firstPathPiece = newAnyFile(file);
        this.#path = resolve(firstPathPiece, ...extraPathPieces);
        this.#fullName = basename(this.#path);
        const lastDotIndex = this.#fullName.lastIndexOf(".");
        if (lastDotIndex <= 0) {
            this.#name = this.#fullName;
            this.#ext = "";
        } else {
            this.#name = this.#fullName.slice(0, lastDotIndex);
            this.#ext = this.#fullName.slice(lastDotIndex + 1);
        }

        this.#parentPath = dirname(this.path);
        this.#parentName = basename(this.#parentPath);
        if (!this.#parentName) {
            this.#parentName = this.#fullName;
        }
    }

    get path() {
        return this.#path;
    }
    get fullName() {
        return this.#fullName;
    }
    get name() {
        return this.#name;
    }
    get ext() {
        return this.#ext;
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
            fullName: this.#fullName,
            name: this.#name,
            ext: this.#ext,
            parentName: this.#parentName,
            parentPath: this.#parentPath,
        };
    }

    toString = () => this.#path;

    getParentFolder = () => new Folder(this.#parentPath);

    exists = async () => {
        try {
            const stats = await stat(this.#path);
            return stats.isFile();
        } catch (_) {
            return false;
        }
    };

    ensureExists = () => ensureFile(this.#path);

    delete = () => remove(this.#path);

    readText = () => readFileText(this.path);

    readTextLines = () =>
        this.readText().map((str) => str.split(NEWLINE_REGEX));

    writeText = (content: string) => writeFileText(this.path, content);
}

export function file(
    file: AnyFile | Folder | string,
    ...extraPathPieces: Strings
) {
    return new AnyFile(file, ...extraPathPieces);
}

export function homeFile(
    file: AnyFile | Folder | string,
    ...extraPathPieces: Strings
) {
    return new AnyFile(homedir(), newAnyFile(file), ...extraPathPieces);
}

function newAnyFile(file: AnyFile | Folder | string) {
    if (file instanceof AnyFile || file instanceof Folder) {
        return file.path;
    }
    return file;
}
