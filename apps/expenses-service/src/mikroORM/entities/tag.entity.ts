import { Collection, Entity, ManyToMany, PrimaryKey, Property } from "@mikro-orm/postgresql";
import { BaseTag } from "./baseTag";
import { Expense } from "./expense.entity";

@Entity()
export class Tag extends BaseTag {

    @ManyToMany(() => Expense, expense => expense.tags)
    expenses = new Collection<Expense>(this);
    
};
