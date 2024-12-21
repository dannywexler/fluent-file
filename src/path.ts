// assertPathIsValid
// https://learn.microsoft.com/en-us/windows/win32/fileio/naming-a-file#naming-conventions
// Do not end a file or directory name with a space or a period
// Do not use the following reserved names for the name of a file:
//
// CON, PRN, AUX, NUL, COM0, COM1, COM2, COM3, COM4, COM5, COM6, COM7, COM8, COM9, COM¹, COM², COM³, LPT0, LPT1, LPT2, LPT3, LPT4, LPT5, LPT6, LPT7, LPT8, LPT9, LPT¹, LPT², and LPT³. Also avoid these names followed immediately by an extension; for example, NUL.txt and NUL.tar.gz are both equivalent to NUL
// if (process.platform === 'win32') {
//   const pathHasInvalidWinCharacters = /[<>:"|?*]/.test(pth.replace(path.parse(pth).root, ''))
//
//   if (pathHasInvalidWinCharacters) {
//     const error = new Error(`Path contains invalid characters: ${pth}`)
//     error.code = 'EINVAL'
//     throw error
//   }
// }

// isPathValid, like assertPathIsValid, but return boolean

// FolderPath
//  name
//  parentName
//  parentPath
//  path

// parseFolderPath = string => FolderPath
// stringifyFolderPath = FolderPath => string
//
// not super sure these are neccessary...

// parseFilePath = string => FilePath
// stringifyFilePath = FilePath => string

// FilePath
//  name
//  fullName
//  ext
//  parentName
//  parentPath
//  path
//  relativePath(aFolder = cwd()) => relative path string
//      if this.path.startsWith(resolve(aFolder))
//          return this.path.replace(aFolder, "")

// This is important for
//  findFiles => Array<FilePath>
//  findFolders => Array<FolderPath>
//  findAll => Array<FilePath | FolderPath>

// Whats the benefit of making these separate classes?
//
// What if just:
//  findFiles => Array<AnyFile>
//  findFolders => Array<Folder>
//  findAll => Array<FilePath | FolderPath>
//
// If want a batch of XFiles, can do
//
// (await findFiles).map(XFile)

// findFolder

// this is not super necessary, since it can also be accomplished by:
// const fldr = folder(...)
// const fl = file(fldr, ...)
// subAnyFile(file: string | Folder, ...extraPathPieces: Strings) {
//     const firstPathPiece = file instanceof Folder ? file.path : file;
//     return new AnyFile(this.#path, firstPathPiece, ...extraPathPieces);
// }

// findAnyFile

// subJsonFile()

// findJsonFiles()
//  JsonFile should be able to provide its own valid file extensions, so the only thing needed to provide to find is
//      what subFolders to look in
//      any glob describing the name
//   parameter variations
//   single string of glob pattern
//      Ex: **/package
//      Shouldn't need to specify suffix
//   array of globs
//      Ex: [**/package.yaml, !badFolder]
//      Allows for some negative matching
//   object of options:
//      name?: string or strings of glob matches on files that already match the extension
//      folder?: string or strings to narrow down what folders to search in
//      filter?: (jsonFile: JsonFile) => bool
//
//Would want to differentiate between find<X>File and find<X>Files? Probably not, since sub<X>File already convers the single file case nicely
//
//
//This does kind of ruin the whole "treeshaking" theory by importing ALL the specific fileTypes into this file

