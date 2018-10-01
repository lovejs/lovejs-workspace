import * as _ from "lodash";
import { GraphType, GraphInput } from "@lovejs/graphql";
import { SequelizeStatic, Model, DefineAttributeColumnOptions } from "sequelize";

export type GraphqlResolver = (...args) => any;

export interface GraphqlMeta {
    /**
     * What is the property graph type
     */
    type?: string;

    /**
     * Is the property required
     */
    required?: boolean;

    /**
     * Additionnals properties
     */
    properties?: { [name: string]: string };

    /**
     * Additionnals resolvers
     */
    resolvers?: { [name: string]: GraphqlResolver };
}

export interface GraphqlOptions {
    scope?: string;
    withAssociation?: boolean;
}

export interface GraphqlInputOptions extends GraphqlOptions {
    /**
     * Override the default name
     */
    name?: string;

    /**
     * A list of additionnals properties
     */
    properties?: { [name: string]: string };

    /**
     * If set, will exclude all properties or resolvers from the list
     */
    exclude?: string[];

    /**
     * If set, will only include properties and resolvers from the list
     */
    include?: string[];
}

export interface GraphqlTypeOptions extends GraphqlInputOptions {
    /**
     * A list of additionnals resolvers
     */
    resolvers?: { [name: string]: GraphqlResolver };
}

export interface ModelExtended extends Model<any, any> {
    rawAttributes: any;
    associations: any;
    getMeta: (meta) => any;
}

/**
 * Helper to convert sequelize type to graphql type
 */
export class Graphqlizer {
    protected Sequelize: SequelizeStatic;
    protected models: { [name: string]: ModelExtended };

    constructor(Sequelize: SequelizeStatic, models) {
        this.Sequelize = Sequelize;
        this.models = models;
    }

    /**
     * Get a model by name
     *
     * @param modelName
     */
    getModel(modelName: string) {
        if (!this.models[modelName]) {
            throw new Error(`Graphqlizer error : model ${modelName} not found in ${_.keys(this.models).join(", ")}`);
        }

        return this.models[modelName];
    }

    /**
     * Get the corresponding Graphql type for given model
     * @param modelName
     * @param param1
     */
    getGraphqlType(
        modelName: string,
        { scope = "default", name, properties, resolvers, exclude, include }: GraphqlTypeOptions
    ): GraphType | false {
        let gql = this.getGraphql(modelName, scope, true);
        if (!gql) {
            return false;
        }

        let { gqlType, gqlProperties, gqlResolvers } = gql;

        if (exclude) {
            gqlProperties = _.omit(gqlProperties, _.isArray(exclude) ? exclude : [exclude]);
            gqlResolvers = _.omit(gqlResolvers, _.isArray(exclude) ? exclude : [exclude]);
        }

        if (include) {
            gqlProperties = _.pick(gqlProperties, _.isArray(include) ? include : [include]);
            gqlResolvers = _.pick(gqlResolvers, _.isArray(include) ? include : [include]);
        }

        _.merge(gqlProperties, properties);
        _.merge(gqlResolvers, resolvers);

        const type = new GraphType();

        type.setName(name || gqlType);
        type.setProperties(gqlProperties);
        type.setResolvers(gqlResolvers);

        return type;
    }

    /**
     *
     * @param modelName
     * @param param1
     */
    getGraphqlInput(modelName: string, { scope = "default", name, properties, exclude, include }: GraphqlInputOptions): GraphInput | false {
        let gql = this.getGraphql(modelName, scope);
        if (!gql) {
            return false;
        }

        let { gqlType, gqlProperties } = gql;

        if (exclude) {
            gqlProperties = _.omit(gqlProperties, _.isArray(exclude) ? exclude : [exclude]);
        }

        if (include) {
            gqlProperties = _.pick(gqlProperties, _.isArray(include) ? include : [include]);
        }

        _.merge(gqlProperties, properties);

        const input = new GraphInput();
        input.setName(name || `${gqlType}Input`);
        input.setProperties(gqlProperties);

        return input;
    }

