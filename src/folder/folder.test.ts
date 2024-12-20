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

	test("join", () => {
		const parent = folder("/tmp");
		const child = parent.join("sub");
		const parent2 = child.join("..");
		console.log({
			parent: parent.toString(),
			child: child.toString(),
			parent2: parent2.toString(),
		});
		expect(child.parentPath).toEqual(parent.path);
		expect(child.parentName).toEqual(parent.name);
		expect(parent.path).toEqual(parent2.path);
	});
});
