import * as _ from "lodash";
import { Middleware } from "@lovejs/components";
import { Cupidon } from "./Cupidon";

export class CupidonMiddleware extends Middleware {
    protected cupidon: Cupidon;

    constructor(cupidon) {
        super();
        this.cupidon = cupidon;
    }

    getMiddleware() {
        return async context => {
            const query = context.getPathParameter("query");

            return this.cupidon.handleRequest(context, query);
        };
    }
}
