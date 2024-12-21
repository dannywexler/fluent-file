import { AnyFile } from "$/file/any";
import { readFileText, writeFileText } from "./text.utils";

const newLineRegex = /\n|\r|\r\n/;

export class TextFile extends AnyFile {
    read() {
        return readFileText(this.path);
    }

    readLines() {
        return readFileText(this.path).map((str) => str.split(newLineRegex));
    }

    async write(content: string) {
        return await writeFileText(this.path, content);
    }
}
