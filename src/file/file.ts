import { constants, createReadStream, createWriteStream } from "node:fs"
import { chmod, copyFile, readFile, stat } from "node:fs/promises"
import { homedir } from "node:os"
import { inspect } from "node:util"

import type { StandardSchemaV1 } from "@standard-schema/spec"
import { fcmd } from "fluent-command"
import { appendFile } from "fs-extra"
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
import sharpLib, { type SharpOptions } from "sharp"
import sharpPhash from "sharp-phash"
import type { ParseOptions, StringifyOptions } from "zerde"
import { parseString, zparse, zstringify } from "zerde"

import type { FsFlag } from "$/common/node"
import type { FileOutputOptions, PathPieces } from "$/common/path"
import { normalizeAndResolvePath } from "$/common/path"
import {
    FileAppendError,
    FileChmodError,
    FileCopyError,
    FileImageConvertError,
    FileImageMetadataError,
    FileImagePhashError,
    FileImageResizeError,
    FileLinkError,
    FileMoveError,
    FileReadError,
    FileRemoveError,
    FileStatError,
    FileSymLinkError,
    FileWriteError,
} from "$/file/file.errors"
import type { ImageResizeOptions, ToAVIFOptions } from "$/file/image"
import { phashStringSchema } from "$/file/image"
import type { ExtractFrameOptions } from "$/file/video"
import { getVideoMetaData } from "$/file/video"
import { FluentFolder } from "$/folder/folder"
import { currentFolder } from "$/folder/xdg"

