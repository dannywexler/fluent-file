import { assert, describe, expect, test } from "vitest"

import { expectResult } from "$/common/testing"
import { FluentFolder, folder } from "$/folder/folder"

import { homeFolder } from "./xdg"

describe("Construction variations", () => {
    test("cwd", () => {
        const dot = folder(".").info
        const emptyString = folder("").info
        const nothing = folder().info
        expect(dot).toEqual(emptyString)
        expect(emptyString).toEqual(nothing)
    })

    test("relative", () => {
        const f = folder("src").info
        const ds = folder("./src").info
        // console.log({ f, ds });
        expect(f).toEqual(ds)
    })
})

describe("parent - child - parent", () => {
    test("using ..", () => {
        const parent = folder("/tmp")
        const child = parent.folder("sub")
        const parent2 = child.folder("..")
        expect(parent.info).toEqual(parent2.info)
    })

    test("folder - file - folder", () => {
        const parentFolder = folder("src")
        const childFile = parentFolder.file("main.ts")
        const parentFolder2 = childFile.folder()
        expect(parentFolder.info).toEqual(parentFolder2.info)
        expect(childFile.info.folderPath).toEqual(parentFolder.path)
        expect(childFile.info.folderPath).toEqual(parentFolder2.path)
    })
})

describe("XDG Entries", () => {
    test("HOME", () => {
        const helper = homeFolder()
        const tilde = folder("~")
        const envVar = folder("$HOME")
        expect(helper.info).toEqual(tilde.info)
        expect(tilde.info).toEqual(envVar.info)
    })
})

describe("findFolders", () => {
    test("valid folder results", async () => {
        const parent = folder("src")
        const foundFolders = await expectResult(parent.findFolders())
        expect(foundFolders.length).toBeGreaterThan(0)
        for (const item of foundFolders) {
            assert(item instanceof FluentFolder)
        }
    })

    test("folder empty results", async () => {
        const parent = folder("src")
        const foundFolders = await expectResult(
            parent.findFolders({ glob: "zebra" }),
        )
        expect(foundFolders.length).toEqual(0)
    })
})

describe("findFiles", () => {
    const validExt = "ts"
    test("find with glob", async () => {
        const parent = folder("src")
        const foundFiles = await expectResult(
            parent.findFiles({ glob: `**/*.${validExt}` }),
        )
        expect(foundFiles.length).toBeGreaterThan(0)
        for (const item of foundFiles) {
            assert(item.ext() === validExt)
        }
    })

    test("find with exts", async () => {
        const parent = folder("src")
        const foundFiles = await expectResult(
            parent.findFiles({ exts: [validExt] }),
        )
        expect(foundFiles.length).toBeGreaterThan(0)
        for (const item of foundFiles) {
            assert(item.ext() === validExt)
        }
    })

    test("empty results", async () => {
        const parent = folder("src")
        const foundFiles = await expectResult(
            parent.findFiles({ glob: "zebra" }),
        )
        expect(foundFiles.length).toEqual(0)
    })
})
