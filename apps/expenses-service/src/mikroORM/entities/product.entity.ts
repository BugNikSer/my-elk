import { Entity, ManyToOne } from "@mikro-orm/postgresql";
import { BaseTag } from "./baseTag";
import { Category } from "./category.entity";
import { Kind } from "./kind.entity";

@Entity()
export class Product extends BaseTag {

	@ManyToOne(() => Category, { ref: true, nullable: true })
	defaultCategory?: Category;

	@ManyToOne(() => Kind, { ref: true, nullable: true })
	defaultKind?: Kind;

	constructor({
		name,
		userId,
		defaultCategory,
		defaultKind,
	}: {
		name: string;
		userId: number;
		defaultCategory?: Category;
		defaultKind?: Kind;
	}) {
		super({ name, userId });
		this.defaultCategory = defaultCategory;
		this.defaultKind = defaultKind;
	}
};
