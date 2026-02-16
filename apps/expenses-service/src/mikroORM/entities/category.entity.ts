import { Entity, EntityDTO } from "@mikro-orm/postgresql";
import { BaseTag } from "./baseTag";

@Entity()
export class Category extends BaseTag {};
