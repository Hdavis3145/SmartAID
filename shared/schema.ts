import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const medications = pgTable("medications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  dosage: text("dosage").notNull(),
  pillType: text("pill_type").notNull(),
  imageUrl: text("image_url").notNull(),
  times: text("times").array().notNull(),
  pillsRemaining: integer("pills_remaining").default(30),
  refillThreshold: integer("refill_threshold").default(7),
  lastRefillDate: timestamp("last_refill_date"),
});

export const medicationLogs = pgTable("medication_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  medicationId: varchar("medication_id").notNull(),
  medicationName: text("medication_name").notNull(),
  scheduledTime: text("scheduled_time").notNull(),
  takenTime: timestamp("taken_time"),
  status: text("status").notNull(),
  confidence: integer("confidence"),
  scannedPillType: text("scanned_pill_type"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const notificationSubscriptions = pgTable("notification_subscriptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: text("user_id").notNull(),
  endpoint: text("endpoint").notNull(),
  p256dh: text("p256dh").notNull(),
  auth: text("auth").notNull(),
  expirationTime: timestamp("expiration_time"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const insertMedicationSchema = createInsertSchema(medications).omit({
  id: true,
});

export const insertMedicationLogSchema = createInsertSchema(medicationLogs).omit({
  id: true,
  createdAt: true,
}).extend({
  takenTime: z.string().datetime().or(z.date()).transform((val) => 
    typeof val === 'string' ? new Date(val) : val
  ).optional(),
});

export const insertNotificationSubscriptionSchema = createInsertSchema(notificationSubscriptions).omit({
  id: true,
  createdAt: true,
});

export type InsertMedication = z.infer<typeof insertMedicationSchema>;
export type Medication = typeof medications.$inferSelect;
export type InsertMedicationLog = z.infer<typeof insertMedicationLogSchema>;
export type MedicationLog = typeof medicationLogs.$inferSelect;
export type InsertNotificationSubscription = z.infer<typeof insertNotificationSubscriptionSchema>;
export type NotificationSubscription = typeof notificationSubscriptions.$inferSelect;
