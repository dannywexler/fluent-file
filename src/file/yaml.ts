import type { StringifyError } from "$/common/errors";
import type { Spacing, Strings } from "$/common/types";
import type { AnyFile } from "$/file/any";
import { JsonFile } from "$/file/json";
import type { Folder } from "$/folder/folder";
import { fromThrowable } from "neverthrow";
import {
    type CreateNodeOptions,
    type DocumentOptions,
    type ParseOptions,
    type SchemaOptions,
    type ToJSOptions,
    type ToStringOptions,
    type YAMLParseError,
    parse as parseYaml,
    stringify as stringifyYaml,
} from "yaml";

type YamlParseOptions = ParseOptions &
    DocumentOptions &
    SchemaOptions &
    ToJSOptions;
type YamlStringifyOptions =
    | (DocumentOptions & SchemaOptions & CreateNodeOptions & ToStringOptions)
    | Spacing;

import type { ZodTypeAny, z } from "zod";

const safeYamlParse = fromThrowable(
    (text: string, parseOptions?: YamlParseOptions) =>
        parseYaml(text, parseOptions),
    (parseErr) => parseErr as YAMLParseError,
);

const safeYamlStringify = fromThrowable(
    (unknownContents: unknown, stringifyOptions: YamlStringifyOptions = 2) => {
        if (typeof stringifyOptions === "string") {
            return stringifyYaml(unknownContents, {
                indent: Number.parseInt(stringifyOptions),
                sortMapEntries: true,
            });
        }
        if (typeof stringifyOptions === "number") {
            return stringifyYaml(unknownContents, {
                indent: stringifyOptions,
                sortMapEntries: true,
            });
        }
        return stringifyYaml(unknownContents, {
            sortMapEntries: true,
            ...stringifyOptions,
        });
    },
    (stringifyError) => stringifyError as StringifyError,
);

export class YamlFile<
    FileSchema extends ZodTypeAny,
> extends JsonFile<FileSchema> {
    override read = (parseOptions?: YamlParseOptions) =>
        this.readText()
            .andThen((text) => safeYamlParse(text, parseOptions))
            .andThen((unknownContents) =>
                this.validateUnknown(unknownContents),
            );

    override write = (
        contents: z.infer<FileSchema>,
        stringifyOptions?: YamlStringifyOptions,
    ) =>
        this.validateUnknown(contents)
            .andThen((unknownContents) =>
                safeYamlStringify(unknownContents, stringifyOptions),
            )
            .asyncAndThen(this.writeText);
}

export function yamlFile<FileSchema extends ZodTypeAny>(
    fileSchema: FileSchema,
    filePath: AnyFile | Folder | string,
    ...extraPathPieces: Strings
) {
    return new YamlFile(fileSchema, filePath, ...extraPathPieces);
}
