import * as _ from "lodash";
import { Middleware } from "@lovejs/components";

export class PermissionsMiddleware extends Middleware {
    getOptionsSchema() {
        return { oneOf: [{ type: "string" }, { type: "array", items: { type: "string" } }] };
    }

    normalizeOptions(options) {
        options = super.normalizeOptions(options);

        if (_.isString(options)) {
            options = [options];
        }

        return options;
    }

    getMiddleware(permissions) {
        return async context => {
            context.hasPermissions(permissions);
        };
    }
}
