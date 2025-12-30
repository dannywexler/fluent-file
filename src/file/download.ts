import { pipeline } from "node:stream/promises"
import type { ReadableStream } from "node:stream/web"

import { ResultAsync } from "neverthrow"
import type { Prettify } from "zerde"

import { posIntSchema } from "$/common/schema"
import type { FluentFile } from "$/file/file"

import { FileDownloadError } from "./file.errors"

export type DownloadProgress = {
    totalBytes: number
    downloadedBytes: number
}

export type DownloadFileOptions = Prettify<
    Partial<{
        overwrite: boolean
        progressThrottle: number
        onProgress: (progressStats: DownloadProgress) => void
    }>
>

export const downloadAFile = ResultAsync.fromThrowable(
    async (
        url: string,
        destinationFile: FluentFile,
        downloadOptions: DownloadFileOptions = {},
    ) => {
        try {
            const {
                overwrite = false,
                progressThrottle = 100,
                onProgress,
            } = downloadOptions

            if (!overwrite && (await destinationFile.exists())) {
                return "ALREADY_EXISTS"
            }

            await destinationFile.folder().ensureExists()
            const response = await fetch(url)
            if (!response.ok) {
                const { status, statusText, redirected, type } = response

                const headers: Record<string, string> = {}
                response.headers.forEach((value, key) => {
                    headers[key] = value
                })

                throw new Error(
                    `Got ${response.status} ${response.statusText} for url: ${url}`,
                    {
                        cause: {
                            status,
                            statusText,
                            headers,
                            redirected,
                            type,
                        },
                    },
                )
            }
            const totalBytes = posIntSchema.parse(
                response.headers.get("content-length"),
            )
            if (!response.body) {
                throw new Error(`Request body was null for url: ${url}`, {
                    cause: response,
                })
            }
            const bodyStream = response.body as ReadableStream<Buffer>
            const destinationStream = destinationFile.createWriteStream()
            if (!onProgress) {
                await pipeline(bodyStream, destinationStream)
                return "SUCCESS"
            }
            let downloadedBytes = 0
            let isThrottled: NodeJS.Timeout | null = null
            const throttledProgress = (chunkSize: number) => {
                downloadedBytes += chunkSize
                if (isThrottled) {
                    return
                }
                onProgress({ downloadedBytes, totalBytes })
                isThrottled = setTimeout(() => {
                    isThrottled = null
                }, progressThrottle)
            }
            await pipeline(
                bodyStream,
                // biome-ignore lint/correctness/useYield: dont want to modify the chunks
                async function* (chunks) {
                    for await (const chunk of chunks) {
                        throttledProgress(chunk.length)
                    }
                },
                destinationStream,
            )
            return "SUCCESS"
        } catch (someError) {
            throw new FileDownloadError(destinationFile.path(), url, someError)
        }
    },
    (someError) => someError as FileDownloadError,
)
