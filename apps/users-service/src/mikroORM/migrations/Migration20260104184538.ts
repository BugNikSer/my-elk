import { Migration } from '@mikro-orm/migrations';

export class Migration20260104184538 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table "user" ("id" serial primary key, "email" varchar(255) not null, "password_hash" varchar(255) not null, "role" text check ("role" in ('admin', 'regular')) not null);`);
    this.addSql(`alter table "user" add constraint "user_email_unique" unique ("email");`);
  }

}
