import type { ParseError, StringifyError } from "$/common/errors";
import type { Result } from "neverthrow";

export type Strings = Array<string>;
export type UnknownObject<Key extends string = string> = Record<Key, unknown>;

export type UnknownParser<SomeParseError extends Error = ParseError> = (
    text: string,
) => Result<unknown, SomeParseError>;

export type UnknownStringifier<
    SomeStringifyError extends Error = StringifyError,
> = (
    unknownContents: string,
    spacing: Spacing,
) => Result<string, SomeStringifyError>;

export type Spacing = string | number | undefined;
