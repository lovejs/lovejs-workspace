import { Plugin } from "@lovejs/framework";

export * from "./Cupidon";

export default class CupidonPlugin extends Plugin {
    async registerDefinitions(container) {
        await container.loadDefinitions(this.getPluginDir("/_framework/services/services.yml"));
    }

    async boot(container, isCli) {
        if (isCli) {
            return;
        }

        const cupidon = await container.get("cupidon");
        const server = this.get("server", "http.server");
        cupidon.attachToServer(await container.get(server));
        await cupidon.listen();
    }
}
