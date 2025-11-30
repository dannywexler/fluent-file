// import logUpdate from "log-update"
// import type { SimpleGitProgressEvent } from "simple-git"
// import { CheckRepoActions, simpleGit } from "simple-git"
//
// import type { Strings } from "$/common/types"
// import { afile } from "$/file/any"
// import { Folder } from "$/folder/folder"
//
// type GitFolderOptions = {
//     owner: string
//     repo: string
//     onProgress?: ProgressHandler
//     baseUrl?: string
// }
//
// const padStage = (stage: string) => stage.padEnd(11)
//
// type ProgressHandler = (progressEvent: SimpleGitProgressEvent) => void
//
// let lastStage = ""
//
// function defaultProgressHandler({
//     method,
//     stage,
//     progress: percent,
//     processed,
//     total,
// }: SimpleGitProgressEvent) {
//     const methodUpper = method.toUpperCase()
//     const paddedStage = padStage(stage)
//     if (paddedStage !== lastStage) {
//         if (lastStage) {
//             logUpdate(methodUpper, lastStage, "completed")
//             logUpdate.done()
//         }
//         lastStage = paddedStage
//         return
//     }
//     const totalLength = total.toString().length
//     const cols = process.stdout.columns
//     const processedCols = Math.max(1, Math.ceil((cols * percent) / 100))
//     const remainingCols = cols - processedCols
//     const processedText = "=".repeat(processedCols)
//     const remainingText = "_".repeat(remainingCols)
//     const firstRow = [
//         methodUpper,
//         paddedStage,
//         processed.toString().padStart(totalLength),
//         "of",
//         total.toString(),
//         `(${percent.toString().padStart(2)}%)`,
//     ].join(" ")
//     const secondRow = `${processedText}${remainingText}`
//     logUpdate(`${firstRow}\n${secondRow}`)
// }
//
// export class GitFolder extends Folder {
//     readonly owner: string
//     readonly repo: string
//     readonly baseUrl: string
//     readonly shortUrl: string
//     readonly fullUrl: string
//     readonly progress: ProgressHandler
//     constructor(
//         { owner, repo, onProgress, baseUrl }: GitFolderOptions,
//         folder: string | Folder,
//         ...extraPathPieces: Strings
//     ) {
//         const childPathPieces = [...extraPathPieces, owner, repo]
//         super(folder, ...childPathPieces)
//         this.owner = owner
//         this.repo = repo
//         this.baseUrl = baseUrl ?? "https://github.com"
//         this.shortUrl = `${owner}/${repo}`
//         this.fullUrl = `${this.baseUrl}/${this.shortUrl}`
//         this.progress = onProgress ?? defaultProgressHandler
//     }
//
//     get git() {
//         return simpleGit({ baseDir: this.path, progress: this.progress })
//     }
//
//     isaRepo = async () =>
//         await simpleGit(this.path).checkIsRepo(CheckRepoActions.IS_REPO_ROOT)
//
//     clone = async () => {
//         console.log("Cloning\n", this.fullUrl, "\ninto:\n", this.relativePath())
//         await this.ensureExists()
//         const isRepo = await this.isaRepo()
//         if (isRepo) {
//             console.log(this.fullUrl, "is already cloned")
//             return
//         }
//         await this.git.clone(this.fullUrl, this.path)
//         logUpdate("CLONE", lastStage, "completed")
//         logUpdate.done()
//         console.log("Cloned\n", this.fullUrl, "\ninto:\n", this.relativePath())
//     }
//
//     pull = async () => {
//         console.log("Pulling", this.fullUrl)
//         await this.ensureExists()
//         const isRepo = await this.isaRepo()
//         if (!isRepo) {
//             console.log(this.fullUrl, "does not exist yet, cloning...")
//             await this.clone()
//         }
//         const res = await this.git.pull()
//         logUpdate("PULL", lastStage, "completed")
//         logUpdate.done()
//         console.log("Pulled", this.fullUrl)
//         return res
//     }
//
//     getReadMe = () => afile(this.path, "README.md")
// }
