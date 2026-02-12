import { Migration } from '@mikro-orm/migrations';

export class Migration20260211192604 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table "expense_tags" drop constraint "expense_tags_expense_id_foreign";`);

    this.addSql(`create table "purchase" ("id" serial primary key, "user_id" int not null, "product_id" int not null, "category_id" int not null, "kind_id" int not null, "date" timestamptz not null);`);

    this.addSql(`create table "purchase_tags" ("purchase_id" int not null, "tag_id" int not null, constraint "purchase_tags_pkey" primary key ("purchase_id", "tag_id"));`);

    this.addSql(`alter table "purchase" add constraint "purchase_product_id_foreign" foreign key ("product_id") references "product" ("id") on update cascade;`);
    this.addSql(`alter table "purchase" add constraint "purchase_category_id_foreign" foreign key ("category_id") references "category" ("id") on update cascade;`);
    this.addSql(`alter table "purchase" add constraint "purchase_kind_id_foreign" foreign key ("kind_id") references "kind" ("id") on update cascade;`);

    this.addSql(`alter table "purchase_tags" add constraint "purchase_tags_purchase_id_foreign" foreign key ("purchase_id") references "purchase" ("id") on update cascade on delete cascade;`);
    this.addSql(`alter table "purchase_tags" add constraint "purchase_tags_tag_id_foreign" foreign key ("tag_id") references "tag" ("id") on update cascade on delete cascade;`);

    this.addSql(`drop table if exists "expense" cascade;`);

    this.addSql(`drop table if exists "expense_tags" cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "purchase_tags" drop constraint "purchase_tags_purchase_id_foreign";`);

    this.addSql(`create table "expense" ("id" serial primary key, "user_id" int not null, "product_id" int not null, "category_id" int not null, "kind_id" int not null, "date" timestamptz not null);`);

    this.addSql(`create table "expense_tags" ("expense_id" int not null, "tag_id" int not null, constraint "expense_tags_pkey" primary key ("expense_id", "tag_id"));`);

    this.addSql(`alter table "expense" add constraint "expense_product_id_foreign" foreign key ("product_id") references "product" ("id") on update cascade;`);
    this.addSql(`alter table "expense" add constraint "expense_category_id_foreign" foreign key ("category_id") references "category" ("id") on update cascade;`);
    this.addSql(`alter table "expense" add constraint "expense_kind_id_foreign" foreign key ("kind_id") references "kind" ("id") on update cascade;`);

    this.addSql(`alter table "expense_tags" add constraint "expense_tags_expense_id_foreign" foreign key ("expense_id") references "expense" ("id") on update cascade on delete cascade;`);
    this.addSql(`alter table "expense_tags" add constraint "expense_tags_tag_id_foreign" foreign key ("tag_id") references "tag" ("id") on update cascade on delete cascade;`);

    this.addSql(`drop table if exists "purchase" cascade;`);

    this.addSql(`drop table if exists "purchase_tags" cascade;`);
  }

}
