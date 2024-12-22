import { getFolderStats } from "$/common/stats";
import type { Strings } from "$/common/types";
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

async function globFactory(
    folder: string,
    overrides: GlobbyOptions,
    anyGlob: AnyGlob,
) {
    let opts: GlobbyOptions = {
        cwd: folder,
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
    return (await globby(mainGlob, opts)).sort();
}

export function globFiles(
    folder: string,
    anyGlob: AnyGlob = STAR_STAR,
    deep = Number.POSITIVE_INFINITY,
) {
    return getFolderStats(folder).map(() =>
        globFactory(folder, { deep }, anyGlob),
    );
}

export function globFolders(
    cwd: string,
    anyGlob: AnyGlob = STAR_STAR,
    deep = Number.POSITIVE_INFINITY,
) {
    return getFolderStats(cwd).map(() =>
        globFactory(cwd, { onlyDirectories: true, deep }, anyGlob),
    );
}
