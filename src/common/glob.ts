export type FindFoldersGlobOptions = {
    recursive?: boolean
    glob?: string
}

export type FindFilesGlobOptions = FindFoldersGlobOptions & {
    exts?: Array<string>
}
