export class FileError extends Error {
    readonly operation: string
    readonly path: string
    constructor(operation: string, path: string, cause?: unknown) {
        const message = `Error trying to ${operation} file: ${path}`
        super(message, { cause })
        this.path = path
        this.operation = operation
        this.name = this.constructor.name
    }
}
