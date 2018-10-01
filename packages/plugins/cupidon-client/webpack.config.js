const path = require("path");
const HtmlWebPackPlugin = require("html-webpack-plugin");

const context = __dirname;
const localPath = target => path.resolve(context, target);

module.exports = {
    context,
    target: "web",
    entry: {
        main: localPath("src/index.js")
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)?$/,
                exclude: /node_modules\/(?!@lovejs\/cupidon)/,
                use: {
                    loader: "babel-loader",
                    options: {
                        babelrc: true,
                        extends: path.join(__dirname + "/.babelrc"),
                        cacheDirectory: true
                    }
                }
            },
            {
                test: /\.html$/,
                use: [
                    {
                        loader: "html-loader",
                        options: { minimize: true }
                    }
                ]
            },
            {
                test: /\.(png|jpg|gif|svg)$/,
                use: [
                    {
                        loader: "file-loader",
                        options: {}
                    }
                ]
            },
            {
                test: /\.css$/,
                use: ["style-loader", "css-loader"]
            }
        ]
    },
    output: {
        filename: "[name].bundle.js",
        chunkFilename: "[name].bundle.js",
        publicPath: "./"
    },
    resolve: {
        modules: [localPath("src"), "node_modules"],
        extensions: [".js", ".jsx", ".css", ".json", ".gql", ".graphql", ".yaml", ".yml"],
        alias: {}
    },
    devServer: {
        contentBase: localPath("dist"),
        historyApiFallback: true
    },
    plugins: [
        new HtmlWebPackPlugin({
            template: localPath("src/index.html"),
            filename: "./index.html"
        })
    ]
};
