import * as _ from "lodash";
import { BaseMatcher } from "@lovejs/components";

export class EnvironmentMatcher extends BaseMatcher {
    protected environment: string;

    constructor(environment: string) {
        super();
        this.environment = environment;
    }

    getOptionsSchema() {
        return {
            oneOf: [{ type: "string" }, { type: "array", items: { type: "string" } }]
        };
    }

    normalizeOptions(options) {
        return _.isArray(options) ? options : [options];
    }

    match(context, environments, route) {
        return environments.includes(this.environment);
    }
}
