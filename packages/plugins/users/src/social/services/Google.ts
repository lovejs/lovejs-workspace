import * as verifier from "google-id-token-verifier";

export class Google {
    protected settings;

    constructor(settings) {
        this.settings = settings;
    }

    async getCurrentUser(token) {
        return new Promise((resolve, reject) => {
            var clientId = this.settings.get("google.tokenVerifierClientId");

            console.log("Attempt to verify token with : ", clientId, " & ", token);

            verifier.verify(token, clientId, function(err, tokenInfo) {
                console.log("Token info are: ", tokenInfo);
                if (err) {
                    return reject(err);
                }

                return resolve({ data: tokenInfo, token: "temp" });
            });
        });
    }

    async getProfile(access_token) {
        return await this.getCurrentUser(access_token);
    }
}
