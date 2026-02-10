import { type TRPC_ERROR_CODE_KEY } from "@trpc/server";
import { createEntity } from "@my-elk/helpers";

import { orm } from "../mikroORM";
import { Product } from "../mikroORM/entities";
import { areaLogger } from "../utils/logger";
import { AsyncResultError, ServiceError } from "@my-elk/result-error";
import categoriesService from "./categories-service";
import kindsService from "./kinds-service";

const logger = areaLogger("products-service");

export default {
    create: async(input: {
        name: string;
        userId: number;
        defaultCategoryId?: number;
        defaultKindId?: number;
    }): AsyncResultError<Product, ServiceError> => {
        logger.debug("[create]", input);

        const { name, userId, defaultCategoryId, defaultKindId } = input;
        const body: ConstructorParameters<typeof Product>[0] = { name, userId };

        const productDefaultLinks = [
            { service: categoriesService, field: "defaultCategory", id: defaultCategoryId },
            { service: kindsService, field: "defaultKind", id: defaultKindId },
        ] as const;

        const errors = await Promise.all(productDefaultLinks.map(async ({ service, field, id }) => {
            if (id === undefined) return null;
            const [result, error] = await service.getOne({ id, userId });
            if (error) return error;
            body[field] = result;
            return null;
        }));

        const filteredErrors = errors.filter(er => er !== null);
        if (filteredErrors.length) {
            let worstErrorCode: TRPC_ERROR_CODE_KEY = "NOT_FOUND";
            if (filteredErrors.some((e) => e.code === "INTERNAL_SERVER_ERROR")) {
                worstErrorCode = "INTERNAL_SERVER_ERROR";
            }
            return [
                null,
                {
                    code: worstErrorCode,
                    error: new Error(filteredErrors.map(e => e.error.message).join(". ")),
                },
            ];
        }

        return createEntity({ Entity: Product, input: body, logger, orm, skipFirstLogging: true });
    }
};
