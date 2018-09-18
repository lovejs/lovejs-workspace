import { Middleware } from "@lovejs/components";
import * as sender from "koa-send";

export class FaviconMiddleware extends Middleware {
    getOptionsSchema() {
        return { type: "string" };
    }

    getMiddleware(path: string) {
        return async (context, next) => {
            if (context.path == "/favicon.ico") {
                return await sender(context, path);
            }

            return await next();
        };
    }
}
