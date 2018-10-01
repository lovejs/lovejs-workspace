import { SequelizeStatic, DefineModelAttributes, Options as SequelizeOptions } from "sequelize";
import { Database } from "./Database";

export class Registry {
    protected Sequelize: SequelizeStatic;
    protected databases: { [name: string]: Database };
    protected logger;

    constructor(Sequelize, databases, logger) {
        this.Sequelize = Sequelize;
        this.databases = {};
        this.logger = logger;

        for (let name in databases) {
            this.registerDatabase(name, databases[name]);
        }
    }

    /**
     * Get the sequelize library
     */
    getLibrary() {
        return this.Sequelize;
    }

    /**
     * Get a database by name
     *
     * @param name
     */
    getDatabase(name: string) {
        const db = this.databases[name];
        if (!db) {
            throw new Error(`Sequelize database ${name} not found`);
        }

        return db;
    }

    /**
     * Return the list of databases
     */
    getDatabases() {
        return this.databases;
    }

    /**
     * Register a new database
     *
     * @param name The database internal name
     * @param settings The sequelize options
     */
    registerDatabase(name, settings: SequelizeOptions | string) {
        let uri, options;

        if (typeof settings === "string") {
            uri = settings;
            options = {};
        } else {
            options = settings;
        }

        if (this.logger) {
            options.logging = error => {
                if (error instanceof Error) {
                    this.logger.error({ database: name, message: error.message, level: "error" });
                } else {
                    this.logger.debug({ database: name, message: error });
                }
            };
        }
        const db = uri ? new this.Sequelize(uri, options) : new this.Sequelize(options);

        this.databases[name] = new Database(name, db);
    }

    /**
     * Register a model on a database
     *
     * @param database
     * @param name
     * @param definition
     */
    registerModel(databaseName: string, modelName: string, modelDefinition: DefineModelAttributes<any>) {
        return this.getDatabase(databaseName).registerModel(modelName, modelDefinition);
    }

    /**
     * Setup associations on the configured databases
     */
    async setupAssociations() {
        for (let db in this.databases) {
            this.databases[db].setupAssociations();
        }
    }
}
