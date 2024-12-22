import type { Strings } from "$/common/types";
import { zodResult } from "$/common/zod";
import { AnyFile } from "$/file/any";
import { readFileText, writeFileText } from "$/file/text.utils";
import type { Folder } from "$/folder/folder";
import type { ZodTypeAny, z } from "zod";

export class JsonFile<FileSchema extends ZodTypeAny> extends AnyFile {
    readonly fileSchema: FileSchema;
    protected parseUnknown: (text: string) => unknown = JSON.parse;
    protected stringifyUnknown: (unknownContent: unknown) => string;

    constructor(
        fileSchema: FileSchema,
        filePath: AnyFile | Folder | string,
        ...extraPathPieces: Strings
    ) {
        super(filePath, ...extraPathPieces);
        this.fileSchema = fileSchema;
        this.stringifyUnknown = JSON.stringify;
    }

    read() {
        return readFileText(this.path).andThen((text) =>
            zodResult(this.fileSchema, this.parseUnknown(text)),
        );
    }

    write(contents: z.infer<FileSchema>) {
        return zodResult(this.fileSchema, contents)
            .map(this.stringifyUnknown)
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
