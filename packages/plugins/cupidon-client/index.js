module.exports = options => {
    const webpack = require("webpack");
    const getConfiguration = require("./configuration");

    const configuration = getConfiguration(options);

    return new Promise((resolve, reject) => {
        const compiler = webpack(configuration, (err, stats) => {
            if (err) {
                console.error(err.stack || err);
                if (err.details) {
                    console.error(err.details);
                }
                return reject(err);
            }

            const info = stats.toJson();

            if (stats.hasErrors()) {
                console.error(info.errors);
                return reject(new Error("Compilation errors"));
            }

            if (stats.hasWarnings()) {
                console.warn(info.warnings);
            }

            return resolve(stats);
        });

        const watching = compiler.watch({ poll: true }, (err, stats) => {
            // Print watch/build result here...
            console.log(stats);
        });
    });
};
