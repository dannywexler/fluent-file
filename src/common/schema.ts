import type { StandardSchemaV1 } from "@standard-schema/spec"

export interface StringSchema extends StandardSchemaV1<string> {
    type: "string"
    message: string
}

export function parseString(message: string = "Invalid type"): StringSchema {
    return {
        type: "string",
        message,
        "~standard": {
            version: 1,
            vendor: "StandardSchema",
            validate(value) {
                return typeof value === "string"
                    ? { value }
                    : { issues: [{ message }] }
            },
        },
    }
}
