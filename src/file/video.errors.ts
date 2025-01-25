export class VideoMetaDataError extends Error {
    constructor(path: string, cause: Error) {
        super(path, { cause });
        this.name = this.constructor.name;
    }
}

export class VideoThumbNailError extends Error {
    constructor(path: string, cause: Error) {
        super(path, { cause });
        this.name = this.constructor.name;
    }
}
