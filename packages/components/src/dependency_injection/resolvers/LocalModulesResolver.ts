import * as _ from "lodash";
import * as path from "path";
import { ModulesResolverInterface, DiModuleResolutionError } from "..";

/**
 * Resolve string to modules
 * If a targetPath is specified, the module resolver will resolve the targetPath of the module
 * otherwise, given a module path like MyModule, it will try to return in this order:
 *     1. require("MyModule").default
 *     2. require("MyModule").MyModule
 *     3. require("MyModule")
 */
export class LocalModulesResolver implements ModulesResolverInterface {
    async resolve(internalPath: string, parentPath?: string) {
        const [modulePath, targetPath] = internalPath.split("::");

        const isAbsolute = path.isAbsolute(modulePath);
        const paths = eval(`require.resolve.paths(__filename)`).slice(0);

        if (!isAbsolute && parentPath) {
            paths.unshift(parentPath);
        }

        let filePath;
        try {
            filePath = eval(`require.resolve(modulePath, { paths })`);
        } catch (e) {
            throw new DiModuleResolutionError(`Module not found for "${modulePath}"`, { module: modulePath, directories: paths });
        }

        const module = require(filePath);

        if (targetPath) {
            if (!_.has(module, targetPath)) {
                throw new DiModuleResolutionError(`Module found for "${modulePath}", but nothing found at target path ${targetPath}`, {
                    module: modulePath
                });
            }

            return _.get(module, targetPath);
        } else {
            if (_.has(module, "default")) {
                return module.default;
            }

            const baseName = path.basename(modulePath);
            if (_.has(module, baseName)) {
                return module[baseName];
            }

            return module;
        }
    }
}
