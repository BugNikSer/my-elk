import { Entity, ManyToOne } from "@mikro-orm/postgresql";
import { BaseTag } from "./baseTag";
import { Category } from "./category.entity";
import { Kind } from "./kind.entity";
import { ProductConstructorParams } from "../types";
import { orm } from "..";

@Entity()
export class Product extends BaseTag {

	@ManyToOne(() => Category, { nullable: true, ref: true })
	defaultCategory?: Category;

	@ManyToOne(() => Kind, { nullable: true, ref: true })
	defaultKind?: Kind;

	constructor({
		name,
		userId,
		defaultCategoryId,
		defaultKindId,
	}: ProductConstructorParams) {
		super({ name, userId });
		const em = orm.em.fork();
		this.defaultCategory = defaultCategoryId !== undefined ? em.getReference(Category, defaultCategoryId) : undefined;
		this.defaultKind = defaultKindId !== undefined ? em.getReference(Kind, defaultKindId) : undefined;
	}
};
