import { Command, CommandInput, CommandOutput, CommandsProvider } from "@lovejs/components/command";

export default class SchemaCommand implements CommandsProvider {
    protected schemaBuilder;

    constructor(schemaBuilder) {
        this.schemaBuilder = schemaBuilder;
    }

    getCommands() {
        return new Command("graphql:schema:dump", this.execute.bind(this), "Dump the current graphql schema");
    }

    async execute(input: CommandInput, output: CommandOutput) {
        const { typeDefs } = await this.schemaBuilder.getTypesAndResolvers();

        output.writeln(typeDefs);
    }
}
