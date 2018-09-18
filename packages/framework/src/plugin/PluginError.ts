import { ErrorStack } from "@lovejs/components";

export class PluginError extends ErrorStack {
    /**
     * Plugin causing the error
     */
    protected pluginName?: string;

    constructor(message: string, pluginName: string, error?: Error) {
        super(message, error);
        this.pluginName = pluginName;
    }

    getPluginName() {
        return this.pluginName;
    }
}