import type { DownloadFileOptions } from "./download"
import { downloadAFile } from "./download"

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

    #prepareTarget = async (
        options: FileOutputOptions & { newExt?: string },
    ) => {
        const {
            newFolder = this.folder(),
            newBaseName = this.#basename,
            newExt = this.#ext,
        } = options
        const targetFile = newFolder.file(`${newBaseName}.${newExt}`)
        await targetFile.remove()
        await newFolder.ensureExists()
        return targetFile
    }

    constructor(
        schema: StandardSchemaV1<Content, ParsedContent>,
        file: string | number,
        ...pathPieces: PathPieces
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

    toString = () => this.#path

    // biome-ignore lint/style/useNamingConvention: needs to be this case to print
    toJSON = () => ({ FluentFile: this.info });

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
        return new FluentFile<
            StandardSchemaV1.InferInput<NewSchema>,
            StandardSchemaV1.InferOutput<NewSchema>
        >(newSchema, this.#path)
    }

    get info() {
        return this.#info
    }

    relativePath = (relativeTo = currentFolder()) => {
        let relative = this.#path
        if (relative.startsWith(relativeTo.path)) {
            relative = relative.slice(relativeTo.path.length)
            if (relative.startsWith("/")) {
                return relative.slice(1)
            }
        }
        return relative
    }

    file = (file: string, ...extraPathPieces: PathPieces) => {
        return new FluentFile(
            this.#schema,
            this.#folderPath,
            file,
            ...extraPathPieces,
        )
    }

    folder = (...extraPathPieces: PathPieces) => {
        return new FluentFolder(this.#folderPath, ...extraPathPieces)
    }

    stats = ResultAsync.fromThrowable(
        async () => {
            const stats = await stat(this.#path)
            if (!stats.isFile()) {
                throw new FileStatError(this.#path, "FileWasNotFile")
            }
            return stats
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

    chmod = ResultAsync.fromThrowable(
        async (mode: string | number) => {
            await chmod(this.#path, mode)
        },
        (someError) => new FileChmodError(this.#path, someError),
    )

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

    read = (options: FileReadOptions = {}) =>
        this.readText(options).andThen((fileText) =>
            zparse(fileText, this.#schema, {
                format: this.#path,
                ...options,
            }),
        )

    createReadStream = (
        readStreamOptions?: Parameters<typeof createReadStream>[1],
    ) => createReadStream(this.#path, readStreamOptions)

    writeText = ResultAsync.fromThrowable(
        async (textContent: string, writeOptions: WriteFileOptions = {}) => {
            await outputFile(this.#path, textContent, writeOptions)
        },
        (someError) => new FileWriteError(this.#path, someError),
    )

    writeBuffer = ResultAsync.fromThrowable(
        async (bufferContent: Buffer, writeOptions: WriteFileOptions = {}) => {
            await outputFile(this.#path, bufferContent, writeOptions)
        },
        (someError) => new FileWriteError(this.#path, someError),
    )

    write = (content: Content, options: FileWriteOptions = {}) => {
        return zstringify(content, this.#schema, options).andThen(
            (textContent) => this.writeText(textContent, options),
        )
    }

    createWriteStream = (
        writeStreamOptions?: Parameters<typeof createWriteStream>[1],
    ) => createWriteStream(this.#path, writeStreamOptions)

    append = ResultAsync.fromThrowable(
        async (data: string | Buffer, writeOptions: WriteFileOptions = {}) => {
            await appendFile(this.#path, data, writeOptions)
        },
        (someError) => new FileAppendError(this.#path, someError),
    )

    image = (sharpOptions: SharpOptions = {}) => {
        const sharpInstance = sharpLib(this.#path, sharpOptions)

        const metadata = ResultAsync.fromThrowable(
            () => sharpInstance.metadata(),
            (someError) => new FileImageMetadataError(this.#path, someError),
        )

        const resize = ResultAsync.fromThrowable(
            async (resizeOptions: ImageResizeOptions) => {
                const targetFile = await this.#prepareTarget(resizeOptions)
                await sharpInstance
                    .resize(resizeOptions)
                    .toFile(targetFile.path())
                return targetFile
            },
            (someError) => new FileImageResizeError(this.#path, someError),
        )

        const toAVIF = ResultAsync.fromThrowable(
            async (toAVIFOptions: ToAVIFOptions = {}) => {
                const targetFile = await this.#prepareTarget({
                    ...toAVIFOptions,
                    newExt: "avif",
                })
                await sharpInstance
                    .resize(toAVIFOptions)
                    .avif(toAVIFOptions)
                    .toFile(targetFile.path())
                return targetFile
            },
            (someError) => new FileImageConvertError(this.#path, someError),
        )

        const phash = ResultAsync.fromThrowable(
            async () => {
                const phashResponse = await sharpPhash(this.#path, sharpOptions)
                return phashStringSchema.decode(phashResponse)
            },
            (someError) => new FileImagePhashError(this.#path, someError),
        )

        return {
            ...sharpInstance,
            metadata,
            resize,
            toAVIF,
            /**
             * Calculate the perceptual hash of an image
             * @returns A hex-encoded string
             * @see Use `comparePhashes` or `phashesMatch` to compare the returned phash
             */
            phash,
        }
    }

    video = () => ({
        metadata: () => getVideoMetaData(this.#path),
        extractFrame: async (extractFrameOptions: ExtractFrameOptions = {}) => {
            const {
                time = 1,
                unit = "s",
                ext = "png",
                ...rest
            } = extractFrameOptions
            const ss = unit === "s" ? time : `${time}${unit}`

            const targetFile = await this.#prepareTarget({
                newExt: ext,
                ...rest,
            })

            return fcmd("ffmpeg")
                .opt("hide_banner")
                .opt({
                    ss,
                    i: this.#path,
                    "frames:v": 1,
                    y: "",
                })
                .args(targetFile.path())
                .read()
                .map(() => targetFile)
        },
    })

    download = (url: string, downloadOptions: DownloadFileOptions = {}) =>
        downloadAFile(url, this, downloadOptions)
}

export type FileReadOptions = ParseOptions &
    Partial<{
        encoding: BufferEncoding
        flag: FsFlag
        signal: AbortSignal
    }>

export type FileWriteOptions = StringifyOptions &
    Partial<{
        encoding: BufferEncoding
        mode: number
        flag: FsFlag
        flush: boolean
        signal: AbortSignal
    }>

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
    file: PathPieces[number],
    ...extraPathPieces: PathPieces
) {
    return new FluentFile(parseString(), file, ...extraPathPieces)
}

export function homeFile(
    file: PathPieces[number],
    ...extraPathPieces: PathPieces
) {
    return ffile(homedir(), file, ...extraPathPieces)
}
