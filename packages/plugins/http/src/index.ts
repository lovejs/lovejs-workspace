import { Container, Factory, Service, Tag, _service } from "@lovejs/components/dependency_injection";
import { Plugin } from "@lovejs/framework";

export default class HttpPlugin extends Plugin {
    async registerDefinitions(container: Container, origin) {
        await container.loadDefinitions(this.getPluginDir("/_framework/services/services.yml"), origin);

        const servers = this.get("servers");

        for (let name in servers) {
            const configuration = servers[name];
            let { factory, handler, uws } = configuration;

            const service = new Service(new Factory(factory, "getServer"), { public: true });
            const serviceName = `http.server.${name}`;
            service.setArguments([_service(handler), { uws }]);
            service.addTag(new Tag("http.server", { configuration }));
            container.setService(serviceName, service);

            if (name === "default") {
                container.setAlias("http.server", "http.server.default");
            }
        }

        const koaMiddlewares = this.get("koa_middlewares", {});
        for (let name in koaMiddlewares) {
            const service = new Service(this.getPluginDir("/Middlewares/KoaMiddleware"), { public: true });
            const serviceName = `http.middleware.${name}`;
            service.setArguments([koaMiddlewares[name]]);
            service.addTag(new Tag("http.middleware", { name }));

            container.setService(serviceName, service);
        }

        if (this.hasPlugin("cupidon")) {
            container.setParameter("http.cupidon.config", this.get("cupidon"));
            await container.loadDefinitions(this.getPluginDir("/_framework/services/cupidon.yml"), origin);
        }
    }

    async boot(container: Container, isCli: boolean) {
        if (isCli) {
            return;
        }
        const logger = await container.get("logger.default");

        const servers = this.get("servers");
        for (let name in servers) {
            const configuration = servers[name];
            const { listen } = configuration;
            const server = await container.get(`http.server.${name}`);
            try {
                await this.startServer(server, listen);
                logger.info({ message: `HTTP Server ${name} listening`, ...listen });
            } catch (error) {
                logger.error({ message: `HTTP Server ${name} failed to start : ${error.message}`, error, ...listen });
            }
        }
    }

    async startServer(server, options) {
        return new Promise((resolve, reject) => {
            try {
                let args = [options.port];
                if (options.host) {
                    args.push(options.host);
                }
                args.push(() => resolve(true));
                server.listen(...args);
            } catch (error) {
                reject(error);
            }
        });
    }

    async halt(container) {
        const servers = this.get("servers");
        for (let name in servers) {
            try {
                const server = await container.get(`http.server.${name}`);
                await this.stopServer(server);
            } catch (error) {}
        }
    }

    async stopServer(server) {
        return new Promise((resolve, reject) => server.destroy(error => (error ? reject(error) : resolve(true))));
    }
}
