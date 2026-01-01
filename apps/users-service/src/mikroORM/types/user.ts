export enum UserRole {
    "admin" = "admin",
    "regular" = "regular",
};

export interface UserCreateInput {
    email: string;
    password: string;
};

export type UserGetByInput = { id: number } | { email: string }; 
