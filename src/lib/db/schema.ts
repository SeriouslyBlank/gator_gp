import { pgTable, timestamp, uuid, text, unique } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom().notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
  name: text("name").notNull().unique(),
});


export const feeds = pgTable("feeds", {
  id: uuid("id").primaryKey().defaultRandom().notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  last_fetched_at: timestamp("last_fetched"),
  updatedAt: timestamp("updated_at"),
  name: text("name_of_feed").notNull(),
  url: text("link_of_feed").notNull().unique(),
  user_id: uuid("user_id").notNull().references(()=> users.id, {onDelete: "cascade"}),
});


export const feed_follows = pgTable("feed_follows", {
  id: uuid("id").primaryKey().defaultRandom().notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at"),
  user_id: uuid("user_id").notNull().references(()=> users.id, {onDelete: "cascade"}),
  feed_id: uuid("feed_id").notNull().references(()=> feeds.id, {onDelete: "cascade"}),
}, (table)=> [
  unique("user_feed_unique").on(table.user_id,table.feed_id)
]);