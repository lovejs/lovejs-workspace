import * as _ from "lodash";

export class GraphObject {
    protected name;

    constructor() {
        this.name = null;
    }

    getName() {
        return this.name;
    }

    setName(name) {
        if (!_.isString(name)) {
            throw new Error(`setName on graphql object expect a string "${name}" given`);
        }
        this.name = name;
    }

    isComplete() {
        return this.name ? true : false;
    }
}
