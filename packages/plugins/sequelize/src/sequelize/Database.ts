import * as _ from "lodash";
import { Sequelize, DefineModelAttributes, Options as SequelizeOptions, SyncOptions, Model } from "sequelize";

/**
 * A Sequelize database
 */
export class Database {
    /**
     * Name of the database
     */
    protected name: string;

    /**
     * The sequelize corresponding instance
     */
    protected instance: Sequelize;

    /**
     * List of declared model indexed by models names
     */
    protected models: { [name: string]: Model<any, any> };

    /**
     * List of model definitions
     */
    protected definitions: { [name: string]: any };

    constructor(name: string, instance: Sequelize) {
        this.name = name;
        this.instance = instance;
        this.models = {};
        this.definitions = {};
    }

    /**
     * Register a new model with given name based on definition
     * @param name
     * @param definition
     */
    registerModel(name, definition: any) {
        this.definitions[name] = definition;
        const { schema, options, onDefine, ...metas } = definition;

        let model = this.instance.define(name, schema);

        if (onDefine) {
            onDefine(model);
        }

        this.enhanceModel(model);
        // @ts-ignore
        model.setMetas(metas || {});
        // @ts-ignore
        this.models[name] = model;

        return model;
    }

    /**
     * Get all models
     */
    getModels() {
        return this.models;
    }

    /**
     * Get a model by name
     *
     * @param name
     */
    getModel(name) {
        const model = this.models[name];
        if (!model) {
            throw new Error(
                `Model ${name} on Sequelize database ${this.name} not found\nAvailable models: ${_.keys(this.models).join(", ")}`
            );
        }

        return model;
    }

    enhanceModel(model) {
        model.metas = {};

        model.addMeta = function(path, value) {
            _.set(this.metas, path, value);
        }.bind(model);

        model.setMetas = function(metas) {
            this.metas = metas;
        }.bind(model);

        model.getMeta = function(path) {
            return _.get(this.metas, path);
        }.bind(model);
    }

    /**
     * Setup associations for models
     */
    setupAssociations() {
        const models = this.getModels();

        for (let name in models) {
            if (this.definitions[name] && this.definitions[name].associations) {
                this.definitions[name].associations(this.getModel(name), models);
            }
        }
    }

    /**
     * Synchronise the database
     * @param options
     */
    async sync(options: SyncOptions = { alter: true }) {
        return this.instance.sync(options);
    }
}
