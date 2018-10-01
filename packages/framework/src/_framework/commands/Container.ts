import * as _ from "lodash";
import * as path from "path";

import { Command, CommandInput, CommandOutput, CommandsProvider } from "@lovejs/components/command";
import { Container } from "@lovejs/components/dependency_injection";

/**
 * Command to display the list of services & parameters in the container
 */
export class DebugContainerCommand implements CommandsProvider {
    /**
     * Services container
     */
    protected container: Container;

    /**
     * Project directory
     */
    protected projectDir: string;

    constructor(container, projectDir) {
        this.container = container;
        this.projectDir = projectDir;
    }

    getCommands() {
        const serviceExecute = new Command(
            "container:service:execute",
            this.executeServiceExecute.bind(this),
            "Execute a service form the container"
        );
        serviceExecute.argument("<service>", "Service to call");
        serviceExecute.argument("[method]", "Service method to call");

        return [
            new Command("container:services:list", this.executeServicesList.bind(this), "Return list of services from the container"),
            serviceExecute
        ];
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

    async executeServicesList(input: CommandInput, output: CommandOutput) {
        let services = this.container.getServices();
        services = _(services)
            .toPairs()
            .sortBy(0)
            .fromPairs()
            .value();

        const rows = [];
        rows.push(["[header]Service[/header]", "[header]Type[/header]", "[header]Description[/header]"]);
        _.each(services, (service, id) => {
            let module = service.getModule();
            let factory = service.getFactory();
            let alias = service.getAlias();
            let from, type, creation;

            if (module) {
                if (_.isString(module)) {
                    type = "Module";
                    from = `[path]${path.relative(this.projectDir, module)}[/path]`;
                } else {
                    type = "Instance";
                    from = "N/A";
                }
            } else if (factory) {
                type = "Factory";
                from = `[serviceId]${factory.getService()}.[method]${factory.getMethod()}()[/method][/serviceId]`;
            } else if (alias) {
                type = "Alias";
                from = `[serviceId] ==> s${alias}[/serviceId]`;
            } else {
                type = "Unknow";
                from = "Unknow";
            }

            rows.push([`[serviceId]${id}[/serviceId]`, `[label]${type}[/label]`, from]);
        });

        output.table(rows);
    }

    async executeServiceExecute({ args: { service, method } }, { output }) {
        const instance = await this.container.get(service);
        const res = method ? await instance[method].apply(instance) : instance();
        output.writeln(res);
    }
}
