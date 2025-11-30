// File system flags
// https://nodejs.org/api/fs.html#file-system-flags
// Related to File open constants:
// https://nodejs.org/api/fs.html#file-open-constants
export const FsFlags = {
    // biome-ignore lint/style/useNamingConvention: this is an enum field
    Append: "a",
    // biome-ignore lint/style/useNamingConvention: this is an enum field
    AppendOrFail: "ax",
    // biome-ignore lint/style/useNamingConvention: this is an enum field
    AppendAndRead: "a+",
    // biome-ignore lint/style/useNamingConvention: this is an enum field
    AppendAndReadOrFail: "ax+",
    // biome-ignore lint/style/useNamingConvention: this is an enum field
    Read: "r",
    // biome-ignore lint/style/useNamingConvention: this is an enum field
    ReadAndWrite: "r+",
    // biome-ignore lint/style/useNamingConvention: this is an enum field
    Write: "w",
    // biome-ignore lint/style/useNamingConvention: this is an enum field
    WriteOrFailIfExists: "wx",
} as const

export type FsFlag = (typeof FsFlags)[keyof typeof FsFlags]
