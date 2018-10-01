import { GraphObject } from "./GraphObject";
import { GraphInterface } from "./GraphInterface";
import { GraphEnum } from "./GraphEnum";
import { GraphUnion } from "./GraphUnion";
import { GraphType } from "./GraphType";
import { GraphInput } from "./GraphInput";
import { GraphQuery } from "./GraphQuery";
import { GraphMutation } from "./GraphMutation";

import * as _ from "lodash";

/**
    Permettre de prefixer globalement dans une extension
*/

export class GraphExtension {
    protected enums;
    protected unions;
    protected interfaces;
    protected types;
    protected queries;
    protected mutations;
    protected inputs;
    protected ownMiddlewares;
    protected current;
    constructor() {
        this.enums = [];
        this.unions = [];
        this.interfaces = [];
        this.types = [];
        this.queries = [];
        this.mutations = [];
        this.inputs = [];
        this.ownMiddlewares = {};
        this.current = false;
    }

    getPrefix() {
        return "";
    }

    ref(name, isArray = false) {
        let p = isArray ? "[" : "";
        let s = isArray ? "]" : "";
        let prefix = name => `${p}${this.getPrefix()}${name}${s}`;

        if (_.isArray(name)) {
            return name.map(n => prefix(n));
        } else {
            return prefix(name);
        }
    }

    async registerObjects() {}

    getMiddlewares() {
        return this.ownMiddlewares;
    }

    getEnums() {
        return this.enums;
    }

    getInterfaces() {
        return this.interfaces;
    }

    getTypes() {
        return this.types;
    }

    getUnions() {
        return this.unions;
    }

    getInputs() {
        return this.inputs;
    }

    getQueries() {
        return this.queries;
    }

    getMutations() {
        return this.mutations;
    }

    addEnum(name) {
        return this.add(new GraphEnum(), name);
    }

    addUnion(name) {
        return this.add(new GraphUnion(), name);
    }

    addInterface(name) {
        return this.add(new GraphInterface(), name);
    }

    addType(name) {
        return this.add(new GraphType(), name);
    }

    addInput(name) {
        return this.add(new GraphInput(), name);
    }

    addQuery(name) {
        return this.add(new GraphQuery(), name);
    }

    addMutation(name) {
        return this.add(new GraphMutation(), name);
    }

    add(instance, name) {
        if (!(instance instanceof GraphObject)) {
            throw new Error(`Attempt to add a non graphql object to the schema extension`);
        }

        if (this.current && !this.current.isComplete()) {
            throw new Error(`Attempt to add anoter graphql object while current one is incomplete`);
        }

        if (name instanceof GraphObject) {
            instance = name;
        } else {
            instance.setName(this.ref(name));
            this.current = instance;
        }

        if (instance instanceof GraphEnum) {
            this.enums.push(instance);
        } else if (instance instanceof GraphUnion) {
            this.unions.push(instance);
        } else if (instance instanceof GraphInterface) {
            this.interfaces.push(instance);
        } else if (instance instanceof GraphType) {
            this.types.push(instance);
        } else if (instance instanceof GraphQuery) {
            instance.setMiddlewares(this.getMiddlewares());
            this.queries.push(instance);
        } else if (instance instanceof GraphMutation) {
            instance.setMiddlewares(this.getMiddlewares());
            this.mutations.push(instance);
        } else if (instance instanceof GraphInput) {
            this.inputs.push(instance);
        } else {
            throw new Error(`Invalid instance provided to schemaExtension`);
        }

        return this;
    }

    callMethod(method, args) {
        if (!this.current) {
            throw new Error(
                `Attempt to call method ${method} while their is no current grapqhl object. You must call addEnum, addInterface, addType, addQuery or addMutation before`
            );
        }

        if (!this.current[method] || !_.isFunction(this.current[method])) {
            throw new Error(`Graphql objects of type ${this.current.constructor.name} don't support method ${method}`);
        }

        this.current[method](...args);
        return this;
    }

    properties(...args: any[]) {
        return this.callMethod("setProperties", args);
    }

    values(...args: any[]) {
        return this.callMethod("setValues", args);
    }

    _interfaces(...args: any[]) {
        return this.callMethod("setInterfaces", args);
    }

    unionTypes(...args: any[]) {
        return this.callMethod("setTypes", args);
    }

    input(properties, dedicatedType = false, name = false) {
        let input = properties;
        if (dedicatedType) {
            input = new GraphInput();
            input.setName(name ? this.ref(name) : `${this.current.getName()}Input`);
            input.setProperties(properties);
        }

        return this.callMethod("setInput", [input]);
    }

    output(properties, dedicatedType = false, name = false) {
        let output = properties;
        if (_.isPlainObject(output) || dedicatedType) {
            output = new GraphType();
            output.setName(name ? this.ref(name) : `${this.current.getName()}Output`);
            output.setProperties(properties);
        }

        return this.callMethod("setOutput", [output]);
    }

    resolverType(...args: any[]) {
        return this.callMethod("setResolverType", args);
    }

    resolver(...args: any[]) {
        return this.callMethod("setResolver", args);
    }

    resolvers(...args: any[]) {
        return this.callMethod("setResolvers", args);
    }

    middlewares(...args: any[]) {
        return this.callMethod("setMiddlewares", args);
    }
}
