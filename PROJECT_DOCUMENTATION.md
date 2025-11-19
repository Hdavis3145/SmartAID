# SmartAid - Medication Tracking PWA Documentation

## 📋 Project Overview

**SmartAid** is a Progressive Web Application (PWA) designed for elderly users to track medications using AI-powered pill scanning. Built with React, Express, PostgreSQL, and Roboflow AI.

**Key Features:**
- 🎥 Camera-based pill scanning with AI identification (Roboflow)
- 📅 Medication scheduling and reminders
- 📊 Daily intake tracking with health surveys
- 📈 Statistics and history tracking
- 🔔 Push notifications for medication reminders
- ♿ Accessibility-first design (large fonts, high contrast, 64px touch targets)

---

## 🏗️ Architecture

### Technology Stack

**Frontend:**
- React 18.3.1 - UI framework
- TypeScript - Type safety
- Vite - Build tool and dev server
- Wouter - Client-side routing (lightweight alternative to React Router)
- TanStack Query v5 - Data fetching and caching
- Tailwind CSS - Styling
- Shadcn/ui - Accessible component library

**Backend:**
- Node.js 20.x
- Express.js - Web server
- PostgreSQL (Neon) - Database
- Drizzle ORM - Database queries and schema management

**External Services:**
- Roboflow AI - Pill identification via computer vision
- Web Push API - Browser push notifications

**Build Tools:**
- esbuild - Fast JavaScript bundler
- tsx - TypeScript execution for Node.js
- drizzle-kit - Database migrations

---

## 📁 Project Structure

```
smartaid/
├── client/                          # Frontend React application
│   ├── src/
│   │   ├── components/             # Reusable UI components
│   │   │   ├── ui/                # Shadcn base components (Button, Card, etc.)
│   │   │   ├── BottomNav.tsx      # Mobile navigation bar
│   │   │   ├── CameraView.tsx     # Camera interface for pill scanning
│   │   │   ├── MedicationCard.tsx # Display medication info
│   │   │   ├── MedicationSurvey.tsx # Post-intake health survey
│   │   │   ├── NotificationSettings.tsx # Push notification setup
│   │   │   └── PillIdentification.tsx # AI scan results display
│   │   ├── hooks/                 # Custom React hooks
│   │   │   ├── use-toast.ts       # Toast notification hook
│   │   │   └── useAuth.ts         # Authentication hook (unused in single-user mode)
│   │   ├── lib/                   # Utilities and helpers
│   │   │   └── queryClient.ts     # TanStack Query configuration
│   │   ├── pages/                 # Page components
│   │   │   ├── home.tsx           # Dashboard with daily summary
│   │   │   ├── schedule.tsx       # View/edit medication schedule
│   │   │   ├── scan.tsx           # Camera scanning page
│   │   │   ├── history.tsx        # Medication log history
│   │   │   └── settings.tsx       # App settings
│   │   ├── App.tsx                # Main app component with routing
│   │   ├── main.tsx               # React entry point
│   │   └── index.css              # Global styles and Tailwind config
│   └── index.html                 # HTML entry point
│
├── server/                         # Backend Express server
│   ├── db.ts                      # Database connection setup
│   ├── storage.ts                 # Database query layer (CRUD operations)
│   ├── routes.ts                  # API endpoint definitions
│   ├── notificationService.ts     # Push notification handling
│   ├── vite.ts                    # Vite dev server integration
│   └── index.ts                   # Express server entry point
│
├── shared/                         # Code shared between frontend and backend
│   └── schema.ts                  # Database schema and TypeScript types
│
├── db/                            # Database configuration
│   └── schema.ts                  # Drizzle schema definitions
│
├── attached_assets/               # Static assets (pill images)
│   └── generated_images/          # AI-generated pill images
│
├── package.json                   # Node.js dependencies
├── tsconfig.json                  # TypeScript configuration
├── tailwind.config.ts             # Tailwind CSS configuration
├── vite.config.ts                 # Vite build configuration
└── drizzle.config.ts              # Drizzle ORM configuration
```

---

## 📦 Dependencies Explained

### Frontend Dependencies

