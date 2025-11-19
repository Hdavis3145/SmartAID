// Database storage implementation using PostgreSQL and Drizzle ORM
import { 
  type Medication, 
  type InsertMedication, 
  type MedicationLog, 
  type InsertMedicationLog, 
  type NotificationSubscription, 
  type InsertNotificationSubscription, 
  type MedicationSurvey, 
  type InsertMedicationSurvey,
  type User,
  type UpsertUser,
  medications,
  medicationLogs,
  notificationSubscriptions,
  medicationSurveys,
  users,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, desc } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserById(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  createUser(email: string, passwordHash: string, firstName: string, lastName: string, role: string): Promise<User>;
  
  // Medications
  getMedications(userId: string): Promise<Medication[]>;
  getMedication(id: string, userId: string): Promise<Medication | undefined>;
  createMedication(medication: InsertMedication, userId: string): Promise<Medication>;
  updateMedication(id: string, medication: Partial<InsertMedication>, userId: string): Promise<Medication | undefined>;
  deleteMedication(id: string, userId: string): Promise<boolean>;
  
  // Medication Logs
  getMedicationLogs(userId: string): Promise<MedicationLog[]>;
  createMedicationLog(log: InsertMedicationLog, userId: string): Promise<MedicationLog>;
  getTodayLogs(userId: string): Promise<MedicationLog[]>;
  
  // Notification Subscriptions
  getSubscription(userId: string): Promise<NotificationSubscription | undefined>;
  upsertSubscription(subscription: InsertNotificationSubscription): Promise<NotificationSubscription>;
  deleteSubscription(userId: string): Promise<void>;
  getAllSubscriptions(): Promise<NotificationSubscription[]>;
  
  // Medication Surveys
  createMedicationSurvey(survey: InsertMedicationSurvey, userId: string): Promise<MedicationSurvey>;
  getMedicationSurveys(userId: string): Promise<MedicationSurvey[]>;
  getSurveyByLogId(medicationLogId: string, userId: string): Promise<MedicationSurvey | undefined>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserById(id: string): Promise<User | undefined> {
    return this.getUser(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(email: string, passwordHash: string, firstName: string, lastName: string, role: string): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        email,
        passwordHash,
        firstName,
        lastName,
        role,
      })
      .returning();
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        ...userData,
        role: userData.role || 'patient',
      })
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Medications
  async getMedications(userId: string): Promise<Medication[]> {
    return await db
      .select()
      .from(medications)
      .where(eq(medications.userId, userId));
  }

  async getMedication(id: string, userId: string): Promise<Medication | undefined> {
    const [medication] = await db
      .select()
      .from(medications)
      .where(and(eq(medications.id, id), eq(medications.userId, userId)));
    return medication || undefined;
  }

  async createMedication(insertMedication: InsertMedication, userId: string): Promise<Medication> {
    const [medication] = await db
      .insert(medications)
      .values({
        ...insertMedication,
        userId,
      })
      .returning();
    return medication;
  }

  async updateMedication(id: string, medicationUpdate: Partial<InsertMedication>, userId: string): Promise<Medication | undefined> {
    // Pre-flight check: verify the medication exists and belongs to the authenticated user
    const existing = await this.getMedication(id, userId);
    if (!existing) {
      return undefined; // Medication not found or doesn't belong to user
    }
    
    // Defensively ensure userId cannot be changed by explicitly re-setting it
    const { userId: _, ...safeUpdate} = medicationUpdate as any;
    const [medication] = await db
      .update(medications)
      .set({
        ...safeUpdate,
        userId, // Always force userId to the authenticated user
      })
      .where(and(eq(medications.id, id), eq(medications.userId, userId)))
      .returning();
    return medication || undefined;
  }

  async deleteMedication(id: string, userId: string): Promise<boolean> {
    const result = await db
      .delete(medications)
      .where(and(eq(medications.id, id), eq(medications.userId, userId)))
      .returning();
    return result.length > 0;
  }

  // Medication Logs
  async getMedicationLogs(userId: string): Promise<MedicationLog[]> {
    return await db
      .select()
      .from(medicationLogs)
      .where(eq(medicationLogs.userId, userId))
      .orderBy(desc(medicationLogs.createdAt));
  }

  async createMedicationLog(insertLog: InsertMedicationLog, userId: string): Promise<MedicationLog> {
    const [log] = await db
      .insert(medicationLogs)
      .values({
        ...insertLog,
        userId,
      })
      .returning();
    return log;
  }

  async getTodayLogs(userId: string): Promise<MedicationLog[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return await db
      .select()
      .from(medicationLogs)
      .where(
        and(
          eq(medicationLogs.userId, userId),
          gte(medicationLogs.createdAt, today)
        )
      )
      .orderBy(desc(medicationLogs.createdAt));
  }

  // Notification Subscriptions
  async getSubscription(userId: string): Promise<NotificationSubscription | undefined> {
    const [subscription] = await db
      .select()
      .from(notificationSubscriptions)
      .where(eq(notificationSubscriptions.userId, userId));
    return subscription || undefined;
  }

  async getAllSubscriptions(): Promise<NotificationSubscription[]> {
    return await db.select().from(notificationSubscriptions);
  }

  async upsertSubscription(insertSubscription: InsertNotificationSubscription): Promise<NotificationSubscription> {
    const existing = await this.getSubscription(insertSubscription.userId);
    
    if (existing) {
      const [subscription] = await db
        .update(notificationSubscriptions)
        .set(insertSubscription)
        .where(eq(notificationSubscriptions.userId, insertSubscription.userId))
        .returning();
      return subscription;
    }
    
    const [subscription] = await db
      .insert(notificationSubscriptions)
      .values(insertSubscription)
      .returning();
    return subscription;
  }

  async deleteSubscription(userId: string): Promise<void> {
    await db
      .delete(notificationSubscriptions)
      .where(eq(notificationSubscriptions.userId, userId));
  }

  // Medication Surveys
  async createMedicationSurvey(insertSurvey: InsertMedicationSurvey, userId: string): Promise<MedicationSurvey> {
    const [survey] = await db
      .insert(medicationSurveys)
      .values({
        ...insertSurvey,
        userId,
      })
      .returning();
    return survey;
  }

  async getMedicationSurveys(userId: string): Promise<MedicationSurvey[]> {
    return await db
      .select()
      .from(medicationSurveys)
      .where(eq(medicationSurveys.userId, userId))
      .orderBy(desc(medicationSurveys.createdAt));
  }

  async getSurveyByLogId(medicationLogId: string, userId: string): Promise<MedicationSurvey | undefined> {
    const [survey] = await db
      .select()
      .from(medicationSurveys)
      .where(
        and(
          eq(medicationSurveys.medicationLogId, medicationLogId),
          eq(medicationSurveys.userId, userId)
        )
      );
    return survey || undefined;
  }
}

export const storage = new DatabaseStorage();
