/**
 * ConfigPathResolver interface resolve configuration path when loading file or importing other files
 */
export interface ConfigurationPathResolverInterface {
    /**
     * Return the content of given file
     * @param targetPath the target path
     * @param currentPath the current path
     */
    getContent(targetPath: string, parentPath?: string): Promise<Buffer>;

    /**
     * Resolve an import and return a array of filepath and filename
     */
    resolveImport(targetPath: string, query?: any, parentPath?: string): Promise<FileInfo[]>;
}

export interface FileInfo {
    // Complete file path
    path: string;

    // Directory name
    dir: string;

    // Name of the file (without directory)
    name: string;

    // File extension
    ext: string;

    // Filename of the file without folder and extension
    name_stripped: string;

    // Parent path
    parentpath: string;

    // Relative file path (from parentpath)
    relpath: string;

    // Relative dirname
    reldir: string;
}
