import { folder, homeFolder } from "$/folder/folder";
import { describe, expect, test } from "vitest";

describe("Folder", () => {
	describe("VALID", () => {
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
			console.log({ f, ds });
			expect(f).toEqual(ds);
		});
	});
});