#### Core React Libraries
```javascript
import { useState, useEffect, useRef } from "react";
```
- **useState** - Manages component state (e.g., form inputs, loading states)
- **useEffect** - Runs side effects (e.g., fetch data when component loads)
- **useRef** - Access DOM elements (used for camera video element)

```javascript
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
```
- **useQuery** - Fetch data from backend APIs and cache results
- **useMutation** - Send data to backend (POST/PATCH/DELETE)
- **useQueryClient** - Invalidate cache after data changes

#### Routing
```javascript
import { Route, Switch, useLocation } from "wouter";
```
- **wouter** - Lightweight client-side routing (3x smaller than React Router)
- **Route** - Define URL paths and which component to show
- **Switch** - Render first matching route
- **useLocation** - Navigate programmatically (`setLocation("/scan")`)

#### UI Components (Shadcn/ui)
```javascript
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
```
- **Shadcn/ui** - Accessible, unstyled components built on Radix UI
- All components support keyboard navigation, screen readers, ARIA attributes
- Uses Tailwind CSS for styling

#### Form Handling
```javascript
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
```
- **react-hook-form** - Performant form library with validation
- **zod** - Schema validation (ensures data is correct before submitting)
- **zodResolver** - Connects Zod schemas to react-hook-form

#### Icons
```javascript
import { Camera, Calendar, Pill, ChartBar, Settings } from "lucide-react";
```
- **lucide-react** - Beautiful, consistent icon set (400+ icons)
- Tree-shakeable (only imports icons you use)

#### Styling
```javascript
import { cn } from "@/lib/utils";
```
- **clsx** + **tailwind-merge** - Combines Tailwind classes intelligently
- Prevents conflicting classes (e.g., `text-sm text-lg` → keeps `text-lg`)

### Backend Dependencies

#### Express Server
```javascript
import express from "express";
```
- **express** - Web server framework
- Handles HTTP requests (GET, POST, PATCH, DELETE)
- Serves frontend and API routes

#### Database
```javascript
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
```
- **Drizzle ORM** - Type-safe database queries
- **Neon** - Serverless PostgreSQL database
- Generates SQL queries from TypeScript code

Example:
```typescript
// Drizzle code (TypeScript)
await db.select().from(medications).where(eq(medications.userId, userId));

// Generates SQL:
// SELECT * FROM medications WHERE user_id = 'default-user';
```

#### Schema Validation
```javascript
import { insertMedicationSchema } from "@shared/schema";
```
- **drizzle-zod** - Auto-generates Zod schemas from database tables
- Validates API request bodies before saving to database

#### Notifications
```javascript
import webpush from "web-push";
```
- **web-push** - Send browser push notifications
- Uses VAPID keys for authentication
- Works even when browser is closed

---

## 🔑 Key Imports Explained by File

### `client/src/pages/scan.tsx` (Camera Scanning)

```typescript
import { useState } from "react";
// Track scanning state: isScanning, identifiedPill, showSurvey

import { useMutation, useQuery } from "@tanstack/react-query";
// useQuery: Fetch user's medications
// useMutation: Send captured image to Roboflow AI

import CameraView from "@/components/CameraView";
// Custom component that accesses device camera via navigator.mediaDevices.getUserMedia()

import { apiRequest } from "@/lib/queryClient";
// Helper function to call backend APIs with error handling
```

**How camera scanning works:**
1. CameraView component requests camera access
2. User captures photo → converts to base64 JPEG
3. `identifyMutation.mutate(imageData)` sends to `/api/identify-pill`
4. Backend calls Roboflow AI with base64 image
5. Roboflow returns pill name, type, confidence
6. Display results in PillIdentification component
7. User confirms → log medication intake
8. Show health survey (dizziness, pain level, appetite)

### `server/routes.ts` (Roboflow Integration)

```typescript
// POST /api/identify-pill endpoint
const { imageData } = req.body;  // Base64 image from camera

// Remove "data:image/jpeg;base64," prefix
const base64Image = imageData.replace(/^data:image\/\w+;base64,/, "");

// Call Roboflow Workflow API
const roboflowResponse = await fetch(
  "https://serverless.roboflow.com/hackathon-fall-2025/workflows/custom-workflow-5",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.ROBOFLOW_API_KEY}`,
    },
    body: JSON.stringify({
      api_key: process.env.ROBOFLOW_API_KEY,
      inputs: { image: base64Image },
    }),
  }
);

