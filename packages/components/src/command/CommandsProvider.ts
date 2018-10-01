import { Command } from "./Command";

export interface CommandsProvider {
    /**
     * Return a list of commands to attach to the cli
     */
    getCommands: () => Command[] | Command;
}
