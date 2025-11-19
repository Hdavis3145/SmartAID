# SmartAid Technical Documentation

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure)
4. [Data Flow & How It Works](#data-flow--how-it-works)
5. [Database Schema](#database-schema)
6. [Backend Architecture](#backend-architecture)
7. [Frontend Architecture](#frontend-architecture)
8. [Key Features Deep Dive](#key-features-deep-dive)
9. [API Reference](#api-reference)
10. [State Management](#state-management)

---

## Architecture Overview

SmartAid is a **full-stack Progressive Web Application (PWA)** built with a clear separation between frontend and backend:

```
┌─────────────────────────────────────────────┐
│           Frontend (React + Vite)           │
│  - Camera UI                                │
│  - Medication Dashboard                     │
│  - Survey Forms                             │
│  - Push Notification Client                 │
└──────────────────┬──────────────────────────┘
                   │ HTTP/REST API
                   ↓
┌─────────────────────────────────────────────┐
│        Backend (Express.js + Node)          │
│  - API Routes                               │
│  - Roboflow AI Integration                  │
│  - Push Notifications                       │
│  - Scheduler (refills, reminders)           │
└──────────────────┬──────────────────────────┘
                   │
                   ↓
┌─────────────────────────────────────────────┐
│      Storage Layer (In-Memory / Firestore)  │
│  - Medications                              │
│  - Logs                                     │
│  - Surveys                                  │
│  - Users & Caregivers                       │
└─────────────────────────────────────────────┘
```

### Why This Architecture?

1. **Separation of Concerns**: Frontend handles UI/UX, backend handles business logic
2. **API-First Design**: Makes it easy to add mobile apps or other clients later
3. **Scalability**: Can deploy frontend and backend independently
4. **Security**: Sensitive operations (AI calls, notifications) happen server-side

---

## Technology Stack

### Frontend Technologies

| Tool | Purpose | Why We Use It |
|------|---------|---------------|
| **React 18** | UI Framework | Component-based, great ecosystem, excellent for PWAs |
| **TypeScript** | Type Safety | Catches bugs early, better developer experience |
| **Vite** | Build Tool | Fast development, optimized production builds |
| **Wouter** | Routing | Lightweight alternative to React Router (only 1.5kb) |
| **TanStack Query** | Data Fetching | Automatic caching, background updates, optimistic updates |
| **Tailwind CSS** | Styling | Utility-first CSS, rapid development, small bundle size |
| **shadcn/ui** | Component Library | Accessible, customizable components built on Radix UI |
| **Lucide React** | Icons | Modern, clean icons with consistent design |

### Backend Technologies

| Tool | Purpose | Why We Use It |
|------|---------|---------------|
| **Express.js** | Web Framework | Minimal, flexible, industry standard |
| **Drizzle ORM** | Database ORM | Type-safe, SQL-like syntax, works with Firestore |
| **Zod** | Schema Validation | Runtime type checking, great TypeScript integration |
| **web-push** | Push Notifications | Standard Web Push protocol implementation |
| **Roboflow API** | AI Pill Detection | Pre-trained computer vision models |
| **node-cron** | Scheduling | Automated reminders and refill notifications |

### Why These Specific Tools?

**React + Vite**: Fastest development experience, best PWA support
**TanStack Query**: Eliminates 90% of data fetching boilerplate code
**Tailwind + shadcn**: Build accessible, beautiful UIs 10x faster
**Express**: Simple, battle-tested, easy to deploy to Firebase Functions
**Drizzle**: Type-safe database queries prevent runtime errors
**Zod**: Single source of truth for data validation (frontend + backend)

---

## Project Structure

```
smartaid/
├── client/                    # Frontend React Application
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   │   ├── ui/           # shadcn components (Button, Card, etc.)
│   │   │   ├── MedicationCard.tsx
│   │   │   ├── MedicationSurvey.tsx  # Post-dose survey dialog
│   │   │   ├── BottomNav.tsx
│   │   │   └── ...
│   │   ├── pages/            # Page components (routes)
│   │   │   ├── home.tsx      # Dashboard
│   │   │   ├── scan.tsx      # Camera + AI scanning
│   │   │   ├── schedule.tsx  # Medication schedule
│   │   │   ├── history.tsx   # Intake logs
│   │   │   └── settings.tsx  # App settings
│   │   ├── lib/              # Utilities
│   │   │   ├── queryClient.ts    # TanStack Query config
│   │   │   ├── refillUtils.ts    # Refill calculations
│   │   │   └── utils.ts
│   │   ├── hooks/            # Custom React hooks
│   │   │   ├── use-toast.tsx
│   │   │   └── use-camera.tsx
│   │   ├── App.tsx           # Root component + routing
│   │   ├── index.css         # Global styles + Tailwind
│   │   └── main.tsx          # React entry point
│   └── index.html
│
├── server/                    # Backend Express Application
│   ├── routes.ts             # API endpoint definitions
│   ├── storage.ts            # Data persistence layer
│   ├── notificationService.ts # Push notification logic
│   ├── index.ts              # Express server setup
│   └── vite.ts               # Vite dev server integration
│
├── shared/                    # Shared code (frontend + backend)
│   └── schema.ts             # Database schema + Zod validators
│
├── functions/                 # Firebase Cloud Functions (production)
│   ├── src/
│   │   ├── index.ts          # Cloud Function entry point
│   │   ├── storage.ts        # Firestore implementation
│   │   ├── notificationService.ts
│   │   └── types.ts
│   └── package.json
│
└── firebase.json             # Firebase deployment config
```

### Key Concepts

**Shared Schema** (`shared/schema.ts`): 
- Single source of truth for data types
- Used by both frontend and backend
- Ensures type safety across the entire app

**Storage Interface** (`server/storage.ts`):
- Abstract interface for database operations
- Can swap between in-memory (dev) and Firestore (prod)
- Makes testing easier

**Component Composition**:
- Small, focused components
- Reusable UI components in `components/ui/`
- Page-specific components in `pages/`

---

## Data Flow & How It Works

### Example: Logging a Medication Dose with Survey

Let's trace what happens when a user clicks "Mark as Taken":

```
1. USER INTERACTION
   └─> User clicks "Mark as Taken" button in home.tsx
       
2. FRONTEND (React Component)
   └─> handleMarkTaken() function is called
       └─> useMutation hook triggers
           └─> POST request to /api/logs
               └─> apiRequest() helper sends HTTP request
               
3. BACKEND (Express API)
   └─> POST /api/logs route receives request
       └─> Validates data with Zod schema (insertMedicationLogSchema)
           └─> If valid: storage.createLog(logData)
               └─> Writes to database
                   └─> Returns log ID
                   
4. FRONTEND (Query Response)
   └─> Mutation onSuccess callback runs
       └─> Invalidates cache (forces refetch of logs)
       └─> Shows success toast notification
       └─> Sets survey state: setShowSurvey(true)
           └─> Opens MedicationSurvey dialog
           
5. USER INTERACTION
   └─> User answers survey questions
       └─> Clicks "Submit Survey"
       
6. FRONTEND (Survey Component)
   └─> handleSubmit() function
       └─> useMutation for POST /api/surveys
       
7. BACKEND (Express API)
   └─> POST /api/surveys route
       └─> Validates survey data
       └─> storage.createSurvey(surveyData)
           └─> Writes survey to database
           
8. FRONTEND (Final Update)
   └─> Survey dialog closes
   └─> Dashboard refreshes with updated stats
   └─> History page shows new log entry
```

### Data Flow Diagram

```
┌──────────┐
│  User    │
└────┬─────┘
     │ Clicks "Mark as Taken"
     ↓
┌──────────────────────┐
│  home.tsx            │
│  handleMarkTaken()   │
└──────────┬───────────┘
           │ markTakenMutation.mutate()
           ↓
┌──────────────────────┐
│  TanStack Query      │
│  Mutation Hook       │
└──────────┬───────────┘
           │ POST /api/logs
           ↓
┌──────────────────────┐
│  Express Router      │
│  routes.ts           │
└──────────┬───────────┘
           │ Zod validation
           ↓
┌──────────────────────┐
│  Storage Layer       │
│  storage.createLog() │
└──────────┬───────────┘
           │ Save to DB
           ↓
┌──────────────────────┐
│  Database            │
│  (Memory/Firestore)  │
└──────────────────────┘
```

---

## Database Schema

All schemas are defined in `shared/schema.ts` using Drizzle ORM.

### Core Tables

#### 1. **users** - User Accounts
```typescript
{
  id: string (UUID)           // Primary key
  email: string              // User email
  username: string           // Display name
  createdAt: Date            // Account creation
}
```

**Why**: Single-user app uses DEFAULT_USER_ID, but schema supports multi-user

#### 2. **medications** - Medication Schedule
```typescript
{
  id: string (UUID)           // Primary key
  userId: string              // Foreign key to users
  name: string                // e.g., "Aspirin"
  dosage: string              // e.g., "100mg"
  frequency: string           // e.g., "daily"
  times: string[]             // e.g., ["08:00", "20:00"]
  imageUrl: string            // Pill photo
  currentStock: number        // Pills remaining
  daysSupply: number          // Days until refill needed
  refillReminderDays: number  // When to alert (default: 7)
  createdAt: Date
}
```

**Why**: Stores entire medication schedule
**Key Fields**:
- `times[]`: Array allows multiple doses per day
- `currentStock`: Tracks pills remaining for refill alerts
- `imageUrl`: Used for visual identification

#### 3. **medicationLogs** - Dose Intake History
```typescript
{
  id: string (UUID)           // Primary key
  userId: string              // Foreign key
  medicationId: string        // Foreign key to medications
  medicationName: string      // Denormalized for easy lookup
  scheduledTime: string       // When dose was due
  takenTime: string           // When actually taken
  status: "taken" | "missed" | "pending"
  scannedPillType: string     // Roboflow detection result
  confidence: number          // AI confidence (0-1)
  createdAt: Date
}
```

**Why**: Complete audit trail of medication intake
**Key Fields**:
- `confidence`: 0 = manual entry, >0 = AI scanned
- `status`: Backend marks as "missed" if overdue

#### 4. **medicationSurveys** - Post-Dose Health Data
```typescript
{
  id: string (UUID)           // Primary key
  medicationLogId: string     // Foreign key to medicationLogs
  medicationName: string      // For easy display
  hasDizziness: number        // 0 = No, 1 = Yes
  hasPain: number             // 0 = No, 1 = Yes
  painLevel: number | null    // 0-10 (if hasPain = 1)
  appetiteLevel: string       // "good" | "reduced" | "none"
  notes: string               // Optional user notes
  createdAt: Date
}
```

**Why**: Track medication side effects and health status
**Use Case**: Caregiver can review trends, doctor can see patterns

#### 5. **caregivers** - Emergency Contacts
```typescript
{
  id: string (UUID)
  userId: string
  name: string
  relationship: string        // e.g., "Daughter", "Nurse"
  email: string
  phone: string
  receiveAlerts: boolean      // Should they get notifications?
  createdAt: Date
}
```

**Why**: Caregivers can monitor adherence and receive alerts

#### 6. **notificationSubscriptions** - Push Notification Tokens
```typescript
{
  id: string (UUID)
  userId: string
  subscription: object        // Web Push subscription object
  createdAt: Date
}
```

**Why**: Stores browser push notification endpoints

### Schema Validation

Every table has **two Zod schemas**:

1. **Insert Schema**: For creating new records
```typescript
export const insertMedicationSchema = createInsertSchema(medications)
  .omit({ id: true, createdAt: true });
```

2. **Select Type**: TypeScript type for reading records
```typescript
export type Medication = typeof medications.$inferSelect;
```

**Why**: Ensures data is validated before database writes

---

## Backend Architecture

### Express Server (`server/index.ts`)

```typescript
const app = express();

// Middleware
app.use(express.json());        // Parse JSON bodies
app.use(cors());                // Allow cross-origin requests

// API Routes
app.use('/api', routes);        // All API endpoints

// Vite Development Server (dev mode only)
app.use(vite.middlewares);      // Serves React app

app.listen(5000);
```

**Key Concepts**:
- **Middleware**: Functions that process requests before routes
- **Modular Routes**: All API logic in `routes.ts`
- **Vite Integration**: Same server for frontend + backend in dev

### API Routes (`server/routes.ts`)

All routes follow this pattern:

```typescript
// 1. Define route
router.post('/api/logs', async (req, res) => {
  
  // 2. Validate input with Zod
  const result = insertMedicationLogSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }
  
  // 3. Call storage layer
  const log = await storage.createLog(result.data);
  
  // 4. Return result
  res.json(log);
});
```

**Why This Pattern**:
1. **Validation First**: Never trust client input
2. **Storage Abstraction**: Easy to swap databases
3. **Error Handling**: Consistent error responses
4. **Type Safety**: Zod ensures types match schema

### Storage Layer (`server/storage.ts`)

Abstract interface with two implementations:

```typescript
interface IStorage {
  // Users
  getUser(id: string): Promise<User | null>;
  createUser(data: InsertUser): Promise<User>;
  
  // Medications
  getMedications(userId: string): Promise<Medication[]>;
  createMedication(data: InsertMedication): Promise<Medication>;
  
  // Logs
  getLogs(userId: string): Promise<MedicationLog[]>;
  createLog(data: InsertMedicationLog): Promise<MedicationLog>;
  
  // Surveys
  createSurvey(data: InsertMedicationSurvey): Promise<MedicationSurvey>;
  // ... and more
}
```

**Development**: In-memory storage (data lost on restart)
**Production**: Firestore storage (persistent, scalable)

**Why**: Easy to test, easy to migrate databases

### Roboflow AI Integration

```typescript
async function identifyPill(imageBase64: string) {
  // 1. Send image to Roboflow API
  const response = await fetch(ROBOFLOW_API_URL, {
    method: 'POST',
    body: imageBase64,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  });
  
  // 2. Parse predictions
  const data = await response.json();
  const predictions = data.predictions || [];
  
  // 3. Return best match (highest confidence)
  return predictions[0];
}
```

**How It Works**:
1. Frontend captures camera image
2. Converts to base64 string
3. Sends to backend `/api/identify-pill`
4. Backend forwards to Roboflow
5. Returns pill name + confidence score

### Push Notifications (`server/notificationService.ts`)

```typescript
// 1. Generate VAPID keys (one-time setup)
const vapidKeys = webpush.generateVAPIDKeys();

// 2. Configure web-push
webpush.setVapidDetails(
  'mailto:your-email@example.com',
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

// 3. Send notification
async function sendNotification(subscription, payload) {
  await webpush.sendNotification(subscription, JSON.stringify(payload));
}
```

**Notification Types**:
1. **Medication Reminders**: Sent at scheduled times
2. **Refill Alerts**: Sent when stock is low
3. **Caregiver Alerts**: Sent when doses are missed

### Schedulers (Cron Jobs)

```typescript
// Check every minute for medication reminders
cron.schedule('* * * * *', () => {
  checkAndSendMedicationReminders();
});

// Check daily for refill reminders (at 9 AM)
cron.schedule('0 9 * * *', () => {
  checkAndSendRefillReminders();
});
```

**How Reminders Work**:
1. Scheduler runs every minute
2. Queries medications for current user
3. Checks if any dose times match current time
4. Sends push notification if time matches
5. Prevents duplicate notifications with tracking

---

## Frontend Architecture

### React App Entry Point (`client/src/main.tsx`)

```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

**Purpose**: Mount React app to HTML

### Root Component (`client/src/App.tsx`)

```typescript
export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/scan" component={Scan} />
          <Route path="/schedule" component={Schedule} />
          <Route path="/history" component={History} />
          <Route path="/settings" component={Settings} />
          <Route component={NotFound} />
        </Switch>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
```

**Key Providers**:
- **QueryClientProvider**: TanStack Query for data fetching
- **TooltipProvider**: Radix UI tooltip context
- **Toaster**: Toast notification system

### Routing (Wouter)

```typescript
// Navigate programmatically
const [, setLocation] = useLocation();
setLocation('/scan');

// Link component
<Link href="/schedule">View Schedule</Link>
```

**Why Wouter**: 10x smaller than React Router, same functionality

### Data Fetching (TanStack Query)

```typescript
// Fetch data
const { data, isLoading } = useQuery<Medication[]>({
  queryKey: ['/api/medications'],
  // queryFn automatically uses apiRequest
});

// Mutate data
const mutation = useMutation({
  mutationFn: async (data) => {
    const res = await apiRequest('POST', '/api/logs', data);
    return res.json();
  },
  onSuccess: () => {
    // Invalidate cache to refetch
    queryClient.invalidateQueries({ queryKey: ['/api/logs'] });
  }
});
```

**Key Concepts**:
- **queryKey**: Unique identifier for cached data
- **Automatic Caching**: Data is cached and reused
- **Background Updates**: Refetches data automatically
- **Optimistic Updates**: UI updates before server responds

### Form Handling (React Hook Form + Zod)

```typescript
const form = useForm({
  resolver: zodResolver(insertMedicationSchema),
  defaultValues: {
    name: '',
    dosage: '',
    frequency: 'daily',
  }
});

function onSubmit(data) {
  mutation.mutate(data);
}
```

**Why This Pattern**:
- **Validation**: Zod ensures data is correct
- **Type Safety**: TypeScript knows field types
- **Error Handling**: Automatic error messages

### Camera Hook (`client/src/hooks/use-camera.tsx`)

```typescript
const { videoRef, capture, error } = useCamera();

// Access camera
useEffect(() => {
  navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => {
      videoRef.current.srcObject = stream;
    });
}, []);

// Capture photo
function capture() {
  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  canvas.getContext('2d').drawImage(video, 0, 0);
  return canvas.toDataURL('image/jpeg');
}
```

**How Camera Works**:
1. Request camera permission
2. Stream video to `<video>` element
3. On capture: Draw video frame to canvas
4. Convert canvas to base64 image
5. Send to backend for AI analysis

---

## Key Features Deep Dive

### 1. AI Pill Scanning

**Flow**:
```
User → Camera → Capture → Base64 → Backend → Roboflow → Result
```

**Code Path**:
1. `scan.tsx`: Displays camera view
2. User clicks capture button
3. `handleCapture()`: Converts video frame to base64
4. `identifyMutation`: Sends to `/api/identify-pill`
5. Backend: Forwards to Roboflow API
6. Returns: `{ class: "Aspirin", confidence: 0.95 }`
7. Frontend: Displays result or manual selector

**Fallback**: If confidence < 70% or no detection, show manual selector

### 2. Manual Medication Selection

**When Used**:
- Camera not available
- AI detection fails
- User prefers manual selection

**Code**:
```typescript
{!identified && medications.length > 0 && (
  <div className="space-y-3">
    <h3>Select Your Medication</h3>
    {medications.map(med => (
      <Card onClick={() => handleManualSelect(med)}>
        <img src={med.imageUrl} />
        <h4>{med.name}</h4>
      </Card>
    ))}
  </div>
)}
```

### 3. Post-Medication Survey

**Purpose**: Track side effects and health status after each dose

**Questions**:
1. Dizziness? (Yes/No)
2. Pain? (Yes/No + 1-10 scale)
3. Appetite? (Good/Reduced/None)
4. Notes? (Optional text)

**Code Flow**:
```typescript
// 1. Show survey after logging dose
setShowSurvey(true);

// 2. User answers questions
const [hasDizziness, setHasDizziness] = useState<number | null>(null);
const [hasPain, setHasPain] = useState<number | null>(null);

// 3. Submit to backend
surveyMutation.mutate({
  medicationLogId,
  hasDizziness,
  hasPain,
  painLevel,
  appetiteLevel,
  notes
});
```

**Why Important**: Helps caregivers/doctors identify medication issues

### 4. Smart Refill Reminders

**Algorithm**:
```typescript
function calculateRefillStatus(medication) {
  const dailyDoses = medication.times.length;
  const daysRemaining = medication.currentStock / dailyDoses;
  const reminderThreshold = medication.refillReminderDays;
  
  if (daysRemaining <= 0) {
    return { urgent: true, message: "Out of stock!" };
  }
  if (daysRemaining <= reminderThreshold) {
    return { urgent: true, message: `${daysRemaining} days left` };
  }
  return { urgent: false, message: "Stock OK" };
}
```

**Notification Trigger**:
- Runs daily at 9 AM
- Checks all medications
- Sends push notification if stock is low

### 5. Medication Reminders

**How It Works**:
```typescript
// Every minute, check if reminder is needed
cron.schedule('* * * * *', async () => {
  const now = new Date();
  const currentTime = `${now.getHours()}:${now.getMinutes()}`;
  
  // Get all medications for user
  const medications = await storage.getMedications(userId);
  
  // Check each medication's scheduled times
  medications.forEach(med => {
    if (med.times.includes(currentTime)) {
      // Check if already taken today
      const alreadyTaken = await checkIfTaken(med.id, currentTime);
      
      if (!alreadyTaken) {
        // Send push notification
        sendNotification({
          title: "Time for your medication",
          body: `${med.name} - ${med.dosage}`
        });
      }
    }
  });
});
```

---

## API Reference

### Medication Endpoints

#### GET `/api/medications`
Get all medications for current user

**Response**:
```json
[
  {
    "id": "uuid",
    "name": "Aspirin",
    "dosage": "100mg",
    "frequency": "daily",
    "times": ["08:00", "20:00"],
    "imageUrl": "https://...",
    "currentStock": 30,
    "daysSupply": 15
  }
]
```

#### POST `/api/medications`
Create new medication

**Request**:
```json
{
  "name": "Aspirin",
  "dosage": "100mg",
  "frequency": "daily",
  "times": ["08:00", "20:00"],
  "imageUrl": "https://...",
  "currentStock": 30,
  "daysSupply": 15
}
```

#### PUT `/api/medications/:id`
Update medication

#### DELETE `/api/medications/:id`
Delete medication

### Log Endpoints

#### GET `/api/logs`
Get all medication logs

#### GET `/api/logs/today`
Get today's logs only

#### POST `/api/logs`
Create medication log

**Request**:
```json
{
  "medicationId": "uuid",
  "medicationName": "Aspirin",
  "scheduledTime": "08:00",
  "takenTime": "2024-11-19T08:05:00Z",
  "status": "taken",
  "scannedPillType": "Aspirin",
  "confidence": 0.95
}
```

### Survey Endpoints

#### GET `/api/surveys`
Get all survey responses

#### GET `/api/surveys/:logId`
Get survey for specific log

#### POST `/api/surveys`
Submit survey

**Request**:
```json
{
  "medicationLogId": "uuid",
  "medicationName": "Aspirin",
  "hasDizziness": 0,
  "hasPain": 1,
  "painLevel": 3,
  "appetiteLevel": "reduced",
  "notes": "Slight headache"
}
```

### AI Endpoints

#### POST `/api/identify-pill`
Identify pill from image

**Request**:
```json
{
  "image": "data:image/jpeg;base64,/9j/4AAQ..."
}
```

**Response**:
```json
{
  "class": "Aspirin",
  "confidence": 0.95,
  "x": 320,
  "y": 240,
  "width": 50,
  "height": 50
}
```

### Statistics Endpoints

#### GET `/api/stats`
Get adherence statistics

**Response**:
```json
{
  "totalScheduledToday": 4,
  "takenCount": 3,
  "missedCount": 1,
  "pendingCount": 0,
  "adherenceRate": 85
}
```

### Notification Endpoints

#### POST `/api/notifications/subscribe`
Subscribe to push notifications

**Request**:
```json
{
  "subscription": {
    "endpoint": "https://...",
    "keys": {
      "p256dh": "...",
      "auth": "..."
    }
  }
}
```

#### POST `/api/notifications/test`
Send test notification

---

## State Management

### TanStack Query Cache

All server data is cached by query key:

```typescript
// Cache structure
{
  "/api/medications": [...medications],
  "/api/logs": [...logs],
  "/api/logs/today": [...todayLogs],
  "/api/stats": { takenCount: 3, ... }
}
```

**Cache Invalidation**:
```typescript
// After creating a log, refresh all related data
queryClient.invalidateQueries({ queryKey: ['/api/logs'] });
queryClient.invalidateQueries({ queryKey: ['/api/logs/today'] });
queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
```

### Component State (useState)

```typescript
// Local UI state
const [showSurvey, setShowSurvey] = useState(false);
const [selectedMed, setSelectedMed] = useState<Medication | null>(null);
```

**When to Use**:
- UI-only state (modals, dropdowns)
- Form inputs
- Temporary selections

**When NOT to Use**:
- Server data (use TanStack Query)
- Shared state (use context or query cache)

### URL State (Wouter)

```typescript
const [location, setLocation] = useLocation();

// URL is the source of truth for current page
if (location === '/scan') {
  // Show camera
}
```

---

## Key Takeaways

### Why This Stack Works

1. **Type Safety**: TypeScript + Zod catch bugs before runtime
2. **Fast Development**: Vite hot reload, Tailwind utilities
3. **Great UX**: TanStack Query caching, optimistic updates
4. **Accessible**: shadcn components built on Radix (WCAG compliant)
5. **Scalable**: Firebase handles millions of users
6. **Maintainable**: Clear separation of concerns, modular code

### Design Patterns Used

1. **API First**: Backend exposes REST API
2. **Schema First**: Define types before writing code
3. **Component Composition**: Small, reusable components
4. **Optimistic Updates**: UI updates before server responds
5. **Error Boundaries**: Graceful error handling
6. **Progressive Enhancement**: Works without camera/notifications

### Best Practices Followed

1. **Validation**: Always validate input (Zod)
2. **Type Safety**: Shared types between frontend/backend
3. **Error Handling**: Try/catch with user-friendly messages
4. **Accessibility**: Large touch targets, high contrast, ARIA labels
5. **Performance**: Code splitting, image optimization, caching
6. **Security**: API keys server-side, input sanitization

---

## Next Steps for Learning

To deeply understand this codebase:

1. **Start Here**: Read `shared/schema.ts` to understand data model
2. **Then**: Read `server/routes.ts` to see how API works
3. **Then**: Read `client/src/pages/home.tsx` to see how UI works
4. **Finally**: Trace a complete flow (e.g., logging a dose)

**Debugging Tips**:
- Use browser DevTools Network tab to see API calls
- Use React DevTools to inspect component state
- Check `npm run dev` console for backend errors
- Use TanStack Query DevTools to inspect cache

**Modify the App**:
- Add a new field to medication schema
- Create a new API endpoint
- Build a new page component
- Add a new survey question

This will cement your understanding of how all the pieces fit together!
