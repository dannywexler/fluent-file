export class ParseError extends Error {
    constructor(path: string, cause: Error) {
        super(path, { cause });
        this.name = this.constructor.name;
    }
}

export class StringifyError extends Error {
    constructor(path: string, cause: Error) {
        super(path, { cause });
        this.name = this.constructor.name;
    }
}
