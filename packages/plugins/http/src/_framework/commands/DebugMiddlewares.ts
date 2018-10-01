import { Command, CommandsProvider } from "@lovejs/components/command";
import { Container } from "@lovejs/components/dependency_injection";

export default class DebugMiddlewaresCommand implements CommandsProvider {
    protected container: Container;

    constructor(container) {
        this.container = container;
    }

    getCommands() {
        return new Command("http:middlewares:list", this.execute.bind(this), "Return list of availables middlewares");
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

    execute(input, output) {
        output.writeln("list middlewares");
    }
}
