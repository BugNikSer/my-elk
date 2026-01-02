import { config } from "dotenv-flow";
import path from "path";

config({ path: path.join(__dirname, "../../../") });

type TypedVars<VarsArr extends readonly string[], T extends string | number> = Partial<Record<VarsArr[number], T>>;
// @ts-ignore
type TypedEnumVar<Conf extends Record<string, readonly string[]>, Key = keyof Conf> = Partial<Record<Key, Conf[Key][number]>>;

const stringVars = [
    "AUTH_SECRET",
    "USERS_SERVICE_HOST",
    "USERS_SERVICE_POSTGRES_DB",
    "USERS_SERVICE_POSTGRES_USER",
    "USERS_SERVICE_POSTGRES_PASSWORD",
] as const;
type StringVars = TypedVars<typeof stringVars, string>;

const numberVars = [
    "USERS_SERVICE_PORT",
    "USERS_SERVICE_POSTGRES_PORT",
] as const;
type NumberVars = TypedVars<typeof numberVars, number>;

const enumVars = {
    ENV: ["development", "production"],
} as const;
type EnumVars = TypedEnumVar<typeof enumVars>;

type AllVars = StringVars & NumberVars & EnumVars;

class EnvVars {
    constructor() {
        const { env } = process;
        // @ts-ignore
        stringVars.forEach(v => this[v] = env[v]);
        // @ts-ignore
        numberVars.forEach(v => this[v] = Number(env[v]));
        // @ts-ignore
        Object.keys(enumVars).forEach(v => this[v] = env[v]);
    }
};

const envVars = new EnvVars() as unknown as AllVars;

export default envVars;
