import * as jwt from "jsonwebtoken";

export class JwtTokenProvider {
    protected secret;
    protected options;

    constructor(options) {
        this.secret = options.secretOrKey;
        this.options = {
            sign: {},
            verify: {}
        };
    }

    async getToken(userIdentifier) {
        return await this.sign({ user: userIdentifier });
    }

    async getData(token) {
        const decoded = await this.verify(token);
        return decoded ? decoded : false;
    }

    async sign(payload) {
        return new Promise((resolve, reject) => {
            jwt.sign(payload, this.secret, this.options.sign, (err, token) => {
                return err ? reject(err) : resolve(token);
            });
        });
    }

    async verify(token) {
        return new Promise((resolve, reject) => {
            jwt.verify(token, this.secret, this.options.verify, (err, decoded: { user: any }) => {
                return err ? reject(err) : resolve(decoded);
            });
        });
    }
}
