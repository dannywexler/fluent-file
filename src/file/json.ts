import { fromThrowable } from "neverthrow"
import parseJson, { type JSONError as JsonParseError } from "parse-json"
import { configure } from "safe-stable-stringify"
import type { ZodTypeAny, z } from "zod"

import type { AnyGlob } from "$/common/glob"
import { globFiles } from "$/common/glob"
import type { Spacing, Strings } from "$/common/types"
import { zodResult } from "$/common/zod"
import { AFile } from "$/file/any"
import type { Folder } from "$/folder/folder"
import { folder } from "$/folder/folder"

const safeJsonParse = fromThrowable(
    (text: string) => parseJson(text),
    (parseErr) => parseErr as JsonParseError,
)

const configuredStringify = configure({
    circularValue: Error,
    strict: true,
})

const safeJsonStringify = fromThrowable(
    (unknownContents: unknown, options: Spacing) => {
        const results = configuredStringify(unknownContents, null, options)
        if (results === undefined) {
            throw new Error("Undefined returned from stringify!!!")
        }
        const trimmed = results.trim()
        if (trimmed.length === 0) {
            throw new Error("Empty string returned from stringify!!!")
        }
        return results
    },
    (stringifyError) => stringifyError as Error,
)

export class JsonFile<FileSchema extends ZodTypeAny> extends AFile {
    protected readonly fileSchema: FileSchema

    constructor(
        fileSchema: FileSchema,
        filePath: AFile | Folder | string,
        ...extraPathPieces: Strings
    ) {
        super(filePath, ...extraPathPieces)
        this.fileSchema = fileSchema
    }

    protected validateUnknown = (unknownContents: unknown) =>
        zodResult(this.fileSchema, unknownContents)

    read = () =>
        this.readText().andThen(safeJsonParse).andThen(this.validateUnknown)

    write = (contents: z.infer<FileSchema>, spacing: Spacing = 2) =>
        this.validateUnknown(contents)
            .andThen((unknownContents) =>
                safeJsonStringify(unknownContents, spacing),
            )
            .asyncAndThen(this.writeText)
}

export function jsonFile<FileSchema extends ZodTypeAny>(
    fileSchema: FileSchema,
    filePath: AFile | Folder | string,
    ...extraPathPieces: Strings
) {
    return new JsonFile(fileSchema, filePath, ...extraPathPieces)
}

export function findJsonFiles<FileSchema extends ZodTypeAny>(
    fileSchema: FileSchema,
    inFolder: Folder = folder(),
    anyGlob: AnyGlob = "*.json",
) {
    return globFiles(
        (filePath) => jsonFile(fileSchema, filePath),
        inFolder,
        anyGlob,
    )
}
