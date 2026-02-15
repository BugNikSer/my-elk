import { Entity, PrimaryKey, Property } from "@mikro-orm/postgresql";

@Entity({ abstract: true })
export abstract class BaseTag {

	@PrimaryKey()
	id!: number;

	@Property()
	name!: string;

	@Property()
	userId!: number;

	constructor({
		name,
		userId,
	}: {
		name: string;
		userId: number;
	}) {
		this.name = name;
		this.userId = userId;
	}

}