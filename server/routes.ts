import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertMedicationSchema, updateMedicationSchema, insertMedicationLogSchema, insertMedicationSurveySchema } from "@shared/schema";
import { notificationService, type PushSubscription } from "./notificationService";
import { setupAuth, isAuthenticated } from "./replitAuth";

// Image paths for pills
const whiteTabletImg = "/attached_assets/generated_images/White_round_tablet_pill_531071e0.png";
const blueCapsuleImg = "/attached_assets/generated_images/Blue_oval_capsule_90e60c59.png";
const yellowTabletImg = "/attached_assets/generated_images/Yellow_circular_tablet_b7928714.png";
const pinkPillImg = "/attached_assets/generated_images/Pink_round_pill_056d7a48.png";
const redWhiteCapsuleImg = "/attached_assets/generated_images/Red_white_capsule_670d2c29.png";
const orangeTabletImg = "/attached_assets/generated_images/Orange_oblong_tablet_2baf0769.png";
const greenCapsuleImg = "/attached_assets/generated_images/Green_capsule_pill_c79c173a.png";
const beigeTabletImg = "/attached_assets/generated_images/Beige_oval_tablet_e36342f1.png";

// Mock pill database for identification
const pillDatabase = [
  { id: "1", name: "Lisinopril", type: "white-round", image: whiteTabletImg, commonFor: "Blood Pressure" },
  { id: "2", name: "Metformin", type: "blue-oval", image: blueCapsuleImg, commonFor: "Diabetes" },
  { id: "3", name: "Atorvastatin", type: "yellow-round", image: yellowTabletImg, commonFor: "Cholesterol" },
  { id: "4", name: "Levothyroxine", type: "pink-round", image: pinkPillImg, commonFor: "Thyroid" },
  { id: "5", name: "Omeprazole", type: "red-white-capsule", image: redWhiteCapsuleImg, commonFor: "Acid Reflux" },
  { id: "6", name: "Amlodipine", type: "orange-oblong", image: orangeTabletImg, commonFor: "Blood Pressure" },
  { id: "7", name: "Gabapentin", type: "green-capsule", image: greenCapsuleImg, commonFor: "Nerve Pain" },
  { id: "8", name: "Aspirin", type: "beige-oval", image: beigeTabletImg, commonFor: "Heart Health" },
];

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication (Replit Auth)
  await setupAuth(app);

  // GET /api/auth/user - Get current authenticated user
  app.get("/api/auth/user", isAuthenticated, async (req, res) => {
    try {
      const claims = (req.user as any).claims;
      const user = await storage.getUser(claims.sub);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });
  
  // GET /api/medications - Get all medications in schedule
  app.get("/api/medications", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).claims.sub;
      const medications = await storage.getMedications(userId);
      res.json(medications);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch medications" });
    }
  });

  // GET /api/medications/:id - Get specific medication
  app.get("/api/medications/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).claims.sub;
      const medication = await storage.getMedication(req.params.id, userId);
      if (!medication) {
        return res.status(404).json({ error: "Medication not found" });
      }
      res.json(medication);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch medication" });
    }
  });

  // POST /api/medications - Create a new medication
  app.post("/api/medications", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).claims.sub;
      const validatedData = insertMedicationSchema.parse(req.body);
      const medication = await storage.createMedication(validatedData, userId);
      res.json(medication);
    } catch (error) {
      console.error("Failed to create medication:", error);
      res.status(400).json({ error: "Failed to create medication" });
    }
  });

  // PATCH /api/medications/:id - Update a medication
  app.patch("/api/medications/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).claims.sub;
      // Use dedicated update schema that only allows specific fields
      const validatedData = updateMedicationSchema.parse(req.body);
      const medication = await storage.updateMedication(req.params.id, validatedData, userId);
      if (!medication) {
        return res.status(404).json({ error: "Medication not found" });
      }
      res.json(medication);
    } catch (error) {
      console.error("Failed to update medication:", error);
      res.status(400).json({ error: "Failed to update medication" });
    }
  });

  // DELETE /api/medications/:id - Delete a medication
  app.delete("/api/medications/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).claims.sub;
      const deleted = await storage.deleteMedication(req.params.id, userId);
      if (!deleted) {
        return res.status(404).json({ error: "Medication not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Failed to delete medication:", error);
      res.status(500).json({ error: "Failed to delete medication" });
    }
  });

  // POST /api/identify-pill - Identify a scanned pill
  app.post("/api/identify-pill", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).claims.sub;
      // Get user's scheduled medications
      const scheduledMeds = await storage.getMedications(userId);
      
      // Filter pill database to only include scheduled medications
      const scheduledPills = pillDatabase.filter(pill => 
        scheduledMeds.some(med => med.name === pill.name)
      );
      
      // If no scheduled pills match, return a random one from the full database
      const availablePills = scheduledPills.length > 0 ? scheduledPills : pillDatabase;
      
      // Randomly select a pill to simulate identification
      const randomIndex = Math.floor(Math.random() * availablePills.length);
      const identifiedPill = availablePills[randomIndex];
      const confidence = Math.floor(Math.random() * 20) + 80; // 80-100%

      res.json({
        pillName: identifiedPill.name,
        pillType: identifiedPill.type,
        pillImage: identifiedPill.image,
        confidence,
        commonFor: identifiedPill.commonFor,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to identify pill" });
    }
  });

  // POST /api/logs - Create a medication log entry
  app.post("/api/logs", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).claims.sub;
      const validatedData = insertMedicationLogSchema.parse(req.body);
      const log = await storage.createMedicationLog(validatedData, userId);
      res.json(log);
    } catch (error) {
      console.error("Log creation error:", error);
      res.status(400).json({ error: "Invalid log data" });
    }
  });

  // GET /api/logs - Get all medication logs
  app.get("/api/logs", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).claims.sub;
      const logs = await storage.getMedicationLogs(userId);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch logs" });
    }
  });

  // GET /api/logs/today - Get today's medication logs
  app.get("/api/logs/today", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).claims.sub;
      const logs = await storage.getTodayLogs(userId);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch today's logs" });
    }
  });

  // GET /api/stats - Get medication statistics
  app.get("/api/stats", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).claims.sub;
      const medications = await storage.getMedications(userId);
      const todayLogs = await storage.getTodayLogs(userId);
      
      // Calculate today's schedule
      const today = new Date();
      const currentHour = today.getHours();
      const currentMinute = today.getMinutes();
      const currentTimeInMinutes = currentHour * 60 + currentMinute;

      // Count total unique doses scheduled for today
      const scheduledDoses = new Set<string>();
      const dosesSoFar = new Set<string>();
      
      medications.forEach(med => {
        med.times.forEach(time => {
          const doseKey = `${med.id}-${time}`;
          scheduledDoses.add(doseKey);
          
          const [hour, minute] = time.split(':').map(Number);
          const scheduleTimeInMinutes = hour * 60 + minute;
          if (scheduleTimeInMinutes <= currentTimeInMinutes) {
            dosesSoFar.add(doseKey);
          }
        });
      });

      const totalScheduledToday = scheduledDoses.size;
      const scheduledSoFar = dosesSoFar.size;
      
      const takenCount = todayLogs.filter(log => log.status === "taken").length;
      const missedCount = todayLogs.filter(log => log.status === "missed").length;
      
      // Pending count is doses that should have been taken by now but haven't been
      const pendingCount = Math.max(0, scheduledSoFar - takenCount - missedCount);
      
      // Calculate 7-day adherence
      const allLogs = await storage.getMedicationLogs(userId);
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const recentLogs = allLogs.filter(log => new Date(log.createdAt) >= sevenDaysAgo);
      const recentTaken = recentLogs.filter(log => log.status === "taken").length;
      const adherenceRate = recentLogs.length > 0 
        ? Math.round((recentTaken / recentLogs.length) * 100) 
        : 100;

      res.json({
        totalScheduledToday,
        takenCount,
        missedCount,
        pendingCount,
        adherenceRate,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch statistics" });
    }
  });

  // GET /api/notifications/vapid-public-key - Get VAPID public key for push subscription
  app.get("/api/notifications/vapid-public-key", (_req, res) => {
    try {
      const publicKey = notificationService.getVapidPublicKey();
      res.json({ publicKey });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch VAPID public key" });
    }
  });

  // POST /api/notifications/subscribe - Subscribe to push notifications
  app.post("/api/notifications/subscribe", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).claims.sub;
      const subscription = req.body as PushSubscription;
      
      // Validate subscription payload
      if (!subscription || 
          !subscription.endpoint || 
          !subscription.keys ||
          !subscription.keys.p256dh ||
          !subscription.keys.auth) {
        return res.status(400).json({ error: "Invalid subscription payload" });
      }
      
      // Persist subscription to storage
      await storage.upsertSubscription({
        userId,
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
        expirationTime: subscription.expirationTime ? new Date(subscription.expirationTime) : null,
      });
      
      // Also add to notification service for immediate use
      notificationService.addSubscription(userId, subscription);
      
      res.json({ success: true, message: "Subscription added successfully" });
    } catch (error) {
      console.error("Failed to subscribe:", error);
      res.status(500).json({ error: "Failed to subscribe to notifications" });
    }
  });

  // POST /api/notifications/unsubscribe - Unsubscribe from push notifications
  app.post("/api/notifications/unsubscribe", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).claims.sub;
      
      // Remove from storage
      await storage.deleteSubscription(userId);
      
      // Also remove from notification service
      notificationService.removeSubscription(userId);
      
      res.json({ success: true, message: "Subscription removed successfully" });
    } catch (error) {
      console.error("Failed to unsubscribe:", error);
      res.status(500).json({ error: "Failed to unsubscribe from notifications" });
    }
  });

  // POST /api/notifications/test - Send a test notification
  app.post("/api/notifications/test", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).claims.sub;
      const success = await notificationService.sendRefillReminder(
        userId,
        "Test Medication",
        5
      );
      
      if (success) {
        res.json({ success: true, message: "Test notification sent" });
      } else {
        res.status(400).json({ error: "No active subscription found" });
      }
    } catch (error) {
      console.error("Failed to send test notification:", error);
      res.status(500).json({ error: "Failed to send test notification" });
    }
  });

  // POST /api/surveys - Submit a medication survey
  app.post("/api/surveys", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).claims.sub;
      const validatedData = insertMedicationSurveySchema.parse(req.body);
      const survey = await storage.createMedicationSurvey(validatedData, userId);
      res.json(survey);
    } catch (error) {
      console.error("Failed to create survey:", error);
      res.status(400).json({ error: "Failed to create survey" });
    }
  });

  // GET /api/surveys - Get all surveys
  app.get("/api/surveys", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).claims.sub;
      const surveys = await storage.getMedicationSurveys(userId);
      res.json(surveys);
    } catch (error) {
      console.error("Failed to fetch surveys:", error);
      res.status(500).json({ error: "Failed to fetch surveys" });
    }
  });

  // GET /api/surveys/log/:logId - Get survey for a specific medication log
  app.get("/api/surveys/log/:logId", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).claims.sub;
      const survey = await storage.getSurveyByLogId(req.params.logId, userId);
      if (!survey) {
        return res.status(404).json({ error: "Survey not found" });
      }
      res.json(survey);
    } catch (error) {
      console.error("Failed to fetch survey:", error);
      res.status(500).json({ error: "Failed to fetch survey" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
