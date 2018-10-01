const fs = require("fs");
const webpack = require("webpack");
const VirtualModulePlugin = require("virtual-module-webpack-plugin");

module.exports = ({ outputPath, extensions }, configuration = false) => {
    if (!configuration) {
        configuration = require("./webpack.config");
    }

    configuration.mode = "development";
    configuration.output.path = outputPath;
    configuration.plugins.push(
        new webpack.DefinePlugin({
            __CUPIDON_EXTENSIONS__: JSON.stringify(extensions)
        })
    );

    let imports = [];
    let components = [];

    for (let extension of extensions) {
        const componentPath = extension.component;
        const componentName = extension.name;

        configuration.plugins.push(
            new VirtualModulePlugin({
                moduleName: `src/extensions/${componentName}.js`,
                contents: fs.readFileSync(componentPath).toString()
            })
        );
        imports.push(`import ${componentName} from 'extensions/${componentName}';`);
        components.push(componentName);
    }

    const indexContent = `   
${imports.join("\n")}
const components = {
    ${components.join(",\n")}
};
export default components; 
    `;

    configuration.plugins.push(
        new VirtualModulePlugin({
            moduleName: `src/extensions/index.js`,
            contents: indexContent
        })
    );

    return configuration;
};
