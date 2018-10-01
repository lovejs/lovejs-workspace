import * as sequelize from "sequelize";
import { Plugin } from "@lovejs/framework";

import { Factory, Service, Tag, _service } from "@lovejs/components/dependency_injection";

export * from "./graphql";
export * from "./extensions";
export * from "./Cupidon";
export * from "./sequelize";

export default class SequelizePlugin extends Plugin {
    static get sequelize() {
        return sequelize;
    }

    async registerDefinitions(container, isCli) {
        container.setParameter("sequelize.databases", this.get("databases"));
        await container.loadDefinitions(this.getPluginDir("/_framework/services/services.yml"));

        if (this.get("graphql")) {
            await container.loadDefinitions(this.getPluginDir("/_framework/services/graphql.yml"));
        }

        if (this.hasPlugin("cupidon")) {
            container.setParameter("sequelize.cupidon.config", this.get("cupidon"));
            await container.loadDefinitions(this.getPluginDir("/_framework/services/cupidon.yml"));
        }

        if (isCli) {
            await container.loadDefinitions(this.getPluginDir("/_framework/services/commands.yml"));
        }
    }

    async registerServices(container) {
        let logger = this.get("logger");
        if (!logger) {
            logger = container.hasService("logger.sequelize") ? "logger.sequelize" : "logger.default";
        }

        container.setParameter("sequelize.logger", logger);

        for (let database in this.get("databases")) {
            const dbService = new Service();
            const dbServiceName = `sequelize.db.${database}`;
            dbService.setFactory(new Factory("sequelize.registry", "getDatabase"));
            dbService.setArguments([database]);
            container.setService(dbServiceName, dbService);

            if (database === "default") {
                container.setAlias("sequelize.db", "sequelize.db.default");
            }
        }

        const modelsDefinitions = container.getServicesTags("sequelize.model.definition");

        modelsDefinitions.map(({ id, tag }) => {
            const { model, database, service } = tag.getData();
            const modelService = new Service(new Factory("sequelize.registry", "registerModel"));
            modelService.setArguments([database || "default", model, _service(id)]);
            modelService.addTag(new Tag("sequelize.model", { model, database }));

            if (service) {
                container.setService(service, modelService);
            }
        });
    }

    async boot(container) {
        const registry = await container.get("sequelize.registry");
        registry.setupAssociations();
    }
}
