import * as _ from "lodash";
import { Command, Container } from "@lovejs/components";

export class DebugRouter extends Command {
    protected container: Container;

    constructor(container) {
        super();
        this.container = container;
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

    register(program) {
        program
            .command("http:router:routes")
            .description("Return the list of routes from the router")
            .action(this.execute.bind(this));
    }

    async execute() {
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

        this.output.table(rows);
    }
}
