import type { Strings } from "$/common/types";
import { file } from "$/file/any";
import { Folder } from "$/folder/folder";
import { timer } from "fluent-ms";
import {
    CheckRepoActions,
    type SimpleGitProgressEvent,
    simpleGit,
} from "simple-git";

type GitFolderOptions = {
    owner: string;
    repo: string;
    onProgress?: ProgressHandler;
    baseUrl?: string;
};

type ProgressHandler = (progressEvent: SimpleGitProgressEvent) => void;

function defaultProgressHandler({
    method,
    stage,
    progress: percent,
    processed,
    total,
}: SimpleGitProgressEvent) {
    const totalLength = total.toString().length;
    console.log(
        method.toUpperCase(),
        stage,
        processed.toString().padStart(totalLength),
        "of",
        total,
        `(${percent.toString().padStart(2)}%)`,
    );
}

export class GitFolder extends Folder {
    readonly owner: string;
    readonly repo: string;
    readonly baseUrl: string;
    readonly shortUrl: string;
    readonly fullUrl: string;
    readonly progress: ProgressHandler;
    constructor(
        { owner, repo, onProgress, baseUrl }: GitFolderOptions,
        folder: string | Folder,
        ...extraPathPieces: Strings
    ) {
        const childPathPieces = [...extraPathPieces, owner, repo];
        super(folder, ...childPathPieces);
        this.owner = owner;
        this.repo = repo;
        this.baseUrl = baseUrl ?? "https://github.com";
        this.shortUrl = `${owner}/${repo}`;
        this.fullUrl = `${this.baseUrl}/${this.shortUrl}`;
        this.progress = onProgress ?? defaultProgressHandler;
    }

    get git() {
        return simpleGit({ baseDir: this.path, progress: this.progress });
    }

    isaRepo = async () =>
        await simpleGit(this.path).checkIsRepo(CheckRepoActions.IS_REPO_ROOT);

    clone = () =>
        timer(`Cloning ${this.shortUrl}`, async () => {
            await this.ensureExists();
            const isRepo = await this.isaRepo();
            if (isRepo) {
                console.log(this.shortUrl, "is already cloned");
                return;
            }
            const res = await this.git.clone(this.fullUrl, this.path);
            console.log("Cloning response:", res);
        })();

    pull = () =>
        timer(`Pulling ${this.shortUrl}`, async () => {
            await this.ensureExists();
            const isRepo = await this.isaRepo();
            if (!isRepo) {
                console.log(this.shortUrl, "does not exist yet, cloning...");
                await this.clone();
            }
            const res = await this.git.pull();
            console.log(res);
        })();

    getReadMe = () => file(this.path, "README.md");
}
