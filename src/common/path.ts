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
