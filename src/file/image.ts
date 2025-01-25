import { type AnyGlob, globFiles } from "$/common/glob";
import type { Strings } from "$/common/types";
import { AnyFile } from "$/file/any";
import { type Folder, folder } from "$/folder/folder";
import sharpLib, { type Sharp, type AvifOptions } from "sharp";
import sharpPhash from "sharp-phash";

const MAX_DIFFERENCES = 6;
const AVIF_EXT = ".avif";

export const IMAGE_EXTENSIONS = [
    "avif",
    "gif",
    "jpeg",
    "jpg",
    "png",
    "svg",
    "tiff",
    "webp",
];

export type ToAvifOptions = {
    newFolder?: Folder;
    newName?: string;
    height?: number;
    width?: number;
} & Pick<AvifOptions, "effort" | "quality">;

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
        quality,
    }: ToAvifOptions = {}) => {
        const targetFolder = newFolder ? newFolder : this.getParentFolder();
        let targetName = newName ?? this.name;
        if (!targetName.endsWith(AVIF_EXT)) {
            targetName += AVIF_EXT;
        }
        const targetImageFile = imageFile(targetFolder, targetName);
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

export function findImageFiles(
    inFolder: Folder = folder(),
    anyGlob: AnyGlob = { extensions: IMAGE_EXTENSIONS },
) {
    return globFiles(imageFile, inFolder, anyGlob);
}

export function base2to36(base2: string) {
    return Number.parseInt(base2, 2).toString(36);
}

export function base36to2(base36: string) {
    return Number.parseInt(base36, 36).toString(2);
}

export function phashCheck(needle: string, haystack: Strings) {
    const hasExactMatch = haystack.includes(needle);
    if (hasExactMatch) {
        return { case: PhashSimilarity.Exact, phash: needle };
    }
    const needleBits = base36to2(needle);
    for (const hay of haystack) {
        const hayBits = base36to2(hay);
        let differences = 0;
        let i = needleBits.length;
        while (i-- && differences <= MAX_DIFFERENCES) {
            differences += Math.abs(
                needleBits.charCodeAt(i) - hayBits.charCodeAt(i),
            );
        }
        if (differences < MAX_DIFFERENCES) {
            // console.log('Only', differences, "differences between", needle, "and", hay)
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
