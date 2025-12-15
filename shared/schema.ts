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
  accessibility: text("accessibility"), // Truck, Motorbike, etc.
  partnerInfo: text("partner_info"), // Instructions for recyclers
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
  bagCount: integer("bag_count"),
});

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // alert, announcement, message
  title: text("title").notNull(),
  message: text("message").notNull(),
  userId: integer("user_id"), // null = broadcast
  read: boolean("read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const financialMetrics = pgTable("financial_metrics", {
  id: serial("id").primaryKey(),
  category: text("category").notNull(), // Grant A, Runway, etc.
  value: decimal("value").notNull(),
  target: decimal("target"),
  updatedAt: timestamp("updated_at").defaultNow(),
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
  email: true,
  name: true,
  role: true,
  password: true,
});

export const insertHotspotSchema = createInsertSchema(hotspots).pick({
  name: true,
  description: true,
  latitude: true,
  longitude: true,
  status: true,
  estimatedVolume: true,
  accessibility: true,
  partnerInfo: true,
});

export const insertCollectionSchema = createInsertSchema(collections).pick({
  hotspotId: true,
  userId: true,
  notes: true,
  newHotspotName: true,
  isNewHotspot: true,
  gpsLatitude: true,
  gpsLongitude: true,
  imageUrl: true,
});

export const insertCollectionItemSchema = createInsertSchema(collectionItems).pick({
  materialType: true,
  weight: true,
  bagCount: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).pick({
  type: true,
  title: true,
  message: true,
  userId: true,
});

export const insertMetricSchema = createInsertSchema(financialMetrics).pick({
  category: true,
  value: true,
  target: true,
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Hotspot = typeof hotspots.$inferSelect;
export type InsertHotspot = z.infer<typeof insertHotspotSchema>;
export type Collection = typeof collections.$inferSelect;
export type InsertCollection = z.infer<typeof insertCollectionSchema>;
export type CollectionItem = typeof collectionItems.$inferSelect;
export type InsertCollectionItem = z.infer<typeof insertCollectionItemSchema>;
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type FinancialMetric = typeof financialMetrics.$inferSelect;
export type InsertMetric = z.infer<typeof insertMetricSchema>;
