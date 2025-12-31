import { Entity, PrimaryKey, Property } from "@mikro-orm/postgresql";
import { hashString } from "../../utils/hash";

@Entity()
export class User {
    
    @PrimaryKey()
    id: bigint;

    @Property({ nullable: false, unique: true })
    email: string;

    @Property({ nullable: false })
    passwordHash: string;

    constructor({ email, password }: { email: string; password: string }) {
        this.email = email;
        this.passwordHash = hashString(password);
    }
}