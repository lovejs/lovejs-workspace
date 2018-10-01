export class UserExtension {
    protected userExtractor;

    constructor(userExtractor) {
        this.userExtractor = userExtractor;
    }

    register(ContextClass) {
        const extractor = this.userExtractor;

        return class extends ContextClass {
            async getUser() {
                if (!this.hasAttribute("user")) {
                    const user = await extractor.getUser(this.getRequest());
                    this.setAttribute("user", user);
                }

                return this.getAttribute("user");
            }
        };
    }
}
