import { pgTable, text, serial, integer, boolean, timestamp, jsonb, decimal, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const userRoleEnum = pgEnum("user_role", ["super_admin", "admin", "field_officer", "partner"]);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("field_officer"), // simple text for now to avoid enum issues if not supported
  name: text("name").notNull(),
  email: text("email"),
  organization: text("organization"),
  status: text("status").notNull().default("active"), // active, suspended
  assignedHotspotId: integer("assigned_hotspot_id").references(() => hotspots.id),
});

export const hotspots = pgTable("hotspots", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  latitude: decimal("latitude").notNull(),
  longitude: decimal("longitude").notNull(),
  status: text("status").notNull().default("active"), // active, cleared, critical
  estimatedVolume: decimal("estimated_volume").notNull().default("0"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const collections = pgTable("collections", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  hotspotId: integer("hotspot_id").references(() => hotspots.id),
  isNewHotspot: boolean("is_new_hotspot").default(false),
  newHotspotName: text("new_hotspot_name"),
  gpsLatitude: decimal("gps_latitude"),
  gpsLongitude: decimal("gps_longitude"),
  status: text("status").notNull().default("pending"), // pending, verified, rejected
  notes: text("notes"),
  imageUrl: text("image_url"),
  collectedAt: timestamp("collected_at").defaultNow(),
});

export const collectionItems = pgTable("collection_items", {
  id: serial("id").primaryKey(),
  collectionId: integer("collection_id").notNull().references(() => collections.id),
  materialType: text("material_type").notNull(), // pet, hdpe, etc
  weight: decimal("weight").notNull(),
});

export const usersRelations = relations(users, ({ many, one }) => ({
  collections: many(collections),
  assignedHotspot: one(hotspots, {
    fields: [users.assignedHotspotId],
    references: [hotspots.id],
  }),
}));

export const hotspotsRelations = relations(hotspots, ({ many }) => ({
  collections: many(collections),
}));

export const collectionsRelations = relations(collections, ({ one, many }) => ({
  user: one(users, {
    fields: [collections.userId],
    references: [users.id],
  }),
  hotspot: one(hotspots, {
    fields: [collections.hotspotId],
    references: [hotspots.id],
  }),
  items: many(collectionItems),
}));

export const collectionItemsRelations = relations(collectionItems, ({ one }) => ({
  collection: one(collections, {
    fields: [collectionItems.collectionId],
    references: [collections.id],
  }),
}));

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  role: true,
  name: true,
  email: true,
  organization: true
});

export const insertCollectionSchema = createInsertSchema(collections).omit({
  id: true,
  collectedAt: true,
  status: true
});

export const insertHotspotSchema = createInsertSchema(hotspots).omit({
  id: true,
  createdAt: true
});

export const insertItemSchema = createInsertSchema(collectionItems).omit({
  id: true,
  collectionId: true
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Hotspot = typeof hotspots.$inferSelect;
export type InsertHotspot = z.infer<typeof insertHotspotSchema>;
export type Collection = typeof collections.$inferSelect;
export type InsertCollection = z.infer<typeof insertCollectionSchema>;
export type CollectionItem = typeof collectionItems.$inferSelect;
export type InsertItem = z.infer<typeof insertItemSchema>;

