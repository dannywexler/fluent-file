import { getFolderStats } from "$/common/stats";
import type { FilePathToClass, Strings } from "$/common/types";
import { type Folder, folder } from "$/folder/folder";
import { type Options as GlobbyOptions, globby } from "globby";

export type AnyGlob = string | Strings | GlobOptions;
export type GlobOptions = Omit<GlobbyOptions, "cwd"> &
    Partial<{
        patterns: Strings;
        extensions: Strings;
    }>;
const STAR_STAR = "**";

const staticGlobbyOptions: GlobbyOptions = {
    absolute: true,
    gitignore: true,
};

async function globFactory<T>(
    filePathToClass: FilePathToClass<T>,
    folder: Folder,
    overrides: GlobbyOptions,
    anyGlob: AnyGlob,
) {
    let opts: GlobbyOptions = {
        cwd: folder.path,
        ...staticGlobbyOptions,
        ...overrides,
    };
    let mainGlob: string | Strings = STAR_STAR;
    if (typeof anyGlob === "string" || Array.isArray(anyGlob)) {
        mainGlob = anyGlob;
    } else {
        const { patterns, extensions, expandDirectories, ...userOpts } =
            anyGlob;
        if (patterns) {
            mainGlob = patterns;
        }
        opts = {
            expandDirectories: extensions ? { extensions } : true,
            ...userOpts,
            ...opts,
        };
    }
    return (await globby(mainGlob, opts)).sort().map(filePathToClass);
}

export function globFiles<T>(
    filePathToClass: FilePathToClass<T>,
    folder: Folder,
    anyGlob: AnyGlob = STAR_STAR,
    deep = Number.POSITIVE_INFINITY,
) {
    return getFolderStats(folder).map(() =>
        globFactory(filePathToClass, folder, { deep }, anyGlob),
    );
}

export function globFolders(
    cwd: Folder,
    anyGlob: AnyGlob = STAR_STAR,
    deep = Number.POSITIVE_INFINITY,
) {
    return getFolderStats(cwd).map(() =>
        globFactory(folder, cwd, { onlyDirectories: true, deep }, anyGlob),
    );
}
