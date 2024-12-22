import type {
    Spacing,
    Strings,
    UnknownParser,
    UnknownStringifier,
} from "$/common/types";
import { zodResult } from "$/common/zod";
import { AnyFile } from "$/file/any";
import { readFileText, writeFileText } from "$/file/text.utils";
import type { Folder } from "$/folder/folder";
import { fromThrowable } from "neverthrow";
import parseJson, { type JSONError as JsonParseError } from "parse-json";
import { configure } from "safe-stable-stringify";
import type { ZodTypeAny, z } from "zod";

const safeJsonParse = fromThrowable(
    (text: string) => parseJson(text),
    (parseErr) => parseErr as JsonParseError,
) satisfies UnknownParser<JsonParseError>;

const configuredStringify = configure({
    circularValue: Error,
    strict: true,
});

const safeJsonStringify = fromThrowable(
    (unknownContents: unknown, space: Spacing) => {
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
) satisfies UnknownStringifier;

export class JsonFile<FileSchema extends ZodTypeAny> extends AnyFile {
    protected readonly fileSchema: FileSchema;
    protected readonly unknownParser: UnknownParser = safeJsonParse;
    protected readonly unknownStringifier: UnknownStringifier =
        safeJsonStringify;

    constructor(
        fileSchema: FileSchema,
        filePath: AnyFile | Folder | string,
        ...extraPathPieces: Strings
    ) {
        super(filePath, ...extraPathPieces);
        this.fileSchema = fileSchema;
    }

    read() {
        return readFileText(this.path)
            .andThen(this.unknownParser)
            .andThen((unknownContents) =>
                zodResult(this.fileSchema, unknownContents),
            );
    }

    write(contents: z.infer<FileSchema>, spacing?: string | number) {
        return zodResult(this.fileSchema, contents)
            .andThen((unknownContents) =>
                this.unknownStringifier(unknownContents, spacing ?? 2),
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