const roboflowData = await roboflowResponse.json();
// Parse response for pill name, type, confidence
```

**Roboflow API Details:**
- **Workspace**: hackathon-fall-2025
- **Workflow ID**: custom-workflow-5
- **Authentication**: Bearer token in Authorization header
- **Request**: Base64 image in `inputs.image`
- **Response**: JSON with pill identification data

### `server/storage.ts` (Database Layer)

```typescript
import { db } from "./db";
import { medications, medicationLogs, users } from "@shared/schema";
import { eq, and, gte, lte } from "drizzle-orm";

// Example: Get all medications for a user
async getMedications(userId: string) {
  return await db
    .select()
    .from(medications)
    .where(eq(medications.userId, userId));
}

// Example: Log medication intake
async createMedicationLog(data: InsertMedicationLog, userId: string) {
  const [log] = await db
    .insert(medicationLogs)
    .values({ ...data, userId })
    .returning();
  return log;
}
```

**Database Operations:**
- **eq** - Equality check (WHERE user_id = '...')
- **and** - Combine conditions (WHERE x AND y)
- **gte** / **lte** - Greater/less than (for date ranges)
- **.returning()** - Return inserted/updated row

---

## 🗄️ Database Schema

### Tables

#### `users`
```sql
CREATE TABLE users (
  id VARCHAR PRIMARY KEY,
  email VARCHAR UNIQUE NOT NULL,
  first_name VARCHAR NOT NULL,
  last_name VARCHAR NOT NULL,
  role VARCHAR NOT NULL DEFAULT 'patient'
);
```

#### `medications`
```sql
CREATE TABLE medications (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR NOT NULL REFERENCES users(id),
  name VARCHAR NOT NULL,
  dosage VARCHAR NOT NULL,
  pill_type VARCHAR,
  image_url VARCHAR,
  times TEXT[] NOT NULL,  -- Array of times like ["08:00", "20:00"]
  pills_remaining INTEGER DEFAULT 0,
  refill_threshold INTEGER DEFAULT 7
);
```

#### `medication_logs`
```sql
CREATE TABLE medication_logs (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR NOT NULL REFERENCES users(id),
  medication_id VARCHAR NOT NULL REFERENCES medications(id),
  medication_name VARCHAR NOT NULL,
  scheduled_time VARCHAR NOT NULL,
  taken_time TIMESTAMP NOT NULL,
  status VARCHAR NOT NULL,  -- 'taken', 'missed', 'skipped'
  confidence INTEGER,  -- AI confidence (0-100)
  scanned_pill_type VARCHAR
);
```

#### `medication_surveys`
```sql
CREATE TABLE medication_surveys (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  medication_log_id VARCHAR NOT NULL REFERENCES medication_logs(id),
  dizzy BOOLEAN NOT NULL,
  pain_level INTEGER NOT NULL,  -- 1-10 scale
  appetite VARCHAR NOT NULL  -- 'good', 'poor', 'none'
);
```

---

## 🔐 Environment Variables

### Required Secrets (stored in Replit Secrets)

```bash
# PostgreSQL Database
DATABASE_URL=postgresql://...
PGHOST=...
PGPORT=5432
PGDATABASE=...
PGUSER=...
PGPASSWORD=...

# Push Notifications
VAPID_PUBLIC_KEY=...
VAPID_PRIVATE_KEY=...
SESSION_SECRET=...

# Roboflow AI
ROBOFLOW_API_KEY=VKnYM5QyrBd48P3blZy3
```

**How to access in code:**
- Backend: `process.env.ROBOFLOW_API_KEY`
- Frontend: `import.meta.env.VITE_ROBOFLOW_API_KEY` (must prefix with `VITE_`)

---

## 🚀 Running the Application

### Development Mode
```bash
npm install          # Install dependencies
npm run dev          # Start dev server (frontend + backend)
```

**What `npm run dev` does:**
1. Starts Express server on port 5000
2. Starts Vite dev server (frontend)
3. Vite proxies API requests to Express
4. Hot Module Replacement (HMR) - instant updates when you edit code

### Production Build
```bash
npm run build        # Build frontend for production
npm start            # Start production server
```

### Database Management
```bash
npm run db:push      # Sync Drizzle schema to database
npm run db:studio    # Open Drizzle Studio (database GUI)
```

---

## 🎨 Styling System

### Tailwind CSS
SmartAid uses **utility-first CSS** with Tailwind:

```tsx
// Instead of writing CSS:
<button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
  Click me
