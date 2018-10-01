import * as _ from "lodash";

export class UserExtractor {
    protected repository;
    protected tokenProvider;
    protected tokenExtractor;

    constructor(repository, tokenProvider, tokenExtractor) {
        this.repository = repository;
        this.tokenProvider = tokenProvider;
        this.tokenExtractor = tokenExtractor;
    }

    async getUser(request) {
        const token = this.tokenExtractor.extractToken(request);
        if (!token) {
            return false;
        }

        const userId = await this.tokenProvider.getData(token);

        if (!userId) {
            return false;
        }

        return await this.repository.getUser(userId);
    }
}
