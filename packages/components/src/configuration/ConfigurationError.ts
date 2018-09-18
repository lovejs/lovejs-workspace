import { ErrorStack } from "../errors";

export class ConfigurationError extends ErrorStack {
    /**
     * File where error happens if any
     */
    protected file?: string;

    /**
     * Path of the error in the file
     */
    protected path?: string;

    constructor(message: string, { file, path }: { file?: string; path?: string }, error?: Error) {
        super(message, error);
        this.file = file;
        this.path = path;
    }

    getFile() {
        return this.file;
    }

    getPath() {
        return this.path;
    }
}
