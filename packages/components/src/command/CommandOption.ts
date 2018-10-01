import { CommandArgument } from "./CommandArgument";

/**
 * Represent a command option
 */
export class CommandOption extends CommandArgument {
    /**
     * The option short name if any
     */
    protected shortname: string;

    constructor(name, description, defaultValue, required = false, validator?) {
        super(name, description, defaultValue, required, validator);
    }
}
