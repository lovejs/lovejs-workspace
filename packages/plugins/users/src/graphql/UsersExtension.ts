import * as _ from "lodash";
import { GraphExtension } from "@lovejs/graphql";
import { UserError } from "../errors/UserError";

const Endless = new Proxy(
    {},
    {
        get(target, prop) {
            return () => Endless;
        }
    }
);

const handleUserError = async action => {
    try {
        return await action();
    } catch (e) {
        if (e instanceof UserError) {
            return { error: e.toGraphql() };
        } else {
            throw e;
        }
    }
};

export interface UserInterface {
    get: (any?) => any;
    getProfile?: (any?) => any;
}

export type UsersExtensionOptions = {
    types?: string[];
    queries?: string[];
    mutations?: string[];
};

export class UsersExtension extends GraphExtension {
    protected manager;

    protected options: UsersExtensionOptions;

    constructor(manager, options: UsersExtensionOptions = {}) {
        super();
        this.manager = manager;
        this.options = options;
    }

    getOption(key, defaultValue?) {
        return _.get(this.options, key, defaultValue);
    }

    getPrefix() {
        return this.getOption("prefix");
    }

    addType(name) {
        return this.getOption("types").includes(name) ? super.addType(name) : (Endless as this);
    }

    addQuery(name) {
        return this.getOption("queries").includes(name) ? super.addQuery(name) : (Endless as this);
    }

    addMutation(name) {
        return this.getOption("mutations").includes(name) ? super.addMutation(name) : (Endless as this);
    }

    async registerObjects() {
        this.registerTypes();
        this.registerQueries();
        this.registerMutations();
    }

    registerTypes() {
        this.addType("Error").properties({
            operation: "String!",
            type: "String!"
        });

        this.addType("CurrentUser").properties({
            id: "ID!",
            authed: "Boolean!",
            validated: "Boolean",
            token: "String",
            username: "String",
            email: "String",
            email_update: "String",
            time_password_update: "DateTime",
            ...(this.getOption("profile") ? { profile: this.getOption("profile.graphql_type") } : {})
        });

        if (this.getOption("social")) {
            this.addType("SocialConnect").properties({
                service: "String!",
                linked: "Boolean!",
                authed: "Boolean!",
                created: "Boolean!",
                error: "String",
                user: this.ref("CurrentUser")
            });
        }
    }

    registerQueries() {
        this.addQuery("currentUser")
            .output(this.ref("CurrentUser"))
            .resolver(this.resolveCurrentUser.bind(this));

        this.addQuery("emailExists")
            .input({ email: "String!" })
            .output("Boolean")
            .resolver(this.resolveEmailExists.bind(this));

        this.addQuery("isForgotTokenValid")
            .input({ token: "String!" })
            .output("Boolean")
            .resolver(this.resolveIsForgotTokenValid.bind(this));
    }

    registerMutations() {
        this.addMutation("login")
            .input({ email: "String!", password: "String!" })
            .output({ user: this.ref("CurrentUser"), error: this.ref("Error") })
            .resolver(this.resolveLogin.bind(this));

        this.addMutation("register")
            .input(this.getOption("register.graphql_inputs"))
            .output({ user: this.ref("CurrentUser"), error: this.ref("Error") })
            .resolver(this.resolveRegister.bind(this));

        this.addMutation("validate")
            .input({ token: "String!" })
            .output({ user: this.ref("CurrentUser"), error: this.ref("Error") })
            .resolver(this.resolveValidate.bind(this));

        if (this.getOption("social")) {
            this.addMutation("social")
                .input({ service: "String!", access_token: "String!" })
                .resolver(this.resolveSocial.bind(this))
                .output(this.ref("SocialConnect"));
        }

        this.addMutation("forgot")
            .input({ email: "String!" })
            .resolver(this.resolveForgot.bind(this))
            .output({ error: this.ref("Error") });

        this.addMutation("reset")
            .input({ token: "String!", password: "String!" })
            .resolver(this.resolveReset.bind(this))
            .output({ error: this.ref("Error") });

        this.addMutation("logout")
            .output({ error: this.ref("Error") })
            .resolver(this.resolveLogout.bind(this));

        /* Required connected */
        this.addMutation("updatePassword")
            .middlewares({ connected: true })
            .output({ user: this.ref("CurrentUser"), error: this.ref("Error") })
            .input({ password_old: "String!", password_new: "String!" })
            .resolver(this.resolveUpdatePassword.bind(this));

        this.addMutation("updateEmail")
            .middlewares({ connected: true })
            .output({ user: this.ref("CurrentUser"), error: this.ref("Error") })
            .input({ email: "String!" })
            .resolver(this.resolveUpdateEmail.bind(this));

        this.addMutation("updateEmailCancel")
            .middlewares({ connected: true })
            .output({ user: this.ref("CurrentUser"), error: this.ref("Error") })
            .resolver(this.resolveUpdateEmailCancel.bind(this));

        this.addMutation("updateEmailResend")
            .middlewares({ connected: true })
            .output({ user: this.ref("CurrentUser"), error: this.ref("Error") })
            .resolver(this.resolveUpdateEmailResend.bind(this));

        this.addMutation("updateEmailValidate")
            .middlewares({ connected: true })
            .input({ token: "String!" })
            .output({ user: this.ref("CurrentUser"), error: this.ref("Error") })
            .resolver(this.resolveUpdateEmailValidate.bind(this));
    }

