import { GraphObject } from "./GraphObject";
import { GraphInput } from "./GraphInput";
import { GraphType } from "./GraphType";

import * as _ from "lodash";

const isInputValid = input => (_.isPlainObject(input) && _.every(input, _.isString)) || input instanceof GraphInput;

const isOutputValid = output => _.isString(output) || output instanceof GraphType;

export class GraphOperation extends GraphObject {
    protected input;
    protected output;
    protected resolver;
    protected middlewares;

    constructor() {
        super();
        this.input = null;
        this.output = null;
        this.resolver = null;
        this.middlewares = {};
    }

    getInput() {
        return this.input;
    }

    setInput(input) {
        if (!input || !isInputValid(input)) {
            throw new Error(`setInput on graphql query or mutation expect an object or a GraphInput instance`);
        }

        this.input = input;
    }

    getOutput() {
        return this.output;
    }

    setOutput(output) {
        const isOutputObject = output => _.isPlainObject(output) && _.every(output, _.isString);

        if (!output || !isOutputValid(output)) {
            throw new Error(`setOutput on graphql query or mutation expect a string or a GraphType instance`);
        }

        this.output = output;
    }

    setResolver(resolver) {
        if (!resolver || !_.isFunction(resolver)) {
            throw new Error(`setResolver on graphql query or mutation expect a function`);
        }
        this.resolver = resolver;
    }

    getResolver() {
        return this.resolver;
    }

    isComplete() {
        return super.isComplete() && this.getOutput() && this.getResolver();
    }

    getMiddlewares() {
        return this.middlewares;
    }

    setMiddlewares(middlewares, replace = false) {
        if (replace) {
            this.middlewares = middlewares;
        } else {
            _.merge(this.middlewares, middlewares);
        }
    }
}
