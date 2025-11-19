import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertMedicationLogSchema } from "@shared/schema";

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
  
  // GET /api/medications - Get all medications in schedule
  app.get("/api/medications", async (_req, res) => {
    try {
      const medications = await storage.getMedications();
      res.json(medications);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch medications" });
    }
  });

  // GET /api/medications/:id - Get specific medication
  app.get("/api/medications/:id", async (req, res) => {
    try {
      const medication = await storage.getMedication(req.params.id);
      if (!medication) {
        return res.status(404).json({ error: "Medication not found" });
      }
      res.json(medication);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch medication" });
    }
  });

  // POST /api/identify-pill - Identify a scanned pill
  app.post("/api/identify-pill", async (req, res) => {
    try {
      // Get user's scheduled medications
      const scheduledMeds = await storage.getMedications();
      
      // Filter pill database to only include scheduled medications
      // Note: Matches by name only. For production, consider matching by unique IDs
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
  app.post("/api/logs", async (req, res) => {
    try {
      const validatedData = insertMedicationLogSchema.parse(req.body);
      const log = await storage.createMedicationLog(validatedData);
      res.json(log);
    } catch (error) {
      console.error("Log creation error:", error);
      res.status(400).json({ error: "Invalid log data" });
    }
  });

  // GET /api/logs - Get all medication logs
  app.get("/api/logs", async (_req, res) => {
    try {
      const logs = await storage.getMedicationLogs();
      res.json(logs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch logs" });
    }
  });

  // GET /api/logs/today - Get today's medication logs
  app.get("/api/logs/today", async (_req, res) => {
    try {
      const logs = await storage.getTodayLogs();
      res.json(logs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch today's logs" });
    }
  });

  // GET /api/stats - Get medication statistics
  app.get("/api/stats", async (_req, res) => {
    try {
      const medications = await storage.getMedications();
      const todayLogs = await storage.getTodayLogs();
      
      // Calculate today's schedule
      const today = new Date();
      const currentHour = today.getHours();
      const currentMinute = today.getMinutes();
      const currentTimeInMinutes = currentHour * 60 + currentMinute;

      // Count total unique doses scheduled for today
      // Use medication-time pairs to avoid double-counting
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
      const allLogs = await storage.getMedicationLogs();
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

  const httpServer = createServer(app);
  return httpServer;
}
