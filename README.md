# Fluent File
A fluent TypeScript library for working with files and folders

## Folder
Provides folder fields:
- `path`: the absolute path to this folder (`/tmp/example/someFolder`)
- `name`: the last piece of the absolute path (`someFolder`)
- `parentName`: the 2nd to last piece of the absolute path (`example`)
- `parentPath`: the absolute path to the parent of this folder (`/tmp/example`)

Provides folder methods:
- exists()
- ensureExists()
- ensureEmpty()
- delete()

## AFile
Provides fields for any kind of file:
- `path`: the absolute path to this file (`/tmp/example/someFolder/someFile.txt`)
- `name`: the name of the file **without** the extension (`someFile`)
- `fullName`: the name of the file **with** the extension (`someFile.txt`)
- `ext`: the file extension **without** the leading dot. (`txt`)
- `parentName`: the 2nd to last piece of the absolute path to this file  (`someFolder`)
- `parentPath`: the absolute path to the parent of this file (`/tmp/example/someFolder`)

Provides file methods for any kind of file:
- `getParentFolder()` returns the [Folder](#folder) instance this file is in
- `getStats()` calls node:fs/promises.stat()
- `exists()`
- `ensureExists()`
- `copyTo()`
- `moveTo()`
- `linkTo()`
- `symlinkTo()`
- `delete()`
- `readText()`
- `readTextLines()`
- `writeText()`

## JsonFile
Extends [AFile](#afile)
- the `constructor()` takes a [zod](https://zod.dev) schema
- adds a `read()` method that reads the file as text, JSON parses it, then validates it using the zod schema
- adds a `write(contents)` method that validates the contents using the zod schema, JSON stringifies it, then writes the text

## YamlFile
Extends [JsonFile](#jsonfile)
- overrides `read()` to use `YAML.parse` instead of `JSON.parse`, but still validates using the zod schema
- overrides `write(contents)` to use `YAML.stringify` instead of `JSON.stringify`, but still validates using the zod schema

## ImageFile
Extends [AFile](#afile)
- adds a [sharp](https://github.com/lovell/sharp) property
- adds a `convertToAvif()` method
- adds a `getPhash()` method using [sharp-phash](https://www.npmjs.com/package/sharp-phash) to create a [perceptual hash](https://en.wikipedia.org/wiki/Perceptual_hashing) of the image

## VideoFile
Extends [AFile](#afile)
- adds a [ffmpeg](http://www.ffmpeg.org/) property, provided by [fluent-ffmpeg](https://www.npmjs.com/package/fluent-ffmpeg)
- adds a `getMetaData()` method
- adds a `getThumbnail()` method

## GitFolder
Extends [Folder](#folder)
- the `constructor()` takes the git owner, repo, and baseUrl (defaults to "https://github.com")
- adds a [git](https://git-scm.com/) property, provided by [simple-git](https://www.npmjs.com/package/simple-git)
- adds a `clone()` method, using the owner, repo and baseUrl provided in the constructor
- adds a `pull()` method, that will clone the repo if it does not already exist
