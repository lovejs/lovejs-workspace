import * as _ from "lodash";
import * as sender from "koa-send";
import { Middleware } from "@lovejs/components";

export class StaticMiddleware extends Middleware {
    getOptionsSchema() {
        return {
            type: "object",
            properties: {
                path: { type: "string" },
                param: { type: "string" },
                send: { type: "string" },
                options: { type: "object" }
            },
            required: ["path"]
        };
    }

    getMiddleware({ path, param, send, options }) {
        return async (context, next) => {
            const file = context.getPathParameter(param || "file");
            const opts = options || {};
            opts.root = path;

            const sendDefault = async () => {
                await sender(context, send, opts);
            };
            await sender(context, "index.html", opts);
            try {
                await sender(context, file || false, opts);
            } catch (error) {
                if (error.errno == -2 && send) {
                    return await sendDefault();
                }
                throw error;
            }
        };
    }
}
