import * as _ from "lodash";
import { Middleware } from "@lovejs/components";

export class KoaMiddleware extends Middleware {
    protected middleware;

    constructor(module) {
        super();
        try {
            this.middleware = require(module);
        } catch (e) {
            console.error("Missing koa middleware ", e);
        }
    }

    getMiddleware(options: any) {
        if (!_.isArray(options)) {
            options = [options];
        }

        return this.middleware(...options);
    }
}
