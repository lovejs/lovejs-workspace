export class PathParameterExtension {
    register(ContextClass) {
        return class extends ContextClass {
            get params() {
                return this.getPathParameters();
            }

            getPathParameter(name) {
                return this.getAttribute(`_matchers.path.${name}`);
            }

            getPathParameters() {
                return this.getAttribute(`_matchers.path`);
            }
        };
    }
}
