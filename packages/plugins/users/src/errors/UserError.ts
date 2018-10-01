const ExtendableError = require("es6-error");

export class UserError extends ExtendableError {
    constructor(operation, type) {
        super(`${operation}: ${type}`);
        this.operation = operation;
        this.type = type;
    }

    toGraphql() {
        return {
            operation: this.operation,
            type: this.type
        };
    }
}
