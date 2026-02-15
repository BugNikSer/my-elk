import { Collection, Entity, ManyToMany, PrimaryKey, Property } from "@mikro-orm/postgresql";
import { BaseTag } from "./baseTag";
import { Purchase } from "./purchase.entity";

@Entity()
export class Tag extends BaseTag {

	@ManyToMany(() => Purchase, purchase => purchase.tags)
	purchases = new Collection<Purchase>(this);

};
