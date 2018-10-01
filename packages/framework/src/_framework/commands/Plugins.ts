import * as _ from "lodash";

import { Command, CommandInput, CommandOutput, CommandsProvider } from "@lovejs/components";
import { Kernel } from "../../kernel";

/**
 * Commands to get info about loaded plugins
 */
export class PluginsCommand implements CommandsProvider {
    /**
     * The application kernel
     */
    protected kernel: Kernel;

    /**
     * Command prefix
     */
    protected prefix: string;

    constructor(kernel) {
        this.kernel = kernel;
        this.prefix = "plugins";
    }

    /**
     * @inheritdoc
     */
    getCommands() {
        return new Command(`${this.prefix}:list`, this.list.bind(this), `List installed plugin`);
    }

    getOutputStyles() {
        return {
            plugin: { fg: "#DB49AC", style: "bold" },
            config: "cyanBright",
            header: { fg: "whiteBright", style: ["bold"] }
        };
    }

    async list(input: CommandInput, output: CommandOutput) {
        const plugins = this.kernel.getPlugins();

        const rows = [];
        rows.push(["[header]Plugin[/header]"]);
        _.each(plugins, ({ name }) => {
            rows.push([`[plugin]${name}[/plugin]`]);
        });

        output.table(rows);
    }
}
