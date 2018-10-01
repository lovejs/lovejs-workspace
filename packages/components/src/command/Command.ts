import { CommandArgument } from "./CommandArgument";
import { CommandOption } from "./CommandOption";
import { Output } from "./Output";

export type CommandInput = {
    args: { [name: string]: string };
    options: { [name: string]: string };
};

export type CommandOutput = Output;

export class Command {
    /**
     * The command string invocation
     */
    protected _command: string;

    /**
     * The command callback
     */
    protected _callback: (input: CommandInput, output: CommandOutput) => any;

    /**
     * The command description
     */
    protected _description: string;

    /**
     * Command help
     */
    protected _help: string;

    /**
     * Command arguments
     */
    protected _arguments: CommandArgument[] = [];

    /**
     * Command options
     */
    protected _options: CommandOption[] = [];

    constructor(command: string, callback: (any) => any, description: string = "") {
        this._command = command;
        this._callback = callback;
        this._description = description;
    }

    /**
     * Get the command's command
     */
    getCommand() {
        return this._command;
    }

    /**
     * Get the command execution callback
     */
    getCallback() {
        return this._callback;
    }

    /**
     * Get the command description
     */
    getDescription() {
        return this._description;
    }

    /**
     * Get the command help
     */
    getHelp() {
        return this._help;
    }

    /**
     * Get the command arguments
     */
    getArguments() {
        return this._arguments;
    }

    /**
     * Get the command options
     */
    getOptions() {
        return this._options;
    }

    /**
     * Add an argument
     */
    addArgument(arg: CommandArgument) {
        this._arguments.push(arg);

        return this;
    }

    /**
     * Add an option
     */
    addOption(option: CommandOption) {
        this._options.push(option);

        return this;
    }

    /**
     * Set the command description
     *
     * @param description
     */
    description(description: string) {
        this._description = description;

        return this;
    }

    /**
     * Set the command help
     */
    help(help: string) {
        this._help = help;

        return this;
    }

    /**
     * Add an argument
     */
    argument(name: string, description: string, defaultValue?: any, validator?: any) {
        const arg = new CommandArgument(name, description, defaultValue, validator);

        return this.addArgument(arg);
    }

    /**
     * Add an option
     */
    option(name: string, description: string, defaultValue?: any, required: boolean = false, validator?: any) {
        const option = new CommandOption(name, description, defaultValue, required, validator);

        return this.addOption(option);
    }
}
