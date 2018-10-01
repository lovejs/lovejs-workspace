import { PasswordEncoder } from "./PasswordEncoderInterface";

/**
 * Plain password encode / compare
 * Do not use this in production
 */
export class PasswordEncoderPlain implements PasswordEncoder {
    /**
     * @inheritdoc
     */
    async hash(password) {
        return password;
    }

    /**
     * @inheritdoc
     */
    async compare(password, hash) {
        return password === hash;
    }
}
