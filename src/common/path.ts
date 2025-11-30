import pathe from "pathe"

export function normalizeAndResolvePath(...pathPieces: Array<string | number>) {
    const pieces = pathPieces.map((item) => {
        if (typeof item === "number") {
            return item.toString()
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
