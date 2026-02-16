import { EntityDTO } from "@mikro-orm/core";

export type ReplaceEntitiesWithIds<T> = {
    [K in keyof T]: T[K] extends EntityDTO<infer E, never>
        ? number | null  // для nullable связей
        : T[K] extends EntityDTO<infer E, never> | undefined
            ? number | undefined
            : T[K] extends Array<EntityDTO<infer E, never>>
                ? number[]  // для коллекций
                : T[K];
};
