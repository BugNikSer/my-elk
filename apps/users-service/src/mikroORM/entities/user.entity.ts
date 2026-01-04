import { Entity, PrimaryKey, Property, Enum } from "@mikro-orm/postgresql";
import { hashString } from "../../utils/hash";
import { UserCreateInput, UserRole } from "../types/user";

@Entity()
export class User {
    
    @PrimaryKey()
    id!: number;

    @Property({ nullable: false, unique: true })
    email!: string;

    @Property({ nullable: false })
    passwordHash!: string;

    @Enum(() => UserRole)
    role!: UserRole;

    constructor({ email, password }: UserCreateInput) {
        this.email = email;
        this.passwordHash = hashString(password);
        this.role = UserRole.regular;
    }
}