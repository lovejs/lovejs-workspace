import * as _ from "lodash";
import * as statuses from "statuses";
import * as Stream from "stream";
import * as util from "util";
import * as isJSON from "koa-is-json";

export default class Handler {
    protected eventDispatcher;
    protected contextBuilder;
    protected router;
    protected resolver;
    protected logger;

    constructor(eventDispatcher, contextBuilder, router, middlewaresResolver, logger) {
        this.eventDispatcher = eventDispatcher;
        this.contextBuilder = contextBuilder;
        this.router = router;
        this.resolver = middlewaresResolver;
        this.logger = logger;
    }

    getRouter() {
        return this.router;
    }

    getHandler() {
        return async (request, response) => {
            const context = await this.contextBuilder.getContext(request, response);
            let currentError = false;
            let timers = [];

            await this.eventDispatcher.emit("http.context.start", { context });

            try {
                const route = await this.router.getMatchingRoute(context);
                if (!route) {
                    return context.throw(404, "Not found");
                }
                const middlewares = _.toPairs(context.getAttribute("_middlewares"));

                let timer = +new Date();
                await this.resolver.processMiddlewares(middlewares, [context], middleware => {
                    timers.push({ middleware, time: +new Date() - timer });
                    timer = +new Date();
                });
                this.sendResponse(context);
                this.logger.debug({ message: "HTTP request", path: context.path, method: context.method, status: context.status });
            } catch (error) {
                currentError = error;
                this.logger.error({ message: error, path: context.path, method: context.method, status: context.status });
                this.sendError(context, error);
                this.logger.renderError(error);
            }

            await this.eventDispatcher.emit("http.context.finish", { context, timers, error: currentError });
        };
    }

    sendResponse(context) {
        // allow bypassing koa
        if (false === context.respond) {
            return;
        }

        const res = context.response.res;
        if (!context.writable) {
            return;
        }

        let body = context.body;
        const code = context.status;

        // ignore body
        if (statuses.empty[code]) {
            // strip headers
            context.body = null;
            return res.end();
        }

        if ("HEAD" == context.method) {
            if (!res.headersSent && isJSON(body)) {
                context.length = Buffer.byteLength(JSON.stringify(body));
            }
            return res.end();
        }

        // status body
        if (null == body) {
            body = context.message || String(code);
            if (!res.headersSent) {
                context.type = "text";
                context.length = Buffer.byteLength(body);
            }
            return res.end(body);
        }

        // responses
        if (Buffer.isBuffer(body)) return res.end(body);
        if ("string" == typeof body) return res.end(body);
        if (body instanceof Stream) return body.pipe(res);

        // body: json
        body = JSON.stringify(body);
        if (!res.headersSent) {
            context.length = Buffer.byteLength(body);
        }

        res.end(body);
    }

    /**
     * Default error handling.
     *
     * @param {Error} err
     * @api private
     */

    sendError(context, err) {
        // don't do anything if there is no error.
        // this allows you to pass `this.onerror`
        // to node-style callbacks.
        if (null == err) return;

        if (!(err instanceof Error)) err = new Error(util.format("non-error thrown: %j", err));

        let headerSent = false;
        if (context.headerSent || !context.writable) {
            headerSent = err.headerSent = true;
        }

        // delegate
        //this.app.emit("error", err, this);

        // nothing we can do here other
        // than delegate to the app-level
        // handler and log.
        if (headerSent) {
            return;
        }

        const { res } = context;

        // first unset all headers
        if (typeof res.getHeaderNames === "function") {
            res.getHeaderNames().forEach(name => res.removeHeader(name));
        } else {
            res._headers = {}; // Node < 7.7
        }

        // then set those specified
        context.set(err.headers);

        // force text/plain
        context.type = "text";

        // ENOENT support
        if ("ENOENT" == err.code) err.status = 404;

        // default to 500
        if ("number" != typeof err.status || !statuses[err.status]) err.status = 500;

        // respond
        const code = statuses[err.status];
        const msg = err.expose ? err.message : code;
        context.status = err.status;
        context.length = Buffer.byteLength(msg);
        context.res.end(msg);
    }
}
