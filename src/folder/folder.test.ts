import { file } from "$/file/any";
import { folder, homeFolder } from "$/folder/folder";
import { describe, expect, test } from "vitest";

describe("Construction variations", () => {
	test("cwd", () => {
		const dot = folder(".").toString();
		const emptyString = folder("").toString();
		const undef = folder(undefined).toString();
		const nothing = folder().toString();
		expect(dot).toEqual(emptyString);
		expect(emptyString).toEqual(undef);
		expect(undef).toEqual(nothing);
	});

	test("home", () => {
		console.log(homeFolder().toString());
		expect(true).toBeTruthy();
	});

	test("root", () => {
		console.log(folder("/root").toString());
		expect(true).toBeTruthy();
	});

	test("slash", () => {
		console.log(folder("/").toString());
		expect(true).toBeTruthy();
	});

	test("relative", () => {
		const f = folder("src").toString();
		const ds = folder("./src").toString();
		// console.log({ f, ds });
		expect(f).toEqual(ds);
	});
});

describe("parent - child - parent", () => {
	test("subFolder with ..", () => {
		const parent = folder("/tmp");
		const child = parent.subFolder("sub");
		const parent2 = child.subFolder("..");
		console.log({
			parent: parent.toString(),
			child: child.toString(),
			parent2: parent2.toString(),
		});
		expect(child.parentPath).toEqual(parent.path);
		expect(child.parentName).toEqual(parent.name);
		expect(parent.path).toEqual(parent2.path);
	});

	test("file from folder", () => {
		const parentFolder = folder("src");
		const childFile = file(parentFolder, "main.ts");
		const parentFolder2 = childFile.parentFolder;
		console.log({
			parentFolder: parentFolder.toString(),
			childFile: childFile.toString(),
			parentFolder2: parentFolder2.toString(),
		});
		expect(childFile.parentName).toEqual(parentFolder.name);
		expect(childFile.parentPath).toEqual(parentFolder.path);
		expect(parentFolder.toString()).toEqual(parentFolder2.toString());
	});
});
