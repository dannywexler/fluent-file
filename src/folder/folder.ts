import { homedir } from "node:os";
import type { Strings } from "$/common/types";
import { emptyDir, ensureDir, remove, stat } from "fs-extra";
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
	get parentFolder() {
		return new Folder(this.#parentPath);
	}

	toString() {
		return {
			path: this.path,
			name: this.name,
			parentName: this.parentName,
			parentPath: this.#parentPath,
		};
	}

	join(folder: string | Folder, ...extraPathPieces: Strings) {
		const firstPathPiece = folder instanceof Folder ? folder.path : folder;
		return new Folder(this.#path, firstPathPiece, ...extraPathPieces);
	}

	async exists() {
		try {
			const stats = await stat(this.#path);
			return stats.isDirectory();
		} catch (_) {
			return false;
		}
	}

	async ensureExists() {
		await ensureDir(this.#path);
	}

	async ensureEmpty() {
		await emptyDir(this.#path);
	}

	async delete() {
		await remove(this.path);
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
