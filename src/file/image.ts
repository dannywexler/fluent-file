import type { Stats } from "node:fs";
import type { Strings } from "$/common/types";
import { AnyFile } from "$/file/any";
import type { Folder } from "$/folder/folder";
import sharpLib, { type Sharp, type AvifOptions } from "sharp";

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

    convertToAvif = ({
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
        return targetImageFile.exists().map(async (exists) => {
            if (exists) {
                return targetImageFile;
            }
            await targetImageFile.getParentFolder().ensureExists();
            await sharpLib(this.path)
                .resize({
                    fit: "contain",
                    height,
                    width,
                    withoutEnlargement: true,
                })
                .avif({ effort, quality })
                .toFile(targetImageFile.path);

            return targetImageFile;
        });
    };
}

export function imageFile(
    file: AnyFile | Folder | string,
    ...extraPathPieces: Strings
) {
    return new ImageFile(file, ...extraPathPieces);
}
