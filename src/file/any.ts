// import { constants } from "node:fs"
// import { copyFile } from "node:fs/promises"
// import { homedir } from "node:os"
// import { inspect } from "node:util"
//
// import {
//     ensureFile,
//     ensureLink,
//     ensureSymlink,
//     move,
//     remove,
// } from "fs-extra/esm"
// import { basename, dirname, resolve } from "pathe"
//
// import { getFileStats } from "$/common/stats"
// import { NEWLINE_REGEX, readFileText, writeFileText } from "$/common/text"
// import type { Strings } from "$/common/types"
// import { currentFolder, FluentFolder } from "$/folder/folder"
//
// // biome-ignore lint/style/useNamingConvention: Want to use this name
// export class AFile {
//     #path: string
//     #fullName: string
//     #name: string
//     #ext: string
//     #parentName: string
//     #parentPath: string
//
//     constructor(file: AFile | FluentFolder | string, ...extraPathPieces: Strings) {
//         const firstPathPiece = newAnyFile(file)
//         this.#path = resolve(firstPathPiece, ...extraPathPieces)
//         this.#fullName = basename(this.#path)
//         const lastDotIndex = this.#fullName.lastIndexOf(".")
//         if (lastDotIndex <= 0) {
//             this.#name = this.#fullName
//             this.#ext = ""
//         } else {
//             this.#name = this.#fullName.slice(0, lastDotIndex)
//             this.#ext = this.#fullName.slice(lastDotIndex + 1)
//         }
//
//         this.#parentPath = dirname(this.path)
//         this.#parentName = basename(this.#parentPath)
//         if (!this.#parentName) {
//             this.#parentName = this.#fullName
//         }
//     }
//
//     get path() {
//         return this.#path
//     }
//     get fullName() {
//         return this.#fullName
//     }
//     get name() {
//         return this.#name
//     }
//     get ext() {
//         return this.#ext
//     }
//     get parentName() {
//         return this.#parentName
//     }
//     get parentPath() {
//         return this.#parentPath
//     }
//
//     get info() {
//         return {
//             path: this.#path,
//             fullName: this.#fullName,
//             name: this.#name,
//             ext: this.#ext,
//             parentName: this.#parentName,
//             parentPath: this.#parentPath,
//         }
//     }
//
//     relativePath = (relativeTo = currentFolder()) => {
//         if (this.#path.startsWith(relativeTo)) {
//             return this.#path.slice(relativeTo.length + 1)
//         }
//         return this.#path
//     }
//
//     toString = () => this.#path
//
//     // biome-ignore lint/style/useNamingConvention: needs to be this case to print
//     toJSON = () => ({ File: this.info });
//
//     [inspect.custom] = () => this.toJSON()
//
//     getParentFolder = () => new FluentFolder(this.#parentPath)
//
//     getStats = () => getFileStats(this)
//
//     exists = async () => (await this.getStats()).isOk()
//
//     ensureExists = () => ensureFile(this.#path)
//
//     copyTo = async (destination: AFile | FluentFolder) => {
//         const targetFile =
//             destination instanceof AFile
//                 ? destination
//                 : afile(destination, this.#fullName)
//         await targetFile.getParentFolder().ensureExists()
//         await targetFile.delete()
//         await copyFile(this.#path, targetFile.path, constants.COPYFILE_FICLONE)
//     }
//
//     moveTo = async (destination: AFile | FluentFolder) => {
//         const targetFile =
//             destination instanceof AFile
//                 ? destination
//                 : afile(destination, this.#fullName)
//         await targetFile.getParentFolder().ensureExists()
//         await targetFile.delete()
//         await move(this.#path, targetFile.path)
//     }
//
//     linkTo = async (destination: AFile | FluentFolder) => {
//         const targetFile =
//             destination instanceof AFile
//                 ? destination
//                 : afile(destination, this.#fullName)
//         await targetFile.getParentFolder().ensureExists()
//         await targetFile.delete()
//         await ensureLink(this.#path, targetFile.path)
//     }
//
//     symlinkTo = async (destination: AFile | FluentFolder) => {
//         const targetFile =
//             destination instanceof AFile
//                 ? destination
//                 : afile(destination, this.#fullName)
//         await targetFile.getParentFolder().ensureExists()
//         await targetFile.delete()
//         await ensureSymlink(this.#path, targetFile.path)
//     }
//
//     delete = () => remove(this.#path)
//
//     readText = () => readFileText(this.path)
//
//     readTextLines = () => this.readText().map((str) => str.split(NEWLINE_REGEX))
//
//     writeText = (content: string) => writeFileText(this.path, content)
// }
//
// export function afile(
//     file: AFile | FluentFolder | string,
//     ...extraPathPieces: Strings
// ) {
//     return new AFile(file, ...extraPathPieces)
// }
//
// export function homeFile(
//     file: AFile | FluentFolder | string,
//     ...extraPathPieces: Strings
// ) {
//     return new AFile(homedir(), newAnyFile(file), ...extraPathPieces)
// }
//
// function newAnyFile(file: AFile | FluentFolder | string) {
//     if (file instanceof AFile || file instanceof FluentFolder) {
//         return file.path
//     }
//     return file
// }
//
