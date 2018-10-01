import * as _ from "lodash";
import { Command, CommandsProvider } from "@lovejs/components/command";

export class DatabaseCommand implements CommandsProvider {
    protected registry;
    protected prefix;

    constructor(registry) {
        this.registry = registry;
        this.prefix = "sequelize:database";
    }

    getCommands() {
        const cmdSync = new Command(`${this.prefix}:sync`, this.sync.bind(this), `Synchronise the database with the current model`)
            .option("-d, --database [db]", "Use following database (default: 'default')")
            .option("-a, --alter", "Try to synchronize database with alter statements instead of DROP / CREATE", false)
            .option("-f, --force", "Force database synchronisation (DROP TABLE)", false)
            .option("-m, --model", "Synchronise only specified model", false);

        const cmdCreate = new Command(`${this.prefix}:create`, this.create.bind(this), `Create the database`).option(
            "-d, --database [db]",
            "Use following database (default: 'default')"
        );

        const cmdDrop = new Command(`${this.prefix}:drop`, this.drop.bind(this), `Drop the specified database`);

        const cmdList = new Command(`${this.prefix}:list`, this.list.bind(this), `List the configured databases`);

        return [cmdSync, cmdCreate, cmdDrop, cmdList];
    }

    async sync({ options: { database, force, alter, model } }, { logger, output }) {
        database = database || "default";
        let target = this.registry.getDatabase(database);
        if (model) {
            target = target.getModel(model);
        }

        console.log(`Synchronise database ${database} ${model ? model : ""} with ${force ? "force" : ""}${alter ? "alter" : ""}`);

        return target.sync({ alter, force });
    }

    /**
     * @see https://github.com/sequelize/cli/blob/master/src/commands/database.js
     */
    async create() {
        throw new Error("Not implemented yet");
    }

    async drop() {
        throw new Error("Not implemented yet");
    }

    async list(input, output) {
        _.each(this.registry.getDatabases(), (db, dbName) => {
            console.log("- ", dbName);
        });
    }
}
