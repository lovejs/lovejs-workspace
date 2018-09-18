import { ErrorStack } from "../../errors";

import { Resolution } from "../Resolution";

export class DiResolutionError extends ErrorStack {
    protected service: string;
    protected resolutionStack: string[];
    protected error: Error;

    constructor(message, resolution: Resolution, error: Error = null) {
        super(message, error);

        this.service = resolution.getId();
        this.resolutionStack = resolution ? resolution.debugStack() : null;
    }

    getService() {
        return this.service;
    }

    getStack() {
        return this.stack;
    }
}
