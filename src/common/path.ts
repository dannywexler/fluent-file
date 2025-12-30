import { homedir, platform } from "node:os"

import pathe from "pathe"

import type { FluentFolder } from "$/folder/folder"

export type PathPieces = ReadonlyArray<string | number>

export function normalizeAndResolvePath(...pathPieces: PathPieces) {
    const pieces = pathPieces.map((item, index) => {
        if (typeof item === "number") {
            return item.toString()
        }
        // replace "~" with home folder but only if its the first piece
        if (index === 0 && item === "~") {
            return homedir()
        }
        // definitely not an env var since not all uppercase
        if (item.toUpperCase() !== item) {
            return item
        }
        let envKey = ""
        // might be a unix env var: $SOME_VAR
        if (item.startsWith("$")) {
            envKey = item.slice(1)
        }
        // might be a windows style env var %SOME_VAR%, but only check this on windows
        if (
            platform() === "win32" &&
            item.startsWith("%") &&
            item.endsWith("%")
        ) {
            envKey = item.slice(1, -1)
        }
        if (envKey !== "") {
            // biome-ignore lint/style/noProcessEnv: need to access Environment variable here
            const envMatch = process.env[envKey]
            if (!envMatch) {
                throw new Error(`Missing Environment variable ${item}`)
            }
            return envMatch
        }
        return item
    })
    return pathe.resolve(...pieces)
}

export function removeDotFromExtension(extension: string) {
    const lastDotIndex = extension.lastIndexOf(".")
    if (lastDotIndex < 0) {
        return extension
    }
    return extension.slice(lastDotIndex + 1)
}

export function getFilePathExtension(filePath: string) {
    return removeDotFromExtension(pathe.extname(filePath))
}

export type FileOutputOptions = {
    newFolder?: FluentFolder
    newBaseName?: string
}
