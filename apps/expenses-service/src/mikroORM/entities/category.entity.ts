import { Entity } from "@mikro-orm/postgresql";
import { BaseTag } from "./baseTag";

@Entity()
export class Category extends BaseTag {};