</button>

// CSS generated:
.bg-blue-500 { background-color: #3b82f6; }
.hover\:bg-blue-700:hover { background-color: #1d4ed8; }
.text-white { color: #ffffff; }
```

### Accessibility Classes (Elderly-Friendly)
```tsx
// Extra large touch targets (64px minimum)
<Button className="min-h-16 text-[22px] px-8">
  Take Medication
</Button>

// High contrast colors
className="bg-primary text-primary-foreground border-2"

// Large, readable text
className="text-[48px] font-bold"  // 48pt heading
className="text-[24px]"            // 24pt body text
```

### Color System (defined in `index.css`)
```css
:root {
  --primary: 210 100% 35%;        /* Dark blue */
  --primary-foreground: 0 0% 100%; /* White text */
  --destructive: 0 84% 60%;       /* Red for warnings */
  --muted: 210 20% 95%;           /* Light gray backgrounds */
}
```

---

## 🔔 Push Notifications

### How They Work

1. **User grants permission** (NotificationSettings.tsx):
```typescript
const permission = await Notification.requestPermission();
if (permission === 'granted') {
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: VAPID_PUBLIC_KEY
  });
  // Save subscription to backend
}
```

2. **Backend sends notification** (notificationService.ts):
```typescript
await webpush.sendNotification(subscription, JSON.stringify({
  title: "Medication Reminder",
  body: "Time to take Metformin (500mg)",
  icon: "/pill-icon.png",
  tag: "medication-reminder"
}));
```

3. **Browser displays notification** even if app is closed

### Notification Triggers
- **Scheduled reminders** - 15 minutes before each medication time
- **Refill alerts** - When `pills_remaining <= refill_threshold`
- **Missed doses** - If medication not logged 1 hour after scheduled time

---

## 🤖 Roboflow AI Integration

### How Pill Scanning Works

1. **Camera Capture** (CameraView.tsx):
```typescript
// Access device camera
const stream = await navigator.mediaDevices.getUserMedia({
  video: { facingMode: "environment" }  // Prefer rear camera
});

// Capture image to canvas
const canvas = document.createElement('canvas');
const context = canvas.getContext('2d');
context.drawImage(videoElement, 0, 0);

// Convert to base64 JPEG
const imageData = canvas.toDataURL('image/jpeg', 0.9);
```

2. **Send to Backend** (scan.tsx):
```typescript
const identifyMutation = useMutation({
  mutationFn: async (imageData: string) => {
    const res = await apiRequest("POST", "/api/identify-pill", { imageData });
    return res.json();
  }
});
```

3. **Call Roboflow AI** (routes.ts):
```typescript
// Remove base64 prefix
const base64Image = imageData.replace(/^data:image\/\w+;base64,/, "");

// Call Roboflow Workflow API
const response = await fetch(
  "https://serverless.roboflow.com/hackathon-fall-2025/workflows/custom-workflow-5",
  {
    headers: { Authorization: `Bearer ${ROBOFLOW_API_KEY}` },
    body: JSON.stringify({ inputs: { image: base64Image } })
  }
);
```

4. **Parse Response**:
```typescript
const data = await response.json();
const pillName = data.outputs?.pill_name || "Unknown Medication";
const confidence = data.outputs?.confidence || 85;
```

5. **Match to Schedule**:
```typescript
const medications = await storage.getMedications(userId);
const matchingMed = medications.find(m => m.name === pillName);
// Use matchingMed.imageUrl for display
```

---

## 📱 Progressive Web App (PWA)

### Service Worker
SmartAid is a PWA, which means it can:
- Work offline (cached assets)
- Be installed to phone home screen
- Receive push notifications when closed

**Configured in `vite.config.ts`:**
```typescript
VitePWA({
  registerType: 'autoUpdate',
  manifest: {
    name: 'SmartAid',
    short_name: 'SmartAid',
    theme_color: '#1e40af',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' }
    ]
  }
})
```

---

## 🧪 Testing the Application

### Manual Testing Checklist

**Medication Management:**
- [ ] Add medication with schedule
- [ ] Edit medication details
- [ ] Delete medication
- [ ] View medication list

**Pill Scanning:**
- [ ] Open camera (grant permission)
- [ ] Capture pill photo
- [ ] Roboflow identifies pill correctly
- [ ] Confirm and log intake
- [ ] Complete health survey

**Dashboard:**
- [ ] View today's schedule
- [ ] See completed medications (green checkmark)
- [ ] See missed medications (red X)
- [ ] View statistics (adherence %, pills remaining)

**Notifications:**
- [ ] Enable push notifications
- [ ] Receive reminder before scheduled time
- [ ] Receive refill alert when low on pills

**Mobile Experience:**
- [ ] Large buttons (easy to tap)
- [ ] High contrast text (easy to read)
- [ ] Bottom navigation (thumb-friendly)
- [ ] Install to home screen (PWA)

---

## 🚀 Deployment Options

### Option 1: Replit Deployment (Recommended)
1. Click "Publish" button in Replit
2. Choose deployment type (Autoscale recommended)
3. Get permanent URL: `https://smartaid-xyz.replit.app`
4. Backend + Frontend + Database all work together

