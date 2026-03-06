import { Entity, PrimaryKey, Property, ManyToOne, ManyToMany, Collection } from "@mikro-orm/core";

import { Category } from "./category.entity";
import { Kind } from "./kind.entity";
import { Product } from "./product.entity";
import { Tag } from "./tag.entity";
import { PurchaseConstructorParams } from "../types";
import { orm } from "..";

@Entity()
export class Purchase {

	@PrimaryKey()
	id!: number;

	@Property()
	userId!: number;

	@Property()
	price!: number;

	@ManyToOne(() => Product, { ref: true })
	product!: Product;

	@ManyToOne(() => Category, { ref: true })
	category!: Category;

	@ManyToOne(() => Kind, { ref: true })
	kind!: Kind;

	@ManyToMany(() => Tag)
	tags = new Collection<Tag>(this);

	@Property()
	date!: Date;

	constructor({
		userId,
		price,
		productId,
		categoryId,
		kindId,
		tagIds,
		dateISO,
	}: PurchaseConstructorParams) {
		const em = orm.em.fork();
		this.userId = userId;
		this.price = price;
		this.product = em.getReference(Product, productId);
		this.category = em.getReference(Category, categoryId);
		this.kind = em.getReference(Kind, kindId);
		tagIds.forEach(tagId => this.tags.add(em.getReference(Tag, tagId)));
		this.date = new Date(dateISO);
	}
};
