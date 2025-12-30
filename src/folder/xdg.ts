import { homedir, platform, tmpdir } from "node:os"

import type { PathPieces } from "$/common/path"

import { folder } from "./folder"

const XDG_PATH_MAP = {
    // biome-ignore lint/style/useNamingConvention: is piece of Environment variable in all caps
    CACHE: {
        darwin: ["~", "Library", "Caches"],
        linux: ["~", ".cache"],
        win32: ["$LOCALAPPDATA"],
    },
    // biome-ignore lint/style/useNamingConvention: is piece of Environment variable in all caps
    CONFIG: {
        darwin: ["~", "Library", "Preferences"],
        linux: ["~", ".config"],
        win32: ["$APPDATA"],
    },
    // biome-ignore lint/style/useNamingConvention: is piece of Environment variable in all caps
    DATA: {
        darwin: ["~", "Library", "Application Support"],
        linux: ["~", ".local", "share"],
        win32: ["$LOCALAPPDATA"],
    },
    // biome-ignore lint/style/useNamingConvention: is piece of Environment variable in all caps
    STATE: {
        darwin: ["~", "Library", "Logs"],
        linux: ["~", ".local", "state"],
        win32: ["$LOCALAPPDATA"],
    },
} as const

function getXDGPrefix(xdgEntry: keyof typeof XDG_PATH_MAP) {
    const pform = platform()
    if (pform === "win32" || pform === "darwin") {
        return XDG_PATH_MAP[xdgEntry][pform]
    }
    // biome-ignore lint/style/noProcessEnv: need to access Environment variable here
    const xdgMatch = process.env[`XDG_${xdgEntry}_HOME`]
    return xdgMatch ? [xdgMatch] : XDG_PATH_MAP[xdgEntry].linux
}

export function cacheFolder(...pathPieces: PathPieces) {
    return folder(...getXDGPrefix("CACHE"), ...pathPieces)
}

export function configFolder(...pathPieces: PathPieces) {
    return folder(...getXDGPrefix("CONFIG"), ...pathPieces)
}

export function dataFolder(...pathPieces: PathPieces) {
    return folder(...getXDGPrefix("DATA"), ...pathPieces)
}

export function logsFolder(...pathPieces: PathPieces) {
    return folder(...getXDGPrefix("STATE"), ...pathPieces)
}

export function homeFolder(...pathPieces: PathPieces) {
    return folder(homedir(), ...pathPieces)
}

export function tempFolder(...pathPieces: PathPieces) {
    return folder(tmpdir(), ...pathPieces)
}

export function currentFolder() {
    return folder(process.cwd())
}
