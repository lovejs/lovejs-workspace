import { Command, Container } from "@lovejs/components";

export default class DebugMiddlewaresCommand extends Command {
    protected container: Container;

    constructor(container) {
        super();
        this.container = container;
    }

    getOutputStyles() {
        return {
            serviceId: { fg: "#DB49AC", style: "bold" },
            method: { style: "italic" },
            path: "cyanBright",
            header: { fg: "whiteBright", style: ["bold"] },
            label: { bg: [249, 217, 119], fg: "#000", style: ["bold"], transform: v => ` ${v} ` }
        };
    }

    register(program) {
        program
            .command("http:middlewares:list")
            .description("Return list of availables middlewares")
            .action(this.execute.bind(this));
    }

    execute() {
        this.output.writeln("list");
    }
}
