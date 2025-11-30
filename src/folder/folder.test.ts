// import { describe, expect, test } from "vitest"
//
// import { afile } from "$/file/any"
// import { folder, homeFolder } from "$/folder/folder"
//
// describe("Construction variations", () => {
//     test("cwd", () => {
//         const dot = folder(".").info
//         const emptyString = folder("").info
//         const undef = folder(undefined).info
//         const nothing = folder().info
//         expect(dot).toEqual(emptyString)
//         expect(emptyString).toEqual(undef)
//         expect(undef).toEqual(nothing)
//     })
//
//     test("home", () => {
//         console.log(homeFolder().info)
//         expect(true).toBeTruthy()
//     })
//
//     test("root", () => {
//         console.log(folder("/root").info)
//         expect(true).toBeTruthy()
//     })
//
//     test("slash", () => {
//         console.log(folder("/").info)
//         expect(true).toBeTruthy()
//     })
//
//     test("relative", () => {
//         const f = folder("src").info
//         const ds = folder("./src").info
//         // console.log({ f, ds });
//         expect(f).toEqual(ds)
//     })
// })
//
// describe("parent - child - parent", () => {
//     test("subFolder with ..", () => {
//         const parent = folder("/tmp")
//         const child = parent.subFolder("sub")
//         const parent2 = child.subFolder("..")
//         console.log({
//             parent: parent.info,
//             child: child.info,
//             parent2: parent2.info,
//         })
//         expect(child.parentPath).toEqual(parent.path)
//         expect(child.parentName).toEqual(parent.name)
//         expect(parent.path).toEqual(parent2.path)
//     })
//
//     test("file from folder", () => {
//         const parentFolder = folder("src")
//         const childFile = afile(parentFolder, "main.ts")
//         const parentFolder2 = childFile.getParentFolder()
//         console.log({
//             parentFolder: parentFolder.info,
//             childFile: childFile.info,
//             parentFolder2: parentFolder2.info,
//         })
//         expect(childFile.parentName).toEqual(parentFolder.name)
//         expect(childFile.parentPath).toEqual(parentFolder.path)
//         expect(parentFolder.info).toEqual(parentFolder2.info)
//     })
// })
