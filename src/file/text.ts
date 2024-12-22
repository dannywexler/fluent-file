import { AnyFile } from "$/file/any";
import { readFileText, writeFileText } from "$/file/text.utils";

const newLineRegex = /\n|\r|\r\n/;

export class TextFile extends AnyFile {
    read() {
        return readFileText(this.path);
    }

    readLines() {
        return readFileText(this.path).map((str) => str.split(newLineRegex));
    }

    write(content: string) {
        return writeFileText(this.path, content);
    }
}
