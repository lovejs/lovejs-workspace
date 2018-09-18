export = {
    type: "object",
    properties: {
        koa_middlewares: {
            type: "object",
            title: "List of KOA middlewares",
            default: {},
            additionalProperties: {
                type: "string",
                description: "Name of KOA middleware module"
            }
        },
        servers: {
            type: "object",
            title: "List of http servers",
            default: {},
            additionalProperties: {
                type: "object",
                required: ["handler", "factory", "uws", "listen"],
                additionalProperties: false,
                properties: {
                    handler: {
                        type: "string",
                        title: "Handler service",
                        description: "Service id of request handler to use",
                        default: "http.handler"
                    },
                    factory: {
                        type: "string",
                        title: "Factory service",
                        description: "Service id of factory use to generate server",
                        default: "http.server.factory"
                    },
                    uws: {
                        type: "boolean",
                        title: "Uws (experimental)",
                        description: "Use Uws server",
                        default: false
                    },
                    listen: {
                        type: "object",
                        required: ["port"],
                        properties: {
                            host: {
                                title: "Host",
                                type: "string",
                                default: "127.0.0.1"
                            },
                            port: {
                                title: "Port",
                                type: "integer"
                            }
                        }
                    }
                }
            }
        },
        handlers: {
            type: "object",
            title: "List of http handlers",
            default: {},
            additionalProperties: {
                type: "object",
                required: ["handler", "factory", "uws", "listen"],
                properties: {
                    handler: {
                        type: "string",
                        title: "Handler service",
                        description: "Service id of request handler to use",
                        default: "http.handler"
                    },
                    factory: {
                        type: "string",
                        title: "Factory service",
                        description: "Service id of factory use to generate server",
                        default: "http.server.factory"
                    },
                    uws: {
                        type: "boolean",
                        title: "Uws (experimental)",
                        description: "Use Uws server",
                        default: false
                    }
                }
            }
        },
        cupidon: {
            type: "object",
            title: "Cupidon configuration",
            properties: {
                exclude: {
                    type: "string",
                    description: "Path pattern to exclude from cupidon"
                }
            }
        }
    },
    additionalProperties: false,
    required: ["servers", "koa_middlewares"]
};
