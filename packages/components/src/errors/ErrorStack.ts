import { ExtendableError } from "ts-error";

/**
 * An error that can encapsulate an other error
 */
export abstract class ErrorStack extends ExtendableError {
    protected error: Error;

    protected originalMessage?: string;

    constructor(message: string, error: Error = null) {
        super(error ? error.message : message);
        this.originalMessage = message;
        this.error = error;
    }

    getError() {
        return this.error;
    }
}
