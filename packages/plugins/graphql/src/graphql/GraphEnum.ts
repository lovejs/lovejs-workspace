import { GraphObject } from "./GraphObject";

import * as _ from "lodash";

export class GraphEnum extends GraphObject {
    protected values;
    constructor() {
        super();
        this.values = null;
    }

    getValues() {
        return this.values;
    }

    setValues(values) {
        if (!values || !_.isArray(values) || !_.every(values, _.isString)) {
            throw new Error(`setValues on graphql enum expect an array of string`);
        }
        this.values = values;
    }

    isComplete() {
        return super.isComplete() && this.getValues();
    }
}
