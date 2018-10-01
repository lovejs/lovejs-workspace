import { GraphObject } from "./GraphObject";
import * as _ from "lodash";

export class GraphInterface extends GraphObject {
    protected properties;

    constructor() {
        super();
        this.properties = null;
    }

    setProperties(properties) {
        if (!properties || _.isPlainObject(properties) || !_.every(properties, _.isString)) {
            throw new Error(`setProperties on graphql interface expect an object containing properties`);
        }
        this.properties = properties;
    }

    getProperties() {
        return this.properties;
    }

    isComplete() {
        return super.isComplete() && this.getProperties();
    }
}
