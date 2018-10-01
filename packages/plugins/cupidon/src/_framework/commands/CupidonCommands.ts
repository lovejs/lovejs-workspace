import * as _ from "lodash";
import { Command, CommandInput, CommandOutput, CommandsProvider } from "@lovejs/components";
import { Cupidon } from "../../Cupidon";

/**
 * Commands to manager cupidon (compile, clean, ...)
 */
export class CupidonCommands implements CommandsProvider {
    /**
     * The cupidon instance
     */
    protected cupidon: Cupidon;

    constructor(cupidon: Cupidon) {
        this.cupidon = cupidon;
    }

    getCommands() {
        return new Command("cupidon:compile", this.build.bind(this), "Compile cupidon");
    }

    /**
     * Build cupidon client
     */
    async build(input: CommandInput, output: CommandOutput) {
        try {
            await this.cupidon.build(true);
        } catch (e) {
            console.log(e);
        }

        output.writeln("[success]Cupidon compiled.[/success]");
    }
}
