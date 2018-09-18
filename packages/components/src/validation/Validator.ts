import * as Ajv from "ajv";
import * as ajvErrors from "ajv-errors";
import * as ajvKeywords from "ajv-keywords";

import { ValidatorInterface, ValidationError } from "./index";

import * as keywords from "./validators";

const ajvInstance = new Ajv({ useDefaults: true, coerceTypes: true, allErrors: true, jsonPointers: true, $data: true });
ajvErrors(ajvInstance);
ajvKeywords(ajvInstance, undefined);

for (let name in keywords) {
    ajvInstance.addKeyword(name, keywords[name]);
}

export class Validator implements ValidatorInterface {
    protected cache: { [k: string]: Ajv.ValidateFunction } = {};

    /**
     * Register a class instance, in order to test instanceof in shcema
     * @param name
     * @param classDef
     */
    registerInstanceClass(name: string, classDef): void {
        var instanceofDefinition = ajvKeywords.get("instanceof").definition;

        instanceofDefinition.CONSTRUCTORS[name] = classDef;
    }

    /**
     * Get (or create) the validator function from cache
     * @param schema
     */
    protected getValidator(schema: object): Ajv.ValidateFunction {
        const key = JSON.stringify(schema);
        if (!this.cache[key]) {
            try {
                this.cache[key] = ajvInstance.compile(schema);
            } catch (error) {
                console.error(schema);
                throw new Error("Error compiling validation schema");
            }
        }

        return this.cache[key];
    }

    /**
     * Validate the data based given json schema
     *
     * @param data The data to validate
     * @param schema The json schema to validate data against
     * @throw ValidationError if schema is not valid
     */
    async validate(data: any, schema: object) {
        const validator = this.getValidator(schema);

        if (await validator(data)) {
            return data;
        } else {
            throw new ValidationError(validator.errors);
        }
    }
}
