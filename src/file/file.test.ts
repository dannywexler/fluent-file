import { describe, expect, test } from "vitest"

import { ffile } from "$/file/file"

describe("Construction variations", () => {
    test.each([
        ["/tmp/hello.txt", [], "/tmp", "hello", "txt"],
        ["/tmp", ["hello.txt"], "/tmp", "hello", "txt"],
        ["/tmp", [".zshrc"], "/tmp", ".zshrc", ""],
    ])(
        "basic",
        (firstPathPiece, extraPathPieces, folderPath, basename, ext) => {
            let name = basename
            if (ext) {
                name += `.${ext}`
            }
            const absolutePath = [folderPath, name].join("/")
            expect(ffile(firstPathPiece, ...extraPathPieces).info).toEqual({
                absolutePath,
                folderPath,
                ext,
                basename,
                name,
            })
        },
    )
})
