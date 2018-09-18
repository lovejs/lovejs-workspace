import * as _ from "lodash";
import * as enableDestroy from "server-destroy";

export default class HttpServerFactory {
    getServer(handler, { uws }) {
        const type = uws ? require("uws").http : require("http");
        const server = type.createServer(handler.getHandler());
        enableDestroy(server);

        return server;
    }
}
