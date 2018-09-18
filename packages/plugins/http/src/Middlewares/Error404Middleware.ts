import * as _ from "lodash";
import { Middleware } from "@lovejs/components";

export class Error404Middleware extends Middleware {
    getMiddleware() {
        return async context => {
            return context.throw(404, "Page not found");
        };
    }
}
