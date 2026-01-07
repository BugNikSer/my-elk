import { Entity, ManyToOne, Property, Ref } from "@mikro-orm/postgresql";
import { BaseTag } from "./baseTag";
import { Category } from "./category.entity";
import { Kind } from "./kind.entity";

@Entity()
export class Product extends BaseTag {

    @ManyToOne(() => Category, { nullable: true })
    defaultCategory?: Category;

    @ManyToOne(() => Kind, { nullable: true })
    defaultKind?: Kind;

};
