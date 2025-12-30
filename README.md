# Fluent File
A fluent TypeScript library for working with files and folders

## FluentFolder

### Fields:
- `path`: the absolute path to this folder (`/tmp/example/someFolder`)
- `name`: the last piece of the absolute path (`someFolder`)
- `info`: an object with both `path` and `name`

### Methods:
- `stats()`
- `exists()`
- `ensureExists()`
- `ensureEmpty()`
- `remove()`
- `findFolders()`
- `findFiles()`

### Transform methods:
- `file()`: create `FluentFile` by resolving the path from this `FluentFolder`
- `folder()`: create `FluentFolder` by resolving the path from this `FluentFolder`


## FluentFile

### Fields:
- `path`: the absolute path to this file (`/tmp/example/someFolder/someFile.txt`)
- `folderPath`: the absolute path to the folder this file is in (`/tmp/example/someFolder`)
- `info`: an object with `absolutePath`, `folderPath`, `name`, `basename` and `ext`

### Getters/setters (call without arg to get, call with arg to set):
- `name`: the name of the file **with** the extension (`someFile.txt`)
- `basename`: the name of the file **without** the extension (`someFile`)
- `ext`: the file extension **without** the leading dot. (`txt`)

### Schema methods:
- `schema()`: create new `FluentFile` instance with a [Standard Schema](https://standardschema.dev)

### Info methods:
- `stats()` calls `node:fs/promises.stat()`
- `exists()`
- `ensureExists()`

### Move/remove methods:
- `copyTo()`
- `moveTo()`
- `linkTo()`
- `symlinkTo()`
- `remove()`

### Read methods:
- `readText()`
- `readBuffer()`
- `read()`: makes use of this file's `schema` to parse then validate the file contents
- `createReadStream()`

### Write methods:
- `append()`
- `writeText()`
- `writeBuffer()`
- `write()`: makes use of this file's `schema` to validate then stringify the file contents
- `createWriteStream()`

### Image methods:

Uses [sharp](https://github.com/lovell/sharp) library

- `metadata()`
- `resize()`
- `toAVIF()`
- `phash()`: uses [sharp-phash](https://www.npmjs.com/package/sharp-phash) to create a [perceptual hash](https://en.wikipedia.org/wiki/Perceptual_hashing) of the image
- plus all other `sharp` methods

### Video methods:

Uses [ffmpeg](https://www.ffmpeg.org/) commands

- `metadata()`: using [ffprobe](https://ffmpeg.org/ffprobe.html)
- `extractFrame()`

### Transform methods:
- `file()`: create `FluentFile` by resolving the path from this `FluentFile`
- `folder()`: create `FluentFolder` by resolving the path from this `FluentFile`

