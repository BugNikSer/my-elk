import { EntityDTO } from "@mikro-orm/core";

import { Category, Kind, Product, Purchase, Tag } from "./entities";
import { ReplaceEntitiesWithIds } from "@my-elk/helpers";

export type CategoryDTO = EntityDTO<Category>;
export type KindDTO = EntityDTO<Kind>;
export type ProductDTO = ReplaceEntitiesWithIds<EntityDTO<Product>>;
export type TagDTO = ReplaceEntitiesWithIds<EntityDTO<Tag>>;
export type PurchaseDTO = ReplaceEntitiesWithIds<EntityDTO<Purchase>>;
