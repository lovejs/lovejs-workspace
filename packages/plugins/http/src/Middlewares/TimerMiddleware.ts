import * as _ from "lodash";
import { Middleware } from "@lovejs/components";

export class TimerMiddleware extends Middleware {
    getMiddleware() {
        return async (context, next) => {
            const start = Date.now();
            //await new Promise(resolve => setTimeout(resolve, 2500));
            await next();
            //await new Promise(resolve => setTimeout(resolve, 1200));
            context.getResponse().set("X-Response-Time", `${Date.now() - start}ms`);
        };
    }
}
