import type { ParseError, StringifyError } from "$/common/errors";
import type { Result } from "neverthrow";

export type Strings = Array<string>;
export type UnknownObject<Key extends string = string> = Record<Key, unknown>;

export type UnknownParser<
    SomeParseOptions,
    SomeParseError extends Error = ParseError,
> = (
    text: string,
    parseOptions?: SomeParseOptions,
) => Result<unknown, SomeParseError>;

export type UnknownStringifier<
    SomeStringifyOptions,
    SomeStringifyError extends Error = StringifyError,
> = (
    unknownContents: string,
    stringifyOptions?: SomeStringifyOptions,
) => Result<string, SomeStringifyError>;

export type Spacing = string | number | undefined;
