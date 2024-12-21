// This is a basic version of SystemError
// https://nodejs.org/api/errors.html#class-systemerror
export class NodeError extends Error {
    readonly code!: string;
    readonly dest: string | undefined;
    readonly info: Record<string, unknown> | undefined;
    readonly path: string | undefined;
}

// Common system errors
// https://nodejs.org/api/errors.html#common-system-errors
export enum NodeErrorCode {
    // biome-ignore lint/style/useNamingConvention: Node Error code
    EACCES = "EACCES",
    // biome-ignore lint/style/useNamingConvention: Node Error code
    EISDIR = "EISDIR",
    // biome-ignore lint/style/useNamingConvention: Node Error code
    ENOENT = "ENOENT",
    // biome-ignore lint/style/useNamingConvention: Node Error code
    ENOTDIR = "ENOTDIR",
    // biome-ignore lint/style/useNamingConvention: Node Error code
    EPERM = "EPERM",
}

export function assertIsNodeError(
    maybeNodeError: unknown,
): asserts maybeNodeError is NodeError {
    if (
        maybeNodeError instanceof Error &&
        "code" in maybeNodeError &&
        typeof maybeNodeError.code === "string"
    ) {
        return;
    }
    throw new Error("was not a Node error");
}
