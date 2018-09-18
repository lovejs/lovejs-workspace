const sequelize = require("sequelize");

const { Plugin } = require("@lovejs/framework");
const { Factory, Service, Tag, _service } = require("@lovejs/components");

class SequelizePlugin extends Plugin {
    static get sequelize() {
        return sequelize;
    }

    /*
    async getContainerExtension() {
        const extension = new ContainerExtension();
        extension.addDefinition("xxx"),
        extension.addParameter("xxx", "xx");
        extension.addService("xxx", new Service("xxx"));
        extension.addInstance("xxx", xxx");

        return extension;
        const definitions = ["/_framework/services/services.yml"];

        const parameters = {
            "sequelize.databases": this.get("databases")
        };

        if (this.get("graphql")) {
            definitions.push("/_framework/services/graphql.yml");
        }

        if (this.hasPlugin("cupidon")) {
            parameters = {
                ...parameters,
                ["sequelize.cupidon.config"]: this.get("cupidon")
            };
            definitions.push("/_framework/services/cupidon.yml");
        }

        return { definitions, parameters };
    }
    */

    /**
        async getContainerCompilationPass() {
            // xxx stuff after compilation
        }
     */

    async registerServices(container, name, isCli) {
        container.setParameter("sequelize.databases", this.get("databases"));
        await container.loadDefinitions(this.getPluginDir("/_framework/services/services.yml", name));
        if (this.get("graphql")) {
            await container.loadDefinitions(this.getPluginDir("/_framework/services/graphql.yml"));
        }

        if (this.hasPlugin("cupidon")) {
            container.setParameter("sequelize.cupidon.config", this.get("cupidon"));
            await container.loadDefinitions(this.getPluginDir("/_framework/services/cupidon.yml"));
        }
    }

    async afterContainerCompilation(container) {
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

module.exports = SequelizePlugin;
