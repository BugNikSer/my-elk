import { Migration } from '@mikro-orm/migrations';

export class Migration20260224210630 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table "purchase" add column "price" int not null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "purchase" drop column "price";`);
  }

}
