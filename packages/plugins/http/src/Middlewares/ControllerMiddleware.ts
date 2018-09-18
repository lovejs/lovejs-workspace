import * as _ from "lodash";
import { Middleware, Container } from "@lovejs/components";

export class ControllerMiddleware extends Middleware {
    protected container: Container;

    constructor(container: Container) {
        super();
        this.container = container;
    }

    getOptionsSchema() {
        return {
            oneOf: [
                { type: "string" },
                {
                    type: "object",
                    properties: {
                        controller: { type: "string" },
                        method: { type: "string" },
                        args: { type: "array" },
                        setBody: { type: "boolean" }
                    }
                }
            ]
        };
    }

    normalizeOptions(options) {
        options = super.normalizeOptions(options);

        if (_.isString(options)) {
            options = { controller: options };
        }

        return options;
    }

    mergeOptions(options, inheritOptions) {
        return _.merge(inheritOptions || {}, options);
    }

    getMiddleware({ controller, method, setBody, ...args }) {
        return async context => {
            const service = await this.container.get(controller);
            if (!service) {
                throw new Error(`Service for controller "${controller}" not found`);
            }

            if (method && !service[method]) {
                throw new Error(`Method "${method}" not found on controller "${controller}"`);
            }

            const callable = method ? service[method] : service;
            const res = await callable.apply(service, [context, context.getPathParameters(), args]);
            if (setBody) {
                context.body = res;
            }

            return res;
        };
    }
}
