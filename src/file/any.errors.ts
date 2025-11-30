// import { FileError } from "$/common/errors"
// import type { FileEntryType } from "$/common/node"
//
// export class FileNotFoundError extends Error {
//     constructor(path: string, cause: Error) {
//         super(path, { cause })
//         this.name = this.constructor.name
//     }
// }
//
// export class FileReadError extends Error {
//     constructor(path: string, cause: Error) {
//         super(path, { cause })
//         this.name = this.constructor.name
//     }
// }
//
// export class FileWriteError extends Error {
//     constructor(path: string, cause: Error) {
//         super(path, { cause })
//         this.name = this.constructor.name
//     }
// }
//
// export class FileWasNotFileError extends FileError<{actualFileEntryType: FileEntryType}> {
//     actualFileEntryType: FileEntryType
//     constructor(
//         info: {path: string, actualFileEntryType: FileEntryType, cause: unknown}
//     ) {
//         const msg = `${info.path}\nwas actually a ${info.actualFileEntryType} instead of a File`
//         super({message: msg, cause: info.cause})
//
//         this.actualFileEntryType = actualFileEntryType
//     }
// }
