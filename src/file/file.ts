import { constants } from "node:fs"
import { copyFile, readFile, stat } from "node:fs/promises"
import { homedir } from "node:os"

import type { StandardSchemaV1 } from "@standard-schema/spec"
import type { MoveOptions, WriteFileOptions } from "fs-extra/esm"
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
import { FileError } from "$/file/file.errors"
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
        ...pathPieces: Array<string | number>
    ) {
        this.#path = normalizeAndResolvePath(...pathPieces)
        this.#schema = schema
        const parsed = parseFilePath(this.#path)
        this.#folderPath = parsed.folderPath
        this.#name = parsed.name
        this.#basename = parsed.basename
        this.#ext = parsed.ext
        this.#info = parsed
    }

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
                throw new FileError("stat", this.#path, "FileWasNotFile")
            }
        },
        (someError) => {
            if (someError instanceof FileError) {
                return someError
            }
            return new FileError("stat", this.#path, someError)
        },
    )

    exists = async () => (await this.stats()).isOk()

    ensureExists = () => ensureFile(this.#path)

    copyTo = async (destination: FluentFile | FluentFolder) => {
        const destinationPath = await this.#ensureDestination(destination)
        await copyFile(this.#path, destinationPath, constants.COPYFILE_FICLONE)
    }

    moveTo = async (
        destination: FluentFile | FluentFolder,
        moveOptions?: MoveOptions,
    ) => {
        const destinationPath = await this.#ensureDestination(destination)
        await move(this.#path, destinationPath, {
            overwrite: true,
            ...moveOptions,
        })
    }

    linkTo = async (destination: FluentFile | FluentFolder) => {
        const destinationPath = await this.#ensureDestination(destination)
        await ensureLink(this.#path, destinationPath)
    }

    symlinkTo = async (destination: FluentFile | FluentFolder) => {
        const destinationPath = await this.#ensureDestination(destination)
        await ensureSymlink(this.#path, destinationPath)
    }

    remove = ResultAsync.fromThrowable(
        () => remove(this.#path),
        (someError) => new FileError("remove", this.#path, someError),
    )

    readText = ResultAsync.fromThrowable(
        async (options: FileReadOptions = {}) => {
            const fileText = await readFile(this.#path, {
                encoding: "utf8",
                ...options,
            })
            return fileText
        },
        (someError) => new FileError("read", this.#path, someError),
    )

    readBuffer = ResultAsync.fromThrowable(
        async (options: Pick<FileReadOptions, "flag" | "signal"> = {}) => {
            return readFile(this.#path, options)
        },
        (someError) => new FileError("read", this.#path, someError),
    )

    read = (options: FileReadOptions) =>
        this.readText(options).andThen((fileText) =>
            zparse(fileText, this.#schema, {
                ...options,
                // format: this.#path
            }),
        )

    writeText = ResultAsync.fromThrowable(
        async (textContent: string, writeOptions: WriteFileOptions) => {
            await outputFile(this.#path, textContent, writeOptions)
        },
        (someError) => new FileError("write", this.#path, someError),
    )

    writeBuffer = ResultAsync.fromThrowable(
        async (bufferContent: Buffer, writeOptions: WriteFileOptions) => {
            await outputFile(this.#path, bufferContent, writeOptions)
        },
        (someError) => new FileError("write", this.#path, someError),
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
    file: string,
    ...extraPathPieces: Array<string | number>
) {
    return new FluentFile(parseString(), file, ...extraPathPieces)
}

export function homeFile(...pathPieces: Array<string | number>) {
    return ffile(homedir(), ...pathPieces)
}