### Option 2: Firebase Hosting (Frontend Only)
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Initialize Firebase
firebase init hosting
# Choose build directory: dist
# Single-page app: Yes

# Build frontend
npm run build

# Deploy
firebase deploy --only hosting
```

**Important:** With Firebase Hosting, you still need to:
- Host backend on Replit (or Firebase Functions)
- Keep PostgreSQL database on Neon/Replit
- Update frontend to point to backend URL

---

## 🔧 Troubleshooting

### Camera Not Working
```typescript
// Check browser support
if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
  alert("Your browser doesn't support camera access");
}

// Check HTTPS (camera requires secure context)
if (window.location.protocol !== 'https:') {
  console.warn("Camera requires HTTPS");
}
```

### Roboflow API Errors
```bash
# Check API key is set
echo $ROBOFLOW_API_KEY

# Check server logs for error details
# Look for: "❌ Roboflow API error (HTTP 401)"
```

### Database Connection Issues
```bash
# Verify DATABASE_URL is set
echo $DATABASE_URL

# Push schema again
npm run db:push --force
```

### Build Errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
rm -rf node_modules/.vite
npm run dev
```

---

## 📚 Learning Resources

### React & TypeScript
- [React Docs](https://react.dev) - Official React documentation
- [TypeScript Handbook](https://www.typescriptlang.org/docs/) - Learn TypeScript

### Tailwind CSS
- [Tailwind Docs](https://tailwindcss.com/docs) - Utility-first CSS
- [Shadcn/ui](https://ui.shadcn.com) - Component library

### Backend
- [Express.js Guide](https://expressjs.com/en/guide/routing.html) - Routing
- [Drizzle ORM](https://orm.drizzle.team/docs/overview) - Database queries

### APIs
- [Roboflow Docs](https://docs.roboflow.com) - Computer vision API
- [Web Push API](https://developer.mozilla.org/en-US/docs/Web/API/Push_API) - Browser notifications

---

## 🎯 Key Concepts Summary

### Single-User Mode
SmartAid uses a **default user** (`DEFAULT_USER_ID = "default-user"`) instead of authentication:
- No login required
- Perfect for single household (elderly user + caregiver)
- All data associated with default user ID

### Accessibility-First Design
- **64px minimum touch targets** - Easy for elderly users with tremors
- **48pt+ headings** - Large, readable text
- **High contrast colors** - Dark blue primary with white text
- **No emoji** - Professional, clean interface
- **Simple navigation** - Bottom nav bar (thumb-friendly)

### Real-Time Features
- **TanStack Query** - Automatic cache invalidation
- **Optimistic Updates** - UI updates before server confirms
- **Push Notifications** - Reminders even when app closed
- **Service Worker** - Offline support

---

## 📞 Support

For questions or issues:
1. Check this documentation first
2. Review server logs for errors
3. Test on mobile device (not just desktop)
4. Verify all environment variables are set

---

**Built with ❤️ for elderly users who deserve simple, accessible technology.**
