// import { describe, expect, test } from "vitest"
//
// import { afile } from "$/file/any"
//
// describe("Construction variations", () => {
//     test.each([
//         ["/tmp/hello.txt", [], "tmp", "hello", "txt"],
//         ["/tmp", ["hello.txt"], "tmp", "hello", "txt"],
//         ["/tmp", [".zshrc"], "tmp", ".zshrc", ""],
//     ])("basic", (firstPathPiece, extraPathPieces, parentName, name, ext) => {
//         let fullName = name
//         if (ext) {
//             fullName += `.${ext}`
//         }
//         const path = ["", parentName, fullName].join("/")
//         expect(afile(firstPathPiece, ...extraPathPieces).info).toEqual({
//             ext,
//             fullName,
//             name,
//             path,
//             parentName,
//             parentPath: `/${parentName}`,
//         })
//     })
// })
