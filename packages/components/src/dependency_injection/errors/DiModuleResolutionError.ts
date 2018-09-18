import { ErrorStack } from "../../errors";

export class DiModuleResolutionError extends ErrorStack {
    protected module;
    protected directories;

    constructor(message: string, { module, directories }: { module?: string; directories?: string[] } = {}, error: Error = null) {
        super(message, error);

        this.module = module;
        this.directories = directories;
    }

    getModule() {
        return this.module;
    }

    getDirectories() {
        return this.directories;
    }
}
