import { Store } from "@tanstack/store";
import type { User } from "@my-elk/users-service";

export const userStore = new Store<User | null>(null);
