import { Collection, Entity, ManyToMany } from "@mikro-orm/postgresql";
import { BaseTag } from "./baseTag";
import { Purchase } from "./purchase.entity";
import { TagConstructorParams } from "../types";

@Entity()
export class Tag extends BaseTag {

	@ManyToMany(() => Purchase, purchase => purchase.tags)
	purchases = new Collection<Purchase>(this);

	constructor({ name, userId }: TagConstructorParams) {
		super({ name, userId }); 
		this.purchases = new Collection<Purchase>(this);
	}

};
