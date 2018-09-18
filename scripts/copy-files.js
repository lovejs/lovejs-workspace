/* eslint-disable no-console */

const path = require("path");
const fse = require("fs-extra");
const glob = require("fast-glob");

const basePath = process.cwd();
const commonPath = path.resolve(__dirname, "common");
const sourcePath = path.resolve(basePath, "src");
const buildPath = path.resolve(basePath, "build");

const files = ["README.md"];
const commonFiles = glob.sync("*", { cwd: commonPath });
const srcFiles = glob.sync(["src/**/*", "!**/*.(ts|tsx)", "!**/__tests__/**"]);

async function copyFile(from, to) {
    await fse.copy(from, to, { overwrite: true });
    console.log(`Copied ${from} to ${to}`);
}

async function createPackageFile() {
    const packageData = await fse.readFile(path.resolve(basePath, "package.json"), "utf8");
    const { nyc, scripts, devDependencies, workspaces, ...packageDataOther } = JSON.parse(packageData);
    const newPackageData = {
        ...packageDataOther,
        main: "./index.js",
        types: "./index.d.ts",
        private: false
    };
    const packagePath = path.resolve(buildPath, "package.json");

    await fse.writeFile(packagePath, JSON.stringify(newPackageData, null, 2), "utf8");
    console.log(`Created package.json in ${packagePath}`);

    return newPackageData;
}

async function run() {
    // Copy common packages files
    await Promise.all(commonFiles.map(file => copyFile(path.resolve(commonPath, file), path.resolve(buildPath, file))));

    // Copy files from root package
    await Promise.all(files.map(file => copyFile(path.resolve(basePath, file), path.resolve(buildPath, file))));

    // Copy all non typescript file from source folder to build
    await Promise.all(srcFiles.map(file => copyFile(file, path.resolve(buildPath, path.relative(sourcePath, file)))));

    // Create the package.json file
    await createPackageFile();
}

run();
