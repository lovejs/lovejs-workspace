import * as _ from "lodash";
import { ErrorStack } from "../../errors";

export class DiSchemaError extends ErrorStack {
    public file;
    public schemaError;

    constructor(file, schemaError: { dataPath: string; message: string }[]) {
        const lastError = _.last(schemaError);
        const message = `Invalid services definition in ${file ? `file ${file.toString()}` : "object"} at path "${lastError.dataPath}" : ${
            lastError.message
        }`;
        super(message);

        this.file = file;
        this.schemaError = schemaError;
    }
}
