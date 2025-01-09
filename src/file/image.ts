import type { Stats } from "node:fs";
import type { Strings } from "$/common/types";
import { AnyFile } from "$/file/any";
import type { Folder } from "$/folder/folder";
import sharpLib, { type Sharp, type AvifOptions } from "sharp";
import sharpPhash from "sharp-phash";

const MAX_DIFFERENCES = 6;

export type ToAvifOptions = {
    newFolder?: Folder;
    newName?: string;
    height?: number;
    width?: number;
} & Pick<AvifOptions, "effort" | "quality">;

export type ImageFileStats = Stats & {
    height: number;
    width: number;
};

export class ImageFile extends AnyFile {
    readonly sharp: Sharp;

    constructor(file: AnyFile | Folder | string, ...extraPathPieces: Strings) {
        super(file, ...extraPathPieces);
        this.sharp = sharpLib(this.path);
    }

    convertToAvif = async ({
        newFolder,
        newName,
        height,
        width,
        effort = 9,
        quality = 90,
    }: ToAvifOptions = {}) => {
        const targetFolder = newFolder ? newFolder : this.getParentFolder();
        const targetFileName = `${newName ?? this.name}.avif`;
        const targetImageFile = imageFile(targetFolder, targetFileName);
        const exists = await targetImageFile.exists();
        if (exists) {
            return targetImageFile;
        }
        await targetImageFile.getParentFolder().ensureExists();
        await this.sharp
            .resize({
                fit: "contain",
                height,
                width,
                withoutEnlargement: true,
            })
            .avif({ effort, quality })
            .toFile(targetImageFile.path);

        return targetImageFile;
    };

    getPhash = async () => {
        const base2Res = await sharpPhash(this.path);
        return base2to36(base2Res);
    };
}

export function imageFile(
    file: AnyFile | Folder | string,
    ...extraPathPieces: Strings
) {
    return new ImageFile(file, ...extraPathPieces);
}

export function base2to36(base2: string) {
    return Number.parseInt(base2, 2).toString(36);
}

export function base36to2(base36: string) {
    return Number.parseInt(base36, 36).toString(2);
}

export function phashCheck(needle: string, haystack: Strings) {
    const needleBits = base36to2(needle);
    for (const hay of haystack) {
        if (needle === hay) {
            return { case: PhashSimilarity.Exact, phash: needle };
        }
        const hayBits = base36to2(hay);
        let differences = 0;
        for (
            let i = 0;
            i < needleBits.length && differences <= MAX_DIFFERENCES;
            i++
        ) {
            differences += Math.abs(
                needleBits.charCodeAt(i) - hayBits.charCodeAt(i),
            );
        }
        if (differences < MAX_DIFFERENCES) {
            // console.log('Only', differences, "between", needle, "and", hay)
            return { case: PhashSimilarity.Similar, phash: hay };
        }
    }

    return { case: PhashSimilarity.Unique, phash: needle };
}

export enum PhashSimilarity {
    Exact = "Exact",
    Similar = "Similar",
    Unique = "Unique",
}

export type PhashSimilarityResult = { case: PhashSimilarity; phash: string };
