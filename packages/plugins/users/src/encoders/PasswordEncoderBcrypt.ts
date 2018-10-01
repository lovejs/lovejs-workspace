import * as bcrypt from "bcrypt";
import { PasswordEncoder } from "./PasswordEncoderInterface";

/**
 * Bcrypt password encode / compare
 */
export class PasswordEncoderBcrypt implements PasswordEncoder {
    /**
     * Number of salt rounds
     */
    protected saltRounds: number;

    constructor(saltRounds = 8) {
        this.saltRounds = saltRounds;
    }

    /**
     * @inheritdoc
     */
    async hash(password: string) {
        return bcrypt.hash(password, this.saltRounds);
    }

    /**
     * @inheritdoc
     */
    async compare(password: string, hash: string) {
        return bcrypt.compare(password, hash);
    }
}
