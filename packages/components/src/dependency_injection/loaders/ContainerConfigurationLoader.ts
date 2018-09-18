import * as _ from "lodash";
import * as path from "path";

import { ConfigurationLoader } from "../../configuration";
import { definitionsSchema } from "../schemas/definitions";
import { Argument, Alias, Call, Factory, Service, ServiceCreationType, ServiceProperties, Tag } from "../Definitions";

import { DefinitionsLoaderInterface } from "..";
import { ParametersMap, ServicesMap } from "../Container";

const pathToServiceId = filePath => filePath.split(path.sep).join(".");

const defaultServicesNaming = ({ servicesKey, serviceKey }): string => servicesKey.replace("*", serviceKey);

const defaultServiceDefinition = {
    autowired: true,
    shared: true,
    public: true,
    preloaded: true
};

export interface ServiceDefinition extends ServiceProperties {
    _extends?: boolean;
    parent?: string;
}

export interface ServicesDefinition {
    from: string;
    pattern?: [] | string;
    services?: ServiceDefinition;
}

export class ContainerConfigurationLoader extends ConfigurationLoader implements DefinitionsLoaderInterface {
    constructor(...args) {
        super(...args);

        // @ts-ignore
        // @xxx Find a cleaner way :-/
        this.getValidator().registerInstanceClass("Argument", Argument);

        this.tags = {
            ...this.tags,
            parameter: {
                schema: { type: "string" },
                normalize: async data => new Argument("parameter", data)
            },
            services: {
                schema: { type: "object", errorMessage: { type: "tag 'services' expect an object as argument" } },
                normalize: async data => new Argument("services", data)
            },
            service: {
                schema: {
                    oneOf: [
                        { type: "string" },
                        {
                            type: "object",
                            properties: {
                                name: { oneOf: [{ type: "string" }, { instanceof: "Argument" }] }
                            },
                            required: ["name"]
                        }
                    ]
                },
                normalize: async data => {
                    let service;
                    let options = {};
                    if (_.isPlainObject(data)) {
                        service = data.name;
                        options = _.omit(data, ["name"]);
                    } else if (_.isString(data)) {
                        service = data;
                    }

                    return new Argument("service", service, options);
                }
            },
            file: {
                schema: { type: "string" },
                normalize: async (data, vars) => {
                    const tpl = _.template(data);
                    try {
                        return tpl(vars);
                    } catch (e) {
                        throw new Error(`Error resolving template tag "!file" ${e.message}`);
                    }
                }
            }
        };
    }

    /**
     * @inheritdoc
     */
    async load(filename: string | object): Promise<{ parameters: ParametersMap; services: ServicesMap }> {
        if (typeof filename == "string") {
            return await this.loadFile(filename);
        } else {
            return await this.loadConfig(filename);
        }
    }

    /**
     * @inheritdoc
     */
    getSchema() {
        return definitionsSchema;
    }

    /**
     * Transform the data to process wildcard services
     * @param data
     */
    async transform(data) {
        data = await super.transform(data);

        let services = {};
        for (let definitionId in data.services) {
            const definition = data.services[definitionId];
            if (definitionId.includes("*")) {
                services = { ...services, ...(await this.getServicesFromWildcard(definitionId, definition)) };
            } else {
                services[definitionId] = definition;
            }
        }
        data.services = services;
        return data;
    }

    /**
     * @inheritdoc
     */
    getNormalizers() {
        return [
            ...super.getNormalizers(),
            {
                path: "services.*.alias",
                normalize: async alias => new Alias(alias)
            },
            {
                path: "services.*.factory",
                normalize: async factory => new Factory(factory.service, factory.method)
            },
            {
                path: "services.*.tags",
                normalize: async tags =>
                    _.map(_.isArray(tags) ? tags : [tags], tag => (_.isString(tag) ? new Tag(tag) : new Tag(tag.tag, _.omit(tag, "tag"))))
            },
            {
                path: "services.*.calls",
                normalize: async calls => _.map(calls, call => new Call(call.method, call.args, call.await !== false))
            },
            {
                path: "services",
                normalize: async definitions => _.mapValues(definitions, definition => this.definitionToService(definition))
            }
        ];
    }

    /**
     * Given a services wildcard definition
     * @param definitionId The definition id including the "*"
     * @param definition
     */
    async getServicesFromWildcard(servicesKey: string, definition: ServicesDefinition) {
        const naming = defaultServicesNaming;

        const from: string = (await this.normalizeTags({ from: definition.from })).from;

        const pattern = definition.pattern || "**/*.js";
        const services = definition.services || {};

        const files = await this.pathResolver.resolveImport(from, pattern, from);
        const definitions = {};

        for (let file of files) {
            const serviceModule = file.path;
            const serviceKey = pathToServiceId(file.reldir ? `${file.reldir}.${file.name_stripped}` : file.name_stripped);

            let vars = {
                file,
                servicesKey,
                serviceKey,
                serviceId: ""
            };

            const serviceId = naming({ servicesKey, serviceKey });
            vars.serviceId = serviceId;

            let serviceDefinition = _.isFunction(services) ? services(vars) : _.cloneDeep(services);
            _.defaults(serviceDefinition, defaultServiceDefinition);

            /* Override module only if no generating prop is defined */
            const requiredProps = ["module", "factory", "alias", "parent"];
            if (!_.some(requiredProps, requiredProp => _.includes(_.keys(serviceDefinition), requiredProp))) {
                serviceDefinition.module = serviceModule;
            }

            const normalizedDefinition = await this.normalizeTags(serviceDefinition, "file", vars);

            definitions[serviceId] = normalizedDefinition;
        }

        return definitions;
    }

    /**
     * Transform a definition into a Service
     * @param definition The definition to load
     */
    definitionToService(definition: ServiceDefinition): Service {
        let { parent, _extends, ...rest } = definition;

        const service = new Service(null, rest);

        if (parent) {
            service.setParentId(parent);
        }

        if (_extends) {
            service.setExtends();
        }

        return service;
    }
}
