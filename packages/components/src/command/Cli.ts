import * as Caporal from "caporal";
import { Output } from "./Output";
import { Command } from "./Command";
import { CommandsProvider } from "./CommandsProvider";
import { Validator } from "../validation";

/**
 * Cli wraps commands
 */
export class Cli {
    /**
     * The main program
     */
    protected program;

    /**
     * Command output
     */
    protected output: Output;

    constructor(providers: CommandsProvider[], commands: Command[], version: string = "1.0", description: string = "") {
        this.program = Caporal.version(version).description(description) as Caporal;

        for (let provider of providers) {
            this.registerCommands(provider);
        }

        for (let command of commands) {
            this.registerCommand(command);
        }

        this.output = new Output();
    }

    /**
     * Register commands from a commands provider
     * @param provider the command provider
     */
    registerCommands(provider: CommandsProvider) {
        const commands = provider.getCommands();
        if (Array.isArray(commands)) {
            for (let command of commands) {
                this.registerCommand(command);
            }
        }

        if (commands instanceof Command) {
            this.registerCommand(commands);
        }
    }

    /**
     * Register a new command
     */
    registerCommand(command: Command) {
        const cmd = this.program.command(command.getCommand(), command.getDescription());
        cmd.action(this.getCommandCallback(command.getCallback()));
        command.getHelp() && cmd.help(command.getHelp());

        for (let cmdArgument of command.getArguments()) {
            cmd.argument(
                cmdArgument.getName(),
                cmdArgument.getDescription(),
                this.getValidator(cmdArgument.getValidator()),
                cmdArgument.getDefaultValue()
            );
        }

        for (let cmdOption of command.getOptions()) {
            cmd.option(
                cmdOption.getName(),
                cmdOption.getDescription(),
                this.getValidator(cmdOption.getValidator()),
                cmdOption.getDefaultValue(),
                cmdOption.getRequired()
            );
        }
    }

    /**
     * Get a command callback based on original
     */
    getCommandCallback(commandCallback) {
        return (args, options) => {
            return commandCallback({ args, options }, this.output);
        };
    }

    /**
     * Get an argument or option validator function
     */
    getValidator(validatorValue) {
        if (!validatorValue) {
            return;
        }

        if (typeof validatorValue === "function") {
            return validatorValue;
        }

        if (validatorValue instanceof RegExp) {
            return (value: string) => {
                if (!validatorValue.test(value)) {
                    throw new Error("Invalid value");
                }
            };
        }

        if (Array.isArray(validatorValue)) {
            return (value: string) => {
                if (!validatorValue.includes(value)) {
                    throw new Error("Invalid value");
                }
            };
        }

        return (value: string) => {
            const validator = new Validator();
            return validator.validate(value, validatorValue);
        };
    }

    /**
     * Execute the cli with given args
     */
    async execute(args) {
        await this.program.parse(args);
    }
}
