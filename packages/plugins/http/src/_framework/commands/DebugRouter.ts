import * as _ from "lodash";
import { Command, CommandsProvider } from "@lovejs/components/command";
import { Container } from "@lovejs/components/dependency_injection";

export class DebugRouter implements CommandsProvider {
    protected container: Container;

    constructor(container) {
        this.container = container;
    }

    getCommands() {
        return new Command("http:router:routes", this.execute.bind(this), "Return the list of routes from the router");
    }

    getOutputStyles() {
        return {
            route: { fg: "#DB49AC", style: "bold" },
            matcher: "cyanBright",
            middleware: "blueBright",
            params: "redBright",
            header: { fg: "whiteBright", style: ["bold"] },
            label: { bg: [249, 217, 119], fg: "#000", style: ["bold"], transform: v => ` ${v} ` }
        };
    }

    async execute(input, output) {
        const router = await this.container.get("router");
        let routes = router.getRoutes();

        const rows = [];
        rows.push(["[header]Route[/header]", "[header]Matchers[/header]", "[header]Middlewares[/header]"]);
        for (let name in routes) {
            const route = routes[name];

            const matchers = _.map(route.getMatchers(), (v, k) => `[matcher]${k}([params]${v && JSON.stringify(v)}[/params])[/matcher]`);
            const middlewares = _.map(
                route.getMiddlewares(),
                (v, k) => `[middleware]${k}([params]${v && JSON.stringify(v)}[/params])[/middleware]`
            );

            for (let i = 0; i < Math.max(1, matchers.length, middlewares.length); i++) {
                let row = [`[route]${i == 0 ? name : ""}[/route]`, matchers[i] || "", middlewares[i] || ""];
                rows.push(row);
            }
        }

        output.table(rows);
    }
}
