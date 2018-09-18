import * as program from "caporal";

export class Cli {
    protected program: any;

    constructor(version, commands = []) {
        const v = `❤️  LoveJs v${version}`;
        this.program = program.version(v).description(this.love());

        for (let command of commands) {
            this.registerCommand(command);
        }
    }

    registerCommand(command) {
        command.register(this.program);
    }

    love() {
        return (
            "\n .-.-.  .-.-.  .-.-.  .-.-.  .-.-.  .-.-." +
            "\n( L .' ( o .' ( v .' ( e .' ( J .' ( S .'" +
            "\n `.(    `.(    `.(    `.(    `.(    `.(  "
        );
    }

    async execute(args) {
        await this.program.parse(args);
    }
}
