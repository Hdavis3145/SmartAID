import { type Medication, type InsertMedication, type MedicationLog, type InsertMedicationLog, type NotificationSubscription, type InsertNotificationSubscription } from "@shared/schema";
import { randomUUID } from "crypto";

// Image paths for pills
const whiteTabletImg = "/attached_assets/generated_images/White_round_tablet_pill_531071e0.png";
const blueCapsuleImg = "/attached_assets/generated_images/Blue_oval_capsule_90e60c59.png";
const yellowTabletImg = "/attached_assets/generated_images/Yellow_circular_tablet_b7928714.png";
const pinkPillImg = "/attached_assets/generated_images/Pink_round_pill_056d7a48.png";

export interface IStorage {
  // Medications
  getMedications(): Promise<Medication[]>;
  getMedication(id: string): Promise<Medication | undefined>;
  createMedication(medication: InsertMedication): Promise<Medication>;
  
  // Medication Logs
  getMedicationLogs(): Promise<MedicationLog[]>;
  createMedicationLog(log: InsertMedicationLog): Promise<MedicationLog>;
  getTodayLogs(): Promise<MedicationLog[]>;
  
  // Notification Subscriptions
  getSubscription(userId: string): Promise<NotificationSubscription | undefined>;
  upsertSubscription(subscription: InsertNotificationSubscription): Promise<NotificationSubscription>;
  deleteSubscription(userId: string): Promise<void>;
}

export class MemStorage implements IStorage {
  private medications: Map<string, Medication>;
  private medicationLogs: Map<string, MedicationLog>;
  private notificationSubscriptions: Map<string, NotificationSubscription>;

  constructor() {
    this.medications = new Map();
    this.medicationLogs = new Map();
    this.notificationSubscriptions = new Map();
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Initialize with sample medications
    const sampleMeds: Partial<Medication>[] = [
      {
        name: "Lisinopril",
        dosage: "10mg",
        pillType: "white-round",
        imageUrl: whiteTabletImg,
        times: ["08:00", "20:00"],
        pillsRemaining: 25,
        refillThreshold: 7,
        lastRefillDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      },
      {
        name: "Metformin",
        dosage: "500mg",
        pillType: "blue-oval",
        imageUrl: blueCapsuleImg,
        times: ["09:00", "21:00"],
        pillsRemaining: 45,
        refillThreshold: 7,
        lastRefillDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
      },
      {
        name: "Atorvastatin",
        dosage: "20mg",
        pillType: "yellow-round",
        imageUrl: yellowTabletImg,
        times: ["20:00"],
        pillsRemaining: 5,
        refillThreshold: 7,
        lastRefillDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000), // 20 days ago
      },
      {
        name: "Levothyroxine",
        dosage: "50mcg",
        pillType: "pink-round",
        imageUrl: pinkPillImg,
        times: ["07:00"],
        pillsRemaining: 30,
        refillThreshold: 7,
        lastRefillDate: new Date(),
      },
    ];

    sampleMeds.forEach(med => {
      const id = randomUUID();
      this.medications.set(id, { ...(med as Medication), id });
    });

    // Initialize with some sample logs for today
    const today = new Date();
    const medsArray = Array.from(this.medications.values());
    
    if (medsArray.length > 0) {
      // Log first medication as taken
      const log1: MedicationLog = {
        id: randomUUID(),
        medicationId: medsArray[0].id,
        medicationName: medsArray[0].name,
        scheduledTime: medsArray[0].times[0],
        takenTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 8, 5),
        status: "taken",
        confidence: 95,
        scannedPillType: medsArray[0].pillType,
        createdAt: new Date(),
      };
      this.medicationLogs.set(log1.id, log1);

      // Log second medication as taken
      if (medsArray.length > 3) {
        const log2: MedicationLog = {
          id: randomUUID(),
          medicationId: medsArray[3].id,
          medicationName: medsArray[3].name,
          scheduledTime: medsArray[3].times[0],
          takenTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 7, 10),
          status: "taken",
          confidence: 92,
          scannedPillType: medsArray[3].pillType,
          createdAt: new Date(),
        };
        this.medicationLogs.set(log2.id, log2);
      }
    }
  }

  // Medications
  async getMedications(): Promise<Medication[]> {
    return Array.from(this.medications.values());
  }

  async getMedication(id: string): Promise<Medication | undefined> {
    return this.medications.get(id);
  }

  async createMedication(insertMedication: InsertMedication): Promise<Medication> {
    const id = randomUUID();
    const medication: Medication = { 
      ...insertMedication, 
      id,
      pillsRemaining: insertMedication.pillsRemaining ?? 30,
      refillThreshold: insertMedication.refillThreshold ?? 7,
      lastRefillDate: insertMedication.lastRefillDate ?? null,
    };
    this.medications.set(id, medication);
    return medication;
  }

  // Medication Logs
  async getMedicationLogs(): Promise<MedicationLog[]> {
    return Array.from(this.medicationLogs.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createMedicationLog(insertLog: InsertMedicationLog): Promise<MedicationLog> {
    const id = randomUUID();
    const log: MedicationLog = {
      id,
      medicationId: insertLog.medicationId,
      medicationName: insertLog.medicationName,
      scheduledTime: insertLog.scheduledTime,
      takenTime: insertLog.takenTime ?? null,
      status: insertLog.status,
      confidence: insertLog.confidence ?? null,
      scannedPillType: insertLog.scannedPillType ?? null,
      createdAt: new Date(),
    };
    this.medicationLogs.set(id, log);
    return log;
  }

  async getTodayLogs(): Promise<MedicationLog[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return Array.from(this.medicationLogs.values())
      .filter(log => {
        const logDate = new Date(log.createdAt);
        return logDate >= today && logDate < tomorrow;
      })
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  // Notification Subscriptions
  async getSubscription(userId: string): Promise<NotificationSubscription | undefined> {
    return this.notificationSubscriptions.get(userId);
  }

  async upsertSubscription(insertSubscription: InsertNotificationSubscription): Promise<NotificationSubscription> {
    const existing = this.notificationSubscriptions.get(insertSubscription.userId);
    const id = existing?.id || randomUUID();
    
    const subscription: NotificationSubscription = {
      id,
      userId: insertSubscription.userId,
      endpoint: insertSubscription.endpoint,
      p256dh: insertSubscription.p256dh,
      auth: insertSubscription.auth,
      expirationTime: insertSubscription.expirationTime ?? null,
      createdAt: existing?.createdAt || new Date(),
    };
    
    this.notificationSubscriptions.set(insertSubscription.userId, subscription);
    return subscription;
  }

  async deleteSubscription(userId: string): Promise<void> {
    this.notificationSubscriptions.delete(userId);
  }
}

export const storage = new MemStorage();
