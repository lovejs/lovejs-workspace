type validatorFn = (str: string) => any;

/**
 * Represent a command argument
 */
export class CommandArgument {
    /**
     * Command argument name
     */
    protected name: string;

    /**
     * Command argument description
     */
    protected description: string;

    /**
     * Command argument default value
     */
    protected defaultValue: any;

    /**
     * Command argument validator if any
     */
    protected validator: validatorFn | RegExp | string[] | object;

    /**
     * Is the option required
     */
    protected required: boolean;

    constructor(name, description, defaultValue, required = false, validator?) {
        this.name = name;
        this.description = description;
        this.defaultValue = defaultValue;
        this.required = required;
        this.validator = validator;
    }

    /**
     * Get the argument name
     */
    getName() {
        return this.name;
    }

    /**
     * Get the argument description
     */
    getDescription() {
        return this.description;
    }

    /**
     * Get the argument default value
     */
    getDefaultValue() {
        return this.defaultValue;
    }

    /**
     * Get the argument validator
     */
    getValidator() {
        return this.validator;
    }

    /**
     * Get if the argument is required
     */
    getRequired() {
        return this.required;
    }
}
