import type { Strings } from "$/common/types";
import { zodResult } from "$/common/zod";
import { AnyFile } from "$/file/any";
import { readFileText, writeFileText } from "$/file/text.utils";
import type { Folder } from "$/folder/folder";
import { fromThrowable } from "neverthrow";
import parseJson, { type JSONError as JsonParseError } from "parse-json";
import { configure } from "safe-stable-stringify";
import type { ZodTypeAny, z } from "zod";

const safeJsonParse = fromThrowable(
    (text: string, fileName: string) => parseJson(text, fileName),
    (parseErr) => parseErr as JsonParseError,
);

const configuredStringify = configure({
    circularValue: Error,
    strict: true,
});

const safeJsonStringify = fromThrowable(
    (unknownContents: unknown, space?: string | number) => {
        const results = configuredStringify(unknownContents, null, space);
        if (results === undefined) {
            throw new Error("Undefined returned from stringify!!!");
        }
        const trimmed = results.trim();
        if (trimmed.length === 0) {
            throw new Error("Empty string returned from stringify!!!");
        }
        return results;
    },
    (stringifyError) => stringifyError as Error,
);

export class JsonStringifyError extends Error {
    constructor(path: string, cause: Error) {
        super(path, { cause });
        this.name = this.constructor.name;
    }
}

export class JsonFile<FileSchema extends ZodTypeAny> extends AnyFile {
    #fileSchema: FileSchema;

    constructor(
        fileSchema: FileSchema,
        filePath: AnyFile | Folder | string,
        ...extraPathPieces: Strings
    ) {
        super(filePath, ...extraPathPieces);
        this.#fileSchema = fileSchema;
    }

    read() {
        return readFileText(this.path)
            .andThen((text) => safeJsonParse(text, this.fullName))
            .andThen((unknownContents) =>
                zodResult(this.#fileSchema, unknownContents),
            );
    }

    write(contents: z.infer<FileSchema>, space?: string | number) {
        return zodResult(this.#fileSchema, contents)
            .andThen((unknownContents) =>
                safeJsonStringify(unknownContents, space).mapErr(
                    (stringifyError) =>
                        new JsonStringifyError(this.path, stringifyError),
                ),
            )
            .asyncAndThen((stringifiedContents) =>
                writeFileText(this.path, stringifiedContents),
            );
    }
}

export function jsonFile<FileSchema extends ZodTypeAny>(
    fileSchema: FileSchema,
    filePath: AnyFile | Folder | string,
    ...extraPathPieces: Strings
) {
    return new JsonFile(fileSchema, filePath, ...extraPathPieces);
}
