import whiteTabletImg from "@assets/generated_images/White_round_tablet_pill_531071e0.png";
import blueCapsuleImg from "@assets/generated_images/Blue_oval_capsule_90e60c59.png";
import yellowTabletImg from "@assets/generated_images/Yellow_circular_tablet_b7928714.png";
import pinkPillImg from "@assets/generated_images/Pink_round_pill_056d7a48.png";
import redWhiteCapsuleImg from "@assets/generated_images/Red_white_capsule_670d2c29.png";
import orangeTabletImg from "@assets/generated_images/Orange_oblong_tablet_2baf0769.png";
import greenCapsuleImg from "@assets/generated_images/Green_capsule_pill_c79c173a.png";
import beigeTabletImg from "@assets/generated_images/Beige_oval_tablet_e36342f1.png";

// Mock pill database for identification
export const pillDatabase = [
  {
    id: "1",
    name: "Lisinopril",
    type: "white-round",
    image: whiteTabletImg,
    commonFor: "Blood Pressure",
  },
  {
    id: "2",
    name: "Metformin",
    type: "blue-oval",
    image: blueCapsuleImg,
    commonFor: "Diabetes",
  },
  {
    id: "3",
    name: "Atorvastatin",
    type: "yellow-round",
    image: yellowTabletImg,
    commonFor: "Cholesterol",
  },
  {
    id: "4",
    name: "Levothyroxine",
    type: "pink-round",
    image: pinkPillImg,
    commonFor: "Thyroid",
  },
  {
    id: "5",
    name: "Omeprazole",
    type: "red-white-capsule",
    image: redWhiteCapsuleImg,
    commonFor: "Acid Reflux",
  },
  {
    id: "6",
    name: "Amlodipine",
    type: "orange-oblong",
    image: orangeTabletImg,
    commonFor: "Blood Pressure",
  },
  {
    id: "7",
    name: "Gabapentin",
    type: "green-capsule",
    image: greenCapsuleImg,
    commonFor: "Nerve Pain",
  },
  {
    id: "8",
    name: "Aspirin",
    type: "beige-oval",
    image: beigeTabletImg,
    commonFor: "Heart Health",
  },
];

// Mock medication schedule
export const mockMedications = [
  {
    id: "med-1",
    name: "Lisinopril",
    dosage: "10mg",
    pillType: "white-round",
    imageUrl: whiteTabletImg,
    times: ["08:00", "20:00"],
  },
  {
    id: "med-2",
    name: "Metformin",
    dosage: "500mg",
    pillType: "blue-oval",
    imageUrl: blueCapsuleImg,
    times: ["09:00", "21:00"],
  },
  {
    id: "med-3",
    name: "Atorvastatin",
    dosage: "20mg",
    pillType: "yellow-round",
    imageUrl: yellowTabletImg,
    times: ["20:00"],
  },
  {
    id: "med-4",
    name: "Levothyroxine",
    dosage: "50mcg",
    pillType: "pink-round",
    imageUrl: pinkPillImg,
    times: ["07:00"],
  },
];

// Mock medication logs
export const mockLogs = [
  {
    id: "log-1",
    medicationId: "med-1",
    medicationName: "Lisinopril",
    scheduledTime: "08:00",
    takenTime: new Date("2024-11-19T08:05:00"),
    status: "taken",
    confidence: 95,
    scannedPillType: "white-round",
    createdAt: new Date("2024-11-19T08:05:00"),
  },
  {
    id: "log-2",
    medicationId: "med-4",
    medicationName: "Levothyroxine",
    scheduledTime: "07:00",
    takenTime: new Date("2024-11-19T07:10:00"),
    status: "taken",
    confidence: 92,
    scannedPillType: "pink-round",
    createdAt: new Date("2024-11-19T07:10:00"),
  },
  {
    id: "log-3",
    medicationId: "med-2",
    medicationName: "Metformin",
    scheduledTime: "09:00",
    takenTime: null,
    status: "pending",
    confidence: null,
    scannedPillType: null,
    createdAt: new Date("2024-11-19T00:00:00"),
  },
];
