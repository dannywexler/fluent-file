import type { ParseError, StringifyError } from "$/common/errors";
import type { Strings } from "$/common/types";
import type { AnyFile } from "$/file/any";
import { JsonFile } from "$/file/json";
import type { Folder } from "$/folder/folder";
import { fromThrowable } from "neverthrow";
import { parse as parseYaml, stringify as stringifyYaml } from "yaml";
import type { ZodTypeAny } from "zod";

const safeYamlParse = fromThrowable(
    (text: string) => parseYaml(text),
    (parseErr) => parseErr as ParseError,
);

const safeYamlStringify = fromThrowable(
    (unknownContents: unknown) =>
        stringifyYaml(unknownContents, { sortMapEntries: true }),
    (stringifyError) => stringifyError as StringifyError,
);

export class YamlFile<
    FileSchema extends ZodTypeAny,
> extends JsonFile<FileSchema> {
    protected override readonly unknownParser = safeYamlParse;

    protected override readonly unknownStringifier = safeYamlStringify;
}

export function yamlFile<FileSchema extends ZodTypeAny>(
    fileSchema: FileSchema,
    filePath: AnyFile | Folder | string,
    ...extraPathPieces: Strings
) {
    return new YamlFile(fileSchema, filePath, ...extraPathPieces);
}
