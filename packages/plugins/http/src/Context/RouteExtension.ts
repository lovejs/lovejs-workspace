export class RouteExtension {
    register(ContextClass) {
        return class extends ContextClass {
            getRoute() {
                return this.getAttribute(`_route`);
            }
        };
    }
}
