import * as _ from "lodash";
import { Command, CommandsProvider } from "@lovejs/components/command";

export class ModelsCommand implements CommandsProvider {
    protected registry;

    constructor(registry) {
        this.registry = registry;
    }

    getCommands() {
        const cmdList = new Command("sequelize:models:list", this.list.bind(this), "List defined sequelize models").option(
            "-d, --database [db]",
            "Use following database",
            "default"
        );
        return cmdList;
    }

    async list({ options: { database } }, output) {
        const db = this.registry.getDatabase(database);

        console.log("Models: ");
        _.each(db.getModels(), (model, modelName) => {
            console.log("- ", modelName);
        });
    }
}
