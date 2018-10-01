import * as _ from "lodash";
import { ApolloServer } from "apollo-server-koa";
import { Middleware } from "@lovejs/components";

export type GraphqlMiddlewareOptions = {};

export class GraphqlMiddleware extends Middleware {
    protected schemaBuilder;
    protected contextProviders;
    protected logger;

    constructor(schemaBuilder, contextProviders = [], logger) {
        super();
        this.schemaBuilder = schemaBuilder;
        this.contextProviders = contextProviders;
        this.logger = logger;
    }

    getOptions(schema, httpContext, contextProviders, logger) {
        return async (request, response, graphQLParams) => {
            const context = { context: httpContext };
            const opts = {
                schema,
                debug: false,
                formatError: e => {
                    console.log("Formatting error : ", e);
                    logger.error(e.message);
                    return e.message;
                }
            };

            for (let provider of contextProviders) {
                if (_.isFunction(provider)) {
                    await provider(context, request, response, graphQLParams);
                } else {
                    await provider.populateContext(context, request, response, graphQLParams);
                }
            }

            return { ...opts, context };
        };
    }

    async getMiddleware(options: GraphqlMiddlewareOptions) {
        const schema = await this.schemaBuilder.getGraphqlSchema();

        return async (context, next) => {
            try {
                const options = this.getOptions(schema, context, this.contextProviders, this.logger);
                // @ts-ignore
                return await graphqlKoa(options)(context);
            } catch (e) {
                console.error("une erreur: ", e);
            }
        };
    }
}