    /**
     *
     * @param modelName
     * @param param1
     * @param withAssociation
     */
    protected getGraphql(modelName: string, scope = "default", withAssociation: boolean = false) {
        const model = this.getModel(modelName);
        const graphql = model.getMeta("graphql");

        if (graphql === undefined) {
            return false;
        }

        const gqlType: string = graphql.type || modelName;
        const gqlProperties = {};
        const gqlResolvers = {};

        const properties = model.rawAttributes;
        for (let property in properties) {
            const fieldOptions = properties[property];
            if (fieldOptions.graphql !== undefined) {
                const graphqlOptions = this.normalizeFieldOption(fieldOptions.graphql);
                if (!scope || graphqlOptions.scopes.includes(scope.toLowerCase())) {
                    const isRequired = this.getPropertyRequired(graphqlOptions, fieldOptions);
                    const type = this.getPropertyType(property, graphqlOptions, fieldOptions);

                    gqlProperties[property] = `${type}${isRequired ? "!" : ""}`;
                }
            }
        }

        if (withAssociation) {
            const associations = model.associations || {};
            for (let associationName in associations) {
                const association = associations[associationName];
                const associationOptions = association.options;

                if (associationOptions.graphql !== undefined) {
                    const graphqlOptions = this.normalizeAssociationOption(associationOptions.graphql);
                    const target = association.target;
                    const targetType = graphqlOptions.type || target.getMeta("graphql.type");
                    if (!targetType) {
                        throw new Error("The graphql type for association ");
                    }
                    if (targetType) {
                        const isAssociationMultiple = association.isMultiAssociation === true;
                        const associationName = isAssociationMultiple ? association.options.name.plural : association.options.name.singular;
                        const propertyName = graphqlOptions.name || associationName;
                        const getterName = `get${_.upperFirst(associationName)}`;

                        gqlProperties[propertyName] = isAssociationMultiple ? `[${targetType}]` : targetType;
                        gqlResolvers[propertyName] = this.getGetterResolver(getterName);
                    }
                }
            }
        }

        if (graphql.properties) {
            _.merge(gqlProperties, graphql.properties);
        }

        if (graphql.resolvers) {
            _.merge(gqlResolvers, graphql.resolvers);
        }

        return { gqlType, gqlProperties, gqlResolvers };
    }

    normalizeFieldOption(options) {
        if (options === true) {
            options = {};
        }
        _.defaults(options, {
            name: false,
            scopes: ["default"],
            type: false
        });

        if (_.isString(options.scopes)) {
            options.scopes = [options.scopes];
        }

        return options;
    }

    normalizeAssociationOption(options) {
        if (options === true) {
            options = {};
        }
        _.defaults(options, {
            name: false,
            scopes: ["default"],
            type: false
        });

        if (_.isString(options.scopes)) {
            options.scopes = [options.scopes];
        }

        return options;
    }

    getGetterResolver(method) {
        return async parent => await parent[method]();
    }

    /**
     * Resolve a property graphql type based on column or meta
     * @param property
     * @param graphql
     * @param sequelize
     */
    getPropertyType(property: string, graphql: GraphqlMeta, sequelize) {
        if (property === "id") {
            return "ID";
        }

        if (graphql.type) {
            return graphql.type;
        }

        return this.sequelizeToGraphql(sequelize.type);
    }

    /**
     * Check if the given graphql meta indicate a required property
     * @param property
     * @param graphql
     * @param sequelize
     */
    getPropertyRequired(graphql: GraphqlMeta, sequelize: DefineAttributeColumnOptions) {
        if (graphql.required === true) {
            return true;
        }

        if (sequelize.primaryKey === true) {
            return true;
        }

        if (sequelize.allowNull === false) {
            return true;
        }

        return false;
    }

    /**
     * Transform a sequelize type into a graphql type
     */
    sequelizeToGraphql(sequelizeType) {
        const key = sequelizeType.key;

        switch (key) {
            case "STRING":
            case "CHAR":
            case "TEXT":
                return "String";
            case "TINYINT":
            case "SMALLINT":
            case "MEDIUMINT":
            case "INTEGER":
            case "BIGINT":
                return "Int";
            case "NUMBER":
            case "FLOAT":
            case "DECIMAL":
            case "REAL":
            case "DOUBLE":
            case "NUMERIC":
                return "Float";
            case "JSON":
            case "JSONB":
                return "JSON";
            case "BOOLEAN":
                return "Boolean";
            case "TIME":
            case "DATE":
            case "DATEONLY":
            case "NOW":
                return "DateTime";
            case "ARRAY":
                let subtype = this.sequelizeToGraphql(sequelizeType.type);
                return `[${subtype}]`;
                break;
            default:
                throw new Error(`Unable to translate sequelize type ${key} into GraphQL type`);
        }
    }
}
