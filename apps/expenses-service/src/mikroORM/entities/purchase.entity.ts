import { Entity, PrimaryKey, Property, ManyToOne, ManyToMany, Collection } from "@mikro-orm/core";

import { Category } from "./category.entity";
import { Kind } from "./kind.entity";
import { Product } from "./product.entity";
import { Tag } from "./tag.entity";

@Entity()
export class Purchase {

    @PrimaryKey()
    id!: number;

    @Property()
    userId!: number;

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
        product,
        category,
        kind,
        tags,
    }: {
        userId: number;
        product: Product;
        category: Category;
        kind: Kind;
        tags: Tag[];
    }) {
        this.userId = userId;
        this.product = product;
        this.category = category;
        this.kind = kind;
        tags.forEach(tag => this.tags.add(tag));
        this.date = new Date();
    }
};
