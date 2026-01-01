import { Entity, PrimaryKey, Property, Enum } from "@mikro-orm/postgresql";
import { hashString } from "../../utils/hash";
import { UserRole } from "../types/user";

@Entity()
export class User {
    
    @PrimaryKey()
    id: bigint;

    @Property({ nullable: false, unique: true })
    email: string;

    @Property({ nullable: false })
    passwordHash: string;

    @Enum(() => UserRole)
    role: UserRole;

    constructor({ email, password }: { email: string; password: string }) {
        this.email = email;
        this.passwordHash = hashString(password);
    }
}