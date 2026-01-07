import { Migration } from '@mikro-orm/migrations';

export class Migration20260107191658 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table "base_tag" ("id" serial primary key, "name" varchar(255) not null, "user_id" int not null);`);

    this.addSql(`create table "category" ("id" serial primary key, "name" varchar(255) not null, "user_id" int not null);`);

    this.addSql(`create table "kind" ("id" serial primary key, "name" varchar(255) not null, "user_id" int not null);`);

    this.addSql(`create table "product" ("id" serial primary key, "name" varchar(255) not null, "user_id" int not null, "default_category_id" int null, "default_kind_id" int null);`);

    this.addSql(`create table "expense" ("id" serial primary key, "user_id" int not null, "product_id" int not null, "category_id" int not null, "kind_id" int not null, "date" timestamptz not null);`);

    this.addSql(`create table "tag" ("id" serial primary key, "name" varchar(255) not null, "user_id" int not null);`);

    this.addSql(`create table "expense_tags" ("expense_id" int not null, "tag_id" int not null, constraint "expense_tags_pkey" primary key ("expense_id", "tag_id"));`);

    this.addSql(`alter table "product" add constraint "product_default_category_id_foreign" foreign key ("default_category_id") references "category" ("id") on update cascade on delete set null;`);
    this.addSql(`alter table "product" add constraint "product_default_kind_id_foreign" foreign key ("default_kind_id") references "kind" ("id") on update cascade on delete set null;`);

    this.addSql(`alter table "expense" add constraint "expense_product_id_foreign" foreign key ("product_id") references "product" ("id") on update cascade;`);
    this.addSql(`alter table "expense" add constraint "expense_category_id_foreign" foreign key ("category_id") references "category" ("id") on update cascade;`);
    this.addSql(`alter table "expense" add constraint "expense_kind_id_foreign" foreign key ("kind_id") references "kind" ("id") on update cascade;`);

    this.addSql(`alter table "expense_tags" add constraint "expense_tags_expense_id_foreign" foreign key ("expense_id") references "expense" ("id") on update cascade on delete cascade;`);
    this.addSql(`alter table "expense_tags" add constraint "expense_tags_tag_id_foreign" foreign key ("tag_id") references "tag" ("id") on update cascade on delete cascade;`);
  }

}
