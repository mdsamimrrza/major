import { pgTable, serial, varchar } from "drizzle-orm/pg-core";

export const UserData = pgTable("user_data",{
  id:varchar('id').primaryKey(),
  code:varchar('code').notNull(),
  email:varchar('email').notNull(),
});


export const InterpData = pgTable("inter_data",{
  id:varchar('id').primaryKey(),
  code:varchar('code').notNull(),
  email:varchar('email').notNull(),
});