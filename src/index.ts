// biome-ignore lint/performance/noBarrelFile: this is the index file
export { AFile, afile, homeFile, findFiles } from "$/file/any";
export { JsonFile, jsonFile, findJsonFiles } from "$/file/json";
export {
    YamlFile,
    yamlFile,
    findYamlFiles,
    YAML_EXTENSIONS,
} from "$/file/yaml";
export {
    ImageFile,
    imageFile,
    findImageFiles,
    IMAGE_EXTENSIONS,
    type ToAvifOptions,
    base2to36,
    base36to2,
    phashCheck,
    type PhashSimilarityResult,
    PhashSimilarity,
} from "$/file/image";
export {
    VideoFile,
    videoFile,
    findVideoFiles,
    VIDEO_EXTENSIONS,
} from "$/file/video";

export { Folder, folder, homeFolder, cwd } from "$/folder/folder";
export { GitFolder } from "$/folder/git";
