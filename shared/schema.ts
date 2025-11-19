import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, index, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (required for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Users table with email/password authentication
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").notNull().unique(),
  passwordHash: varchar("password_hash"),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role").notNull().default('patient'), // patient or caregiver
  caregiverId: varchar("caregiver_id"), // if patient, link to caregiver
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

export const medications = pgTable("medications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(), // link to patient
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
  userId: varchar("user_id").notNull(), // link to patient
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
  userId: varchar("user_id").notNull(),
  endpoint: text("endpoint").notNull(),
  p256dh: text("p256dh").notNull(),
  auth: text("auth").notNull(),
  expirationTime: timestamp("expiration_time"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const medicationSurveys = pgTable("medication_surveys", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(), // link to patient
  medicationLogId: varchar("medication_log_id").notNull(),
  medicationName: text("medication_name").notNull(),
  hasDizziness: integer("has_dizziness").notNull(),
  hasPain: integer("has_pain").notNull(),
  painLevel: integer("pain_level"),
  appetiteLevel: text("appetite_level").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  medications: many(medications),
  medicationLogs: many(medicationLogs),
  medicationSurveys: many(medicationSurveys),
  notificationSubscriptions: many(notificationSubscriptions),
  caregiver: one(users, {
    fields: [users.caregiverId],
    references: [users.id],
  }),
}));

export const medicationsRelations = relations(medications, ({ one }) => ({
  user: one(users, {
    fields: [medications.userId],
    references: [users.id],
  }),
}));

export const medicationLogsRelations = relations(medicationLogs, ({ one }) => ({
  user: one(users, {
    fields: [medicationLogs.userId],
    references: [users.id],
  }),
  medication: one(medications, {
    fields: [medicationLogs.medicationId],
    references: [medications.id],
  }),
}));

export const medicationSurveysRelations = relations(medicationSurveys, ({ one }) => ({
  user: one(users, {
    fields: [medicationSurveys.userId],
    references: [users.id],
  }),
  medicationLog: one(medicationLogs, {
    fields: [medicationSurveys.medicationLogId],
    references: [medicationLogs.id],
  }),
}));

export const notificationSubscriptionsRelations = relations(notificationSubscriptions, ({ one }) => ({
  user: one(users, {
    fields: [notificationSubscriptions.userId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertMedicationSchema = createInsertSchema(medications).omit({
  id: true,
  userId: true, // will be added automatically from auth
});

export const updateMedicationSchema = insertMedicationSchema.partial().pick({
  name: true,
  dosage: true,
  pillType: true,
  imageUrl: true,
  times: true,
  pillsRemaining: true,
  refillThreshold: true,
  lastRefillDate: true,
});

export const insertMedicationLogSchema = createInsertSchema(medicationLogs).omit({
  id: true,
  userId: true, // will be added automatically from auth
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

export const insertMedicationSurveySchema = createInsertSchema(medicationSurveys).omit({
  id: true,
  userId: true, // will be added automatically from auth
  createdAt: true,
}).extend({
  hasDizziness: z.number().min(0).max(1),
  hasPain: z.number().min(0).max(1),
  painLevel: z.number().min(0).max(10).optional(),
  appetiteLevel: z.enum(['good', 'reduced', 'none']),
});

export const upsertUserSchema = createInsertSchema(users).omit({
  createdAt: true,
  updatedAt: true,
}).extend({
  role: z.enum(['patient', 'caregiver']).optional(),
});

export const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  role: z.enum(['patient', 'caregiver']).default('patient'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Password is required"),
});

// Types
export type InsertMedication = z.infer<typeof insertMedicationSchema>;
export type UpdateMedication = z.infer<typeof updateMedicationSchema>;
export type Medication = typeof medications.$inferSelect;
export type InsertMedicationLog = z.infer<typeof insertMedicationLogSchema>;
export type MedicationLog = typeof medicationLogs.$inferSelect;
export type InsertNotificationSubscription = z.infer<typeof insertNotificationSubscriptionSchema>;
export type NotificationSubscription = typeof notificationSubscriptions.$inferSelect;
export type InsertMedicationSurvey = z.infer<typeof insertMedicationSurveySchema>;
export type MedicationSurvey = typeof medicationSurveys.$inferSelect;
export type UpsertUser = z.infer<typeof upsertUserSchema>;
export type User = typeof users.$inferSelect;
export type Signup = z.infer<typeof signupSchema>;
export type Login = z.infer<typeof loginSchema>;
