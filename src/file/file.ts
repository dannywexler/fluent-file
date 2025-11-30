import { constants } from "node:fs"
import { copyFile, readFile, stat } from "node:fs/promises"
import { homedir } from "node:os"
import { inspect } from "node:util"

import type { StandardSchemaV1 } from "@standard-schema/spec"
import type { WriteFileOptions } from "fs-extra/esm"
import {
    ensureFile,
    ensureLink,
    ensureSymlink,
    move,
    outputFile,
    remove,
} from "fs-extra/esm"
import { ResultAsync } from "neverthrow"
import pathe from "pathe"
import type { ParseOptions, StringifyOptions } from "zerde"
import { zparse, zstringify } from "zerde"

import type { FsFlag } from "$/common/node"
import { normalizeAndResolvePath } from "$/common/path"
import { parseString } from "$/common/schema"
import {
    FileCopyError,
    FileLinkError,
    FileMoveError,
    FileReadError,
    FileRemoveError,
    FileStatError,
    FileSymLinkError,
    FileWriteError,
} from "$/file/file.errors"
import { FluentFolder } from "$/folder/folder"

export class FluentFile<Content = string, ParsedContent = Content> {
    #path: string
    #folderPath: string
    #name: string
    #basename: string
    #ext: string
    #schema: StandardSchemaV1<Content, ParsedContent>
    #info: {
        absolutePath: string
        folderPath: string
        name: string
        basename: string
        ext: string
    }

    #ensureDestination = async (destination: FluentFile | FluentFolder) => {
        const targetFile =
            destination instanceof FluentFile
                ? destination
                : destination.file(this.#name)
        await targetFile.folder().ensureExists()
        await targetFile.remove()
        return targetFile.path()
    }

    constructor(
        schema: StandardSchemaV1<Content, ParsedContent>,
        file: string | number,
        ...pathPieces: Array<string | number>
    ) {
        this.#path = normalizeAndResolvePath(file, ...pathPieces)
        this.#schema = schema
        const parsed = parseFilePath(this.#path)
        this.#folderPath = parsed.folderPath
        this.#name = parsed.name
        this.#basename = parsed.basename
        this.#ext = parsed.ext
        this.#info = parsed
    }

    toString = () => this.path

    // biome-ignore lint/style/useNamingConvention: needs to be this case to print
    toJSON = () => ({ Folder: this.info });

    [inspect.custom] = () => this.toJSON()

    path = () => this.#path

    folderPath = () => this.#folderPath

    name(): string
    name(newName: string): this
    name(newName?: string) {
        if (newName === undefined) {
            return this.#name
        }
        this.#name = newName
        this.#path = `${this.#folderPath}/${newName}`
        return this
    }

    basename(): string
    basename(newBaseName: string): this
    basename(newBaseName?: string) {
        if (newBaseName === undefined) {
            return this.#basename
        }
        this.#basename = newBaseName
        this.#name = newBaseName + this.#ext
        this.#path = `${this.#folderPath}/${this.#name}`
        return this
    }

    ext(): string
    ext(newExtension: string): this
    ext(newExtension?: string) {
        if (newExtension === undefined) {
            return this.#ext
        }
        this.#ext = newExtension
        this.#name = this.#basename + newExtension
        this.#path = `${this.#folderPath}/${this.#name}`
        return this
    }

    schema = <NewSchema extends StandardSchemaV1>(newSchema: NewSchema) => {
        return new FluentFile(newSchema, this.#path)
    }

    get info() {
        return this.#info
    }

    file = (file: string, ...extraPathPieces: Array<string | number>) => {
        return new FluentFile(
            this.#schema,
            this.#folderPath,
            file,
            ...extraPathPieces,
        )
    }

    folder = (...extraPathPieces: Array<string | number>) => {
        return new FluentFolder(this.#folderPath, ...extraPathPieces)
    }

    stats = ResultAsync.fromThrowable(
        async () => {
            const stats = await stat(this.#path)
            if (stats.isFile()) {
                return stats
            } else {
                throw new FileStatError(this.#path, "FileWasNotFile")
            }
        },
        (someError) => {
            if (someError instanceof FileStatError) {
                return someError
            }
            return new FileStatError(this.#path, someError)
        },
    )

    exists = async () => (await this.stats()).isOk()

    ensureExists = () => ensureFile(this.#path)

    copyTo = ResultAsync.fromThrowable(
        async (destination: FluentFile | FluentFolder) => {
            let destinationPath: string | null = null
            try {
                destinationPath = await this.#ensureDestination(destination)
                await copyFile(
                    this.#path,
                    destinationPath,
                    constants.COPYFILE_FICLONE,
                )
            } catch (someError) {
                throw new FileCopyError(this.#path, destinationPath, someError)
            }
        },
        (someError) => someError as FileCopyError,
    )

    moveTo = ResultAsync.fromThrowable(
        async (
            destination: FluentFile | FluentFolder,
            dereferenceSymlinks?: boolean,
        ) => {
            let destinationPath: string | null = null
            try {
                destinationPath = await this.#ensureDestination(destination)
                await move(this.#path, destinationPath, {
                    overwrite: true,
                    dereference: dereferenceSymlinks,
                })
            } catch (someError) {
                throw new FileMoveError(this.#path, destinationPath, someError)
            }
        },
        (someError) => someError as FileMoveError,
    )

    linkTo = ResultAsync.fromThrowable(
        async (destination: FluentFile | FluentFolder) => {
            let destinationPath: string | null = null
            try {
                destinationPath = await this.#ensureDestination(destination)
                await ensureLink(this.#path, destinationPath)
            } catch (someError) {
                throw new FileLinkError(this.#path, destinationPath, someError)
            }
        },
        (someError) => someError as FileLinkError,
    )

    symlinkTo = ResultAsync.fromThrowable(
        async (destination: FluentFile | FluentFolder) => {
            let destinationPath: string | null = null
            try {
                destinationPath = await this.#ensureDestination(destination)
                await ensureSymlink(this.#path, destinationPath)
            } catch (someError) {
                throw new FileSymLinkError(
                    this.#path,
                    destinationPath,
                    someError,
                )
            }
        },
        (someError) => someError as FileSymLinkError,
    )

    remove = ResultAsync.fromThrowable(
        () => remove(this.#path),
        (someError) => new FileRemoveError(this.#path, someError),
    )

    readText = ResultAsync.fromThrowable(
        async (options: FileReadOptions = {}) => {
            const fileText = await readFile(this.#path, {
                encoding: "utf8",
                ...options,
            })
            return fileText
        },
        (someError) => new FileReadError(this.#path, someError),
    )

    readBuffer = ResultAsync.fromThrowable(
        async (options: Pick<FileReadOptions, "flag" | "signal"> = {}) => {
            return readFile(this.#path, options)
        },
        (someError) => new FileReadError(this.#path, someError),
    )

    read = (options: FileReadOptions) =>
        this.readText(options).andThen((fileText) =>
            zparse(fileText, this.#schema, {
                format: this.#path,
                ...options,
            }),
        )

    writeText = ResultAsync.fromThrowable(
        async (textContent: string, writeOptions: WriteFileOptions) => {
            await outputFile(this.#path, textContent, writeOptions)
        },
        (someError) => new FileWriteError(this.#path, someError),
    )

    writeBuffer = ResultAsync.fromThrowable(
        async (bufferContent: Buffer, writeOptions: WriteFileOptions) => {
            await outputFile(this.#path, bufferContent, writeOptions)
        },
        (someError) => new FileWriteError(this.#path, someError),
    )

    write = (
        content: Content,
        options: WriteFileOptions & StringifyOptions,
    ) => {
        return zstringify(content, this.#schema, options).map(
            async (textContent) => {
                await this.writeText(textContent, options)
            },
        )
    }
}

export type FileReadOptions = Partial<
    {
        encoding: BufferEncoding
        flag: FsFlag
        signal: AbortSignal
    } & ParseOptions
>

function parseFilePath(absolutePath: string) {
    const name = pathe.basename(absolutePath)
    const folderPath = pathe.dirname(absolutePath)
    let basename = ""
    let ext = ""
    const lastDotIndex = name.lastIndexOf(".")
    if (lastDotIndex <= 0) {
        basename = name
        ext = ""
    } else {
        basename = name.slice(0, lastDotIndex)
        ext = name.slice(lastDotIndex + 1)
    }

    return { absolutePath, folderPath, name, basename, ext }
}

export function ffile(
    file: string | number,
    ...extraPathPieces: Array<string | number>
) {
    return new FluentFile(parseString(), file, ...extraPathPieces)
}

export function homeFile(
    file: string | number,
    ...extraPathPieces: Array<string | number>
) {
    return ffile(homedir(), file, ...extraPathPieces)
}
