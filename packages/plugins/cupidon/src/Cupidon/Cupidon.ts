import * as _ from "lodash";
import * as path from "path";
import * as fs from "fs";
import * as sender from "koa-send";
import * as builder from "@lovejs/cupidon-client";
import * as WebSocket from "ws";
import { CupidonExtension } from "./CupidonExtension";

export class Cupidon {
    /**
     * List of extensions to load
     */
    protected extensions: { [name: string]: CupidonExtension } = {};

    /**
     * Is cupidon building
     */
    protected building: boolean = false;

    /**
     * Is cupidon builded
     */
    protected builded: boolean = false;

    /**
     * Cupidon build Path
     */
    protected buildPath: string;

    /**
     * Cupidon build path index
     */
    protected buildIndex: string;

    protected http_server;

    protected ws_server;

    protected contexts;

    protected statistics;

    constructor(buildPath) {
        this.buildPath = buildPath;
        this.buildIndex = path.resolve(buildPath, "/index.html");

        this.http_server = null;
        this.ws_server = null;
        this.contexts = [];
        this.statistics = {
            requests: 0,
            errors: 0
        };
    }

    registerExtensions(extensions) {
        for (let name in extensions) {
            this.registerExtension(name, extensions[name]);
        }
    }

    registerExtension(name, extension) {
        extension.setDataEmitter(data => this.extensionBroadcast(name, data));
        this.extensions[name] = extension;
    }

    attachToServer(http_server) {
        this.http_server = http_server;
    }

    addContext(context) {
        this.contexts.push(context);
    }

    getContexts() {
        return this.contexts;
    }

    getStatistics() {
        return this.statistics;
    }

    listen() {
        this.ws_server = new WebSocket.Server({ server: this.http_server, path: "/__cupidon" });
        this.ws_server.on("connection", ws => {
            ws.on("message", function incoming(message) {
                console.log("received: %s", message);
            });
        });
    }

    async handleContextResponse(event) {
        const context = event.getData();
        this.broadcast(context);
    }

    async handleContextError(event) {
        const { context, error } = event.getData();
        this.broadcast(context);
    }

    extensionBroadcast(ext, data) {
        return this.broadcast({ ext, data });
    }

    broadcast(data) {
        this.ws_server &&
            this.ws_server.clients.forEach(client => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify(data));
                }
            });
    }

    /**
     * Check if a build exists
     */
    async buildExists() {
        return new Promise((resolve, reject) => fs.exists(this.buildIndex, exists => resolve(exists)));
    }

    /**
     * Build if build doesn't exists or forced
     */
    async build(force) {
        if (this.building) {
            return;
        }

        if (force || !(await this.buildExists())) {
            this.building = true;
            const result = await builder({
                outputPath: this.buildPath,
                extensions: _.map(this.extensions, (extension, name) => ({ name, ...extension.toJSON() }))
            });

            this.builded = true;
            this.building = false;

            return result;
        }
    }

    /**
     * Hande a request to cupidon
     * @param context
     * @param query
     */
    async handleRequest(context, query) {
        if (!this.builded) {
            //await this.build();
        }

        if (query !== "query") {
            return this.serveSpa(context, query);
        } else {
            return (context.body = await this.resolveQuery(context.query));
        }
    }

    /**
     * Serve the cupidon client
     *
     * @param context
     * @param query
     */
    async serveSpa(context, query) {
        const opts = { root: this.buildPath };
        try {
            await sender(context, query || "index.html", opts);
        } catch (error) {
            context.throw(404, "Missing cupidon files.");
        }
    }

    /**
     * Resolve a cupidon query
     * @param params
     */
    async resolveQuery(params) {
        const { ext, query, ...rest } = params;
        if (!ext || !this.extensions[ext]) {
            return [];
        }

        return await this.extensions[ext].getData(query, rest || {});
    }
}
