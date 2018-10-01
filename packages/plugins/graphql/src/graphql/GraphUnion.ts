import { GraphObject } from "./GraphObject";
import * as _ from "lodash";

export class GraphUnion extends GraphObject {
    protected types;
    protected resolver;

    constructor() {
        super();
        this.types = null;
        this.resolver = null;
    }

    setTypes(types) {
        if (!types || !_.isArray(types) || !_.every(types, p => _.isString(p))) {
            throw new Error(`setTypes on graphql enum expect an array of type as string`);
        }

        this.types = types;
    }

    getTypes() {
        return this.types;
    }

    setResolverType(resolver) {
        if (!resolver || !_.isFunction(resolver)) {
            throw new Error(`setResolverType on graphql union or mutation expect a function`);
        }
        this.resolver = resolver;
    }

    getResolverType() {
        return this.resolver;
    }

    isComplete() {
        return super.isComplete() && this.getTypes() && this.getResolverType();
    }
}
