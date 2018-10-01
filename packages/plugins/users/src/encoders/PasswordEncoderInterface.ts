export interface PasswordEncoder {
    /**
     * Hash a password
     */
    hash(password: string): Promise<string>;

    /**
     * Compare a password with an hash
     */
    compare(password: string, hash: string): Promise<boolean>;
}
