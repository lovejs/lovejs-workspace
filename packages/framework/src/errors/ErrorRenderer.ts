import * as _ from "lodash";
import * as path from "path";
import * as pretty from "pretty-exceptions/lib";
import { Output, ConfigurationError, DiResolutionError, DiModuleResolutionError, ValidationError } from "@lovejs/components";
import { KernelError } from "../kernel";
import { PluginError } from "../plugin";

const output = new Output();

export const ErrorRenderer = (error, debug = false, depth = 0) => {
    const errorName = error.name;

    output.write(`${depth}. [error]${errorName}[/error] `);

    handleError(error);

    if (error.error || error.wrappedError) {
        ErrorRenderer(error.error || error.wrappedError, debug, ++depth);
    }
};

const handleError = error => {
    switch (true) {
        case error instanceof KernelError:
            output.writeln(`Kernel error at step [info]${error.getStep()}[/info]`);
            break;
        case error instanceof PluginError:
            output.writeln(`Plugin error loading plugin [success]${error.getPluginName()}[/success]`);
            break;
        case error instanceof ConfigurationError:
            const errorFile = error.getFile() ? `in file [success]${path.relative(process.cwd(), error.getFile())}[/success]` : "";
            const errorPath = error.getPath() ? `at path [info]${error.getPath()}[/info]` : "";
            output.writeln(`Configuration error ${errorFile} ${errorPath}`);
            break;
        case error instanceof DiResolutionError:
            output.writeln(`Service resolution error for service [success]${error.getService()}[/success]`);
            break;
        case error instanceof DiModuleResolutionError:
            output.writeln(`Module resolution error for module [success]${error.getModule()}[/success]`);
            break;
        case error instanceof ValidationError:
            const errorRows = [];
            for (let i = 0; i < error.errors.length; i++) {
                const _error = error.errors[i];
                const label = _.template(_error.message);
                errorRows.push([_error.dataPath, label(_error.params.errors[0].params)]);
            }
            output.table(errorRows);
            break;
        default:
            const options = {
                source: true,
                native: true,
                color: true,
                cwd: process.cwd()
            };

            console.error(pretty(error, options));
    }
};
