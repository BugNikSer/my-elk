import { Entity, PrimaryKey, Property } from "@mikro-orm/postgresql";
import { BaseTagConstructorParams } from "../types";

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
	}: BaseTagConstructorParams) {
		this.name = name;
		this.userId = userId;
	}

};
