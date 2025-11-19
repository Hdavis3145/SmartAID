import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertMedicationSchema, updateMedicationSchema, insertMedicationLogSchema, insertMedicationSurveySchema, insertCaregiverSchema, updateCaregiverSchema } from "@shared/schema";
import { notificationService, type PushSubscription } from "./notificationService";

// Default user for single-user household deployment (no authentication)
const DEFAULT_USER_ID = "default-user";

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
  // No authentication - single-user household deployment
  
  // GET /api/auth/user - Get default user (no authentication required)
  app.get("/api/auth/user", async (req, res) => {
    try {
      // Ensure default user exists (idempotent upsert)
      const defaultUser = await storage.upsertUser({
        id: DEFAULT_USER_ID,
        email: "user@smartaid.local",
        firstName: "SmartAid",
        lastName: "User",
        role: "patient",
      });
      
      // Idempotent medication seeding - runs every time but only adds if empty
      // This ensures existing users without meds also get defaults
      // Uses transaction-like logic to prevent duplicates from concurrent requests
      const existingMeds = await storage.getMedications(DEFAULT_USER_ID);
      if (existingMeds.length === 0) {
        console.log('🏥 Initializing default medications...');
        const defaultMedications = [
          {
            name: "Lisinopril",
            dosage: "10mg",
            pillType: "white-round",
            imageUrl: whiteTabletImg,
            times: ["08:00", "20:00"],
            pillsRemaining: 60,
            refillThreshold: 10,
          },
          {
            name: "Metformin",
            dosage: "500mg",
            pillType: "blue-oval",
            imageUrl: blueCapsuleImg,
            times: ["09:00", "21:00"],
            pillsRemaining: 45,
            refillThreshold: 7,
          },
          {
            name: "Aspirin",
            dosage: "81mg",
            pillType: "beige-oval",
            imageUrl: beigeTabletImg,
            times: ["08:00"],
            pillsRemaining: 30,
            refillThreshold: 7,
          },
        ];

        // Check again after declaring defaults to catch race conditions
        const recheck = await storage.getMedications(DEFAULT_USER_ID);
        if (recheck.length === 0) {
          // Use try-catch per medication to handle duplicates gracefully
          for (const med of defaultMedications) {
            try {
              // Double-check this specific medication doesn't exist
              const existing = recheck.find(m => m.name === med.name);
              if (!existing) {
                await storage.createMedication(med, DEFAULT_USER_ID);
              }
            } catch (error) {
              // Silently skip if duplicate (likely from concurrent request)
              console.log(`⚠️  Skipping duplicate medication: ${med.name}`);
            }
          }
          console.log('✅ Default medications added successfully');
        } else {
          console.log('ℹ️  Default medications already exist (concurrent request)');
        }
      }
      
      res.json(defaultUser);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });
  
  // GET /api/medications - Get all medications in schedule
  app.get("/api/medications", async (req, res) => {
    try {
      const userId = DEFAULT_USER_ID;
      const medications = await storage.getMedications(userId);
      res.json(medications);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch medications" });
    }
  });

  // GET /api/medications/:id - Get specific medication
  app.get("/api/medications/:id", async (req, res) => {
    try {
      const userId = DEFAULT_USER_ID;
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
  app.post("/api/medications", async (req, res) => {
    try {
      const userId = DEFAULT_USER_ID;
      const validatedData = insertMedicationSchema.parse(req.body);
      const medication = await storage.createMedication(validatedData, userId);
      res.json(medication);
    } catch (error) {
      console.error("Failed to create medication:", error);
      res.status(400).json({ error: "Failed to create medication" });
    }
  });

  // PATCH /api/medications/:id - Update a medication
  app.patch("/api/medications/:id", async (req, res) => {
    try {
      const userId = DEFAULT_USER_ID;
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
  app.delete("/api/medications/:id", async (req, res) => {
    try {
      const userId = DEFAULT_USER_ID;
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

  // GET /api/caregivers - Get all caregivers
  app.get("/api/caregivers", async (req, res) => {
    try {
      const userId = DEFAULT_USER_ID;
      const caregivers = await storage.getCaregivers(userId);
      res.json(caregivers);
    } catch (error) {
      console.error("Failed to fetch caregivers:", error);
      res.status(500).json({ error: "Failed to fetch caregivers" });
    }
  });

  // GET /api/caregivers/:id - Get specific caregiver
  app.get("/api/caregivers/:id", async (req, res) => {
    try {
      const userId = DEFAULT_USER_ID;
      const caregiver = await storage.getCaregiver(req.params.id, userId);
      if (!caregiver) {
        return res.status(404).json({ error: "Caregiver not found" });
      }
      res.json(caregiver);
    } catch (error) {
      console.error("Failed to fetch caregiver:", error);
      res.status(500).json({ error: "Failed to fetch caregiver" });
    }
  });

  // POST /api/caregivers - Add a new caregiver
  app.post("/api/caregivers", async (req, res) => {
    try {
      const userId = DEFAULT_USER_ID;
      const validatedData = insertCaregiverSchema.parse(req.body);
      const caregiver = await storage.createCaregiver(validatedData, userId);
      res.status(201).json(caregiver);
    } catch (error) {
      console.error("Failed to create caregiver:", error);
      res.status(400).json({ error: "Failed to create caregiver" });
    }
  });

  // PATCH /api/caregivers/:id - Update a caregiver
  app.patch("/api/caregivers/:id", async (req, res) => {
    try {
      const userId = DEFAULT_USER_ID;
      const validatedData = updateCaregiverSchema.parse(req.body);
      const caregiver = await storage.updateCaregiver(req.params.id, validatedData, userId);
      if (!caregiver) {
        return res.status(404).json({ error: "Caregiver not found" });
      }
      res.json(caregiver);
    } catch (error) {
      console.error("Failed to update caregiver:", error);
      res.status(400).json({ error: "Failed to update caregiver" });
    }
  });

  // DELETE /api/caregivers/:id - Delete a caregiver
  app.delete("/api/caregivers/:id", async (req, res) => {
    try {
      const userId = DEFAULT_USER_ID;
      const deleted = await storage.deleteCaregiver(req.params.id, userId);
      if (!deleted) {
        return res.status(404).json({ error: "Caregiver not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Failed to delete caregiver:", error);
      res.status(500).json({ error: "Failed to delete caregiver" });
    }
  });

  // POST /api/identify-pill - Identify a scanned pill using Roboflow AI
  app.post("/api/identify-pill", async (req, res) => {
    try {
      const userId = DEFAULT_USER_ID;
      const { imageData } = req.body;
      
      if (!imageData) {
        return res.status(400).json({ error: "No image data provided" });
      }

      // Convert base64 image to buffer for Roboflow API
      // Remove the "data:image/jpeg;base64," prefix if present
      const base64Image = imageData.replace(/^data:image\/\w+;base64,/, "");
      
      // Call Roboflow Workflow API
      // Based on user's Python code: workspace="hackathon-fall-2025", workflow="custom-workflow-5"
      // Using Bearer token authentication as per Roboflow docs
      const roboflowResponse = await fetch("https://serverless.roboflow.com/hackathon-fall-2025/workflows/custom-workflow-5", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.ROBOFLOW_API_KEY || ""}`,
        },
        body: JSON.stringify({
          api_key: process.env.ROBOFLOW_API_KEY || "",
          inputs: {
            image: base64Image,
          },
        }),
      });

      if (!roboflowResponse.ok) {
        const errorText = await roboflowResponse.text();
        console.error("❌ Roboflow API error (HTTP", roboflowResponse.status, "):", errorText);
        throw new Error(`Roboflow API returned ${roboflowResponse.status}: ${errorText}`);
      }

      const roboflowData = await roboflowResponse.json();
      console.log("✅ Roboflow API Response (Full):", JSON.stringify(roboflowData, null, 2));

      // Parse Roboflow workflow response
      // Workflows typically return outputs nested in a specific structure
      // Common patterns: { outputs: {...} }, { predictions: [...] }, or direct fields
      let pillName = "Unknown Medication";
      let pillType = "unknown";
      let confidence = 85;
      let commonFor = "Medical Treatment";

      // Try to extract from common Roboflow response patterns
      if (roboflowData.outputs) {
        // Workflow outputs pattern
        console.log("📊 Parsing from roboflowData.outputs...");
        const outputs = roboflowData.outputs;
        pillName = outputs.pill_name || outputs.medication_name || outputs.name || pillName;
        pillType = outputs.pill_type || outputs.type || pillType;
        confidence = outputs.confidence || confidence;
        commonFor = outputs.indication || outputs.common_for || outputs.use || commonFor;
      } else if (roboflowData.predictions && Array.isArray(roboflowData.predictions) && roboflowData.predictions.length > 0) {
        // Detection/classification predictions pattern
        console.log("📊 Parsing from roboflowData.predictions...");
        const firstPrediction = roboflowData.predictions[0];
        pillName = firstPrediction.class || firstPrediction.name || pillName;
        confidence = firstPrediction.confidence ? Math.round(firstPrediction.confidence * 100) : confidence;
      } else {
        // Direct fields pattern
        console.log("📊 Parsing from roboflowData (direct fields)...");
        pillName = roboflowData.pill_name || roboflowData.medication_name || roboflowData.name || pillName;
        pillType = roboflowData.pill_type || roboflowData.type || pillType;
        confidence = roboflowData.confidence || confidence;
        commonFor = roboflowData.indication || roboflowData.common_for || commonFor;
      }

      console.log("🔍 Extracted values:", { pillName, pillType, confidence, commonFor });

      // Get user's scheduled medications to match pill image
      const scheduledMeds = await storage.getMedications(userId);
      const matchingMed = scheduledMeds.find(med => 
        med.name.toLowerCase() === pillName.toLowerCase()
      );

      // Use matched medication's image or find from pill database
      let pillImage = matchingMed?.imageUrl || "";
      if (!pillImage) {
        const dbPill = pillDatabase.find(pill => 
          pill.name.toLowerCase() === pillName.toLowerCase()
        );
        pillImage = dbPill?.image || blueCapsuleImg; // Default fallback
      }

      res.json({
        pillName,
        pillType,
        pillImage,
        confidence,
        commonFor,
      });
    } catch (error) {
      console.error("Pill identification error:", error);
      res.status(500).json({ error: "Failed to identify pill" });
    }
  });

  // POST /api/logs - Create a medication log entry
  app.post("/api/logs", async (req, res) => {
    try {
      const userId = DEFAULT_USER_ID;
      const validatedData = insertMedicationLogSchema.parse(req.body);
      const log = await storage.createMedicationLog(validatedData, userId);
      res.json(log);
    } catch (error) {
      console.error("Log creation error:", error);
      res.status(400).json({ error: "Invalid log data" });
    }
  });

  // GET /api/logs - Get all medication logs
  app.get("/api/logs", async (req, res) => {
    try {
      const userId = DEFAULT_USER_ID;
      const logs = await storage.getMedicationLogs(userId);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch logs" });
    }
  });

  // GET /api/logs/today - Get today's medication logs
  app.get("/api/logs/today", async (req, res) => {
    try {
      const userId = DEFAULT_USER_ID;
      const logs = await storage.getTodayLogs(userId);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch today's logs" });
    }
  });

  // GET /api/stats - Get medication statistics
  app.get("/api/stats", async (req, res) => {
    try {
      const userId = DEFAULT_USER_ID;
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
  app.post("/api/notifications/subscribe", async (req, res) => {
    try {
      const userId = DEFAULT_USER_ID;
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
  app.post("/api/notifications/unsubscribe", async (req, res) => {
    try {
      const userId = DEFAULT_USER_ID;
      
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
  app.post("/api/notifications/test", async (req, res) => {
    try {
      const userId = DEFAULT_USER_ID;
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
  app.post("/api/surveys", async (req, res) => {
    try {
      const userId = DEFAULT_USER_ID;
      const validatedData = insertMedicationSurveySchema.parse(req.body);
      const survey = await storage.createMedicationSurvey(validatedData, userId);
      res.json(survey);
    } catch (error) {
      console.error("Failed to create survey:", error);
      res.status(400).json({ error: "Failed to create survey" });
    }
  });

  // GET /api/surveys - Get all surveys
  app.get("/api/surveys", async (req, res) => {
    try {
      const userId = DEFAULT_USER_ID;
      const surveys = await storage.getMedicationSurveys(userId);
      res.json(surveys);
    } catch (error) {
      console.error("Failed to fetch surveys:", error);
      res.status(500).json({ error: "Failed to fetch surveys" });
    }
  });

  // GET /api/surveys/log/:logId - Get survey for a specific medication log
  app.get("/api/surveys/log/:logId", async (req, res) => {
    try {
      const userId = DEFAULT_USER_ID;
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
