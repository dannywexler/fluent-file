// import type { FileEntryType } from "$/common/node"
//
// export class FolderNotFoundError extends Error {
//     constructor(path: string, cause: Error) {
//         super(path, { cause })
//         this.name = this.constructor.name
//     }
// }
//
// export class FolderWasNotFolderError extends Error {
//     actualFileEntryType: FileEntryType
//     constructor(
//         path: string,
//         actualFileEntryType: FileEntryType,
//         cause?: Error,
//     ) {
//         const msg = `${path}\nwas actually a ${actualFileEntryType} instead of a Folder`
//         if (cause) {
//             super(msg, { cause })
//         } else {
//             super(msg)
//         }
//         this.name = this.constructor.name
//         this.actualFileEntryType = actualFileEntryType
//     }
// }