    async currentUser(user?: UserInterface, token?: string) {
        let data = user && user.get ? user.get() : {};
        if (token) {
            data.token = token;
        }

        let profile = {};

        if (user && this.getOption("profile") && user.getProfile) {
            profile = { profile: await user.getProfile() };
        }

        const validated = user && user.get("time_confirmed") ? true : false;

        return {
            ...data,
            ...profile,
            id: "current",
            authed: user ? true : false,
            validated
        };
    }

    async connectUser(user) {
        const token = await this.manager.signIn(user);
        return await this.currentUser(user, token);
    }

    /********************************
     ***         REGISTER         ***
     ********************************/
    async resolveRegister(_, data) {
        return await handleUserError(async () => {
            const user = await this.manager.register(data);
            return { user: this.connectUser(user) };
        });
    }

    async resolveValidate(_, { token }) {
        return await handleUserError(async () => {
            const user = this.manager.validate(token);
            return { user: this.connectUser(user) };
        });
    }

    async resolveEmailExists(_, { email }) {
        return await this.manager.getEmailExists(email);
    }

    /********************************
     *** LOGIN / LOGOUT / CURRENT ***
     ********************************/
    async resolveLogin(_, { email, password }) {
        return await handleUserError(async () => {
            const user = await this.manager.authenticate(email, password);
            return { user: this.connectUser(user) };
        });
    }

    async resolveLogout(_, {}) {
        return true;
    }

    async resolveCurrentUser(_, {}, { getUser }) {
        const user = await getUser();
        return await this.currentUser(user);
    }

    /********************************
     ****      SOCIAL STUFF      ****
     ********************************/
    async resolveSocial(_, { service, access_token }, { getUser }) {
        const { user, status, ...info } = await this.manager.social(await getUser(), service, access_token);

        const s = this.manager.getSocialStatus();
        let res = {
            service,
            linked: false,
            authed: false,
            created: false,
            user: undefined,
            error: undefined
        };

        if (status.includes(s.AUTHED)) {
            res.authed = true;
            res.user = await this.connectUser(user);
        }

        if (status.includes(s.CREATED)) {
            res.created = true;
        }

        if (status.includes(s.LINKED)) {
            res.linked = true;
        }

        if (status.includes(s.INVALID)) {
            res.error = "Social account already in use. Disconnect it before linking a new one.";
        }

        return res;
    }

    /********************************
     **** FORGOT AND RESET STUFF ****
     ********************************/
    async resolveForgot(_, { email }) {
        return await handleUserError(async () => {
            await this.manager.forgot(email);
            return {};
        });
    }

    async resolveReset(_, { token, password }) {
        return await handleUserError(async () => {
            return await this.manager.reset(token, password);
        });
    }

    async resolveIsForgotTokenValid(_, { token }) {
        return this.manager.isForgotTokenValid(token);
    }

    /********************************
     ****     ACCOUNT RELATED    ****
     ********************************/
    async resolveUpdatePassword(_, { password_old, password_new }, { getUser }) {
        return await handleUserError(async () => {
            await this.manager.updatePassword(await getUser(), password_old, password_new);
            return {};
        });
    }

    async resolveUpdateEmail(_, { email }, { getUser }) {
        return await handleUserError(async () => {
            const user = await this.manager.updateEmail(await getUser(), email);
            return { user: this.currentUser(user) };
        });
    }

    async resolveUpdateEmailResend(_, {}, { getUser }) {
        return await handleUserError(async () => {
            const user = await this.manager.updateEmailResend(await getUser());
            return { user: this.currentUser(user) };
        });
    }

    async resolveUpdateEmailCancel(_, {}, { getUser }) {
        return await handleUserError(async () => {
            const user = await this.manager.updateEmailCancel(await getUser());
            return { user: this.currentUser(user) };
        });
    }

    async resolveUpdateEmailValidate(_, { token }, context) {
        return await handleUserError(async () => {
            const user = await this.manager.updateEmailValidate(await context.getUser(), token);
            return { user: this.currentUser(user) };
        });
    }
}
