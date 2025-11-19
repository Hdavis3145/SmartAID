# SmartAid Developer Quick Reference

## 🚀 Quick Start

### Run the Application
```bash
npm run dev
# Opens at http://localhost:5000
```

### Project Commands
```bash
npm install              # Install dependencies
npm run dev             # Start dev server
npm run build           # Build for production
npm run db:push         # Sync database schema
```

---

## 📂 File Navigation

### Need to...

**Add a new page?**
1. Create `client/src/pages/my-page.tsx`
2. Add route in `client/src/App.tsx`

**Add a new API endpoint?**
1. Open `server/routes.ts`
2. Add route (GET/POST/PUT/DELETE)
3. Use storage interface for database

**Add a new database table?**
1. Define schema in `shared/schema.ts`
2. Export insert schema + select type
3. Add methods to `server/storage.ts`
4. Run `npm run db:push`

**Add a new UI component?**
1. Create in `client/src/components/`
2. Import shadcn components from `@/components/ui/`
3. Use Tailwind for styling

**Add a new field to existing table?**
1. Edit schema in `shared/schema.ts`
2. Update insert schema (if needed)
3. Update TypeScript types
4. Run `npm run db:push`

---

## 🔄 Common Workflows

### 1. Add New Medication Field

**Example: Add "color" field to medications**

```typescript
// 1. Update schema (shared/schema.ts)
export const medications = pgTable("medications", {
  id: varchar("id").primaryKey(),
  name: text("name").notNull(),
  dosage: text("dosage").notNull(),
  color: text("color"),  // ← NEW FIELD
  // ... other fields
});

// 2. Update insert schema
export const insertMedicationSchema = createInsertSchema(medications)
  .omit({ id: true, createdAt: true })
  .extend({
    color: z.string().optional(),  // ← VALIDATION
  });

// 3. Run database sync
// npm run db:push

// 4. Update frontend form (client/src/pages/scan.tsx or wherever)
<FormField
  control={form.control}
  name="color"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Pill Color</FormLabel>
      <FormControl>
        <Input {...field} placeholder="Blue" />
      </FormControl>
    </FormItem>
  )}
/>
```

### 2. Add New API Endpoint

**Example: Get medications by name**

```typescript
// server/routes.ts

router.get('/api/medications/search', async (req, res) => {
  try {
    // 1. Get query parameter
    const { name } = req.query;
    
    // 2. Validate input
    if (!name || typeof name !== 'string') {
      return res.status(400).json({ error: 'Name required' });
    }
    
    // 3. Call storage method
    const results = await storage.searchMedicationsByName(name);
    
    // 4. Return results
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Then add storage method (server/storage.ts)
async searchMedicationsByName(name: string): Promise<Medication[]> {
  return this.medications.filter(m => 
    m.name.toLowerCase().includes(name.toLowerCase())
  );
}
```

### 3. Add New React Page

**Example: Add "Reports" page**

```typescript
// 1. Create page component (client/src/pages/reports.tsx)
import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import BottomNav from "@/components/BottomNav";

export default function Reports() {
  const { data: surveys = [] } = useQuery({
    queryKey: ['/api/surveys'],
  });
  
  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-2xl mx-auto p-6">
        <h1 className="text-[32px] font-bold">Health Reports</h1>
        
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Survey Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Total Surveys: {surveys.length}</p>
          </CardContent>
        </Card>
      </div>
      <BottomNav />
    </div>
  );
}

// 2. Add route (client/src/App.tsx)
import Reports from "@/pages/reports";

<Switch>
  <Route path="/" component={Home} />
  <Route path="/reports" component={Reports} />  {/* ← NEW */}
  {/* ... other routes */}
</Switch>

// 3. Add navigation link (client/src/components/BottomNav.tsx)
<Link href="/reports">
  <FileText className="w-6 h-6" />
  <span>Reports</span>
</Link>
```

### 4. Add Survey Question

**Example: Add "nausea" question**

```typescript
// 1. Update schema (shared/schema.ts)
export const medicationSurveys = pgTable("medication_surveys", {
  // ... existing fields
  hasDizziness: integer("has_dizziness").notNull(),
  hasPain: integer("has_pain").notNull(),
  hasNausea: integer("has_nausea"),  // ← NEW
  // ...
});

// 2. Update insert schema
export const insertMedicationSurveySchema = createInsertSchema(medicationSurveys)
  .extend({
    hasNausea: z.number().min(0).max(1).optional(),
  });

// 3. Update survey component (client/src/components/MedicationSurvey.tsx)
const [hasNausea, setHasNausea] = useState<number | null>(null);

// Add to form
<div className="space-y-3">
  <Label className="text-[24px]">Feeling Nauseous?</Label>
  <div className="grid grid-cols-2 gap-3">
    <Button
      type="button"
      variant={hasNausea === 0 ? "default" : "outline"}
      onClick={() => setHasNausea(0)}
      className="min-h-[64px] text-[22px]"
      data-testid="button-nausea-no"
    >
      No
    </Button>
    <Button
      type="button"
      variant={hasNausea === 1 ? "default" : "outline"}
      onClick={() => setHasNausea(1)}
      className="min-h-[64px] text-[22px]"
      data-testid="button-nausea-yes"
    >
      Yes
    </Button>
  </div>
</div>

// 4. Include in submission
surveyMutation.mutate({
  medicationLogId,
  medicationName,
  hasDizziness,
  hasPain,
  hasNausea,  // ← NEW
  // ...
});
```

---

## 🎨 Styling Guide

### Accessibility Requirements

All interactive elements must have:
- **Minimum height**: 64px (48px for secondary actions)
- **Minimum font size**: 22px for buttons, 20px for body text
- **High contrast**: Background + foreground clearly distinguishable

### Using Tailwind Classes

```tsx
// Large touch target button
<Button className="min-h-[64px] text-[22px]">
  Click Me
</Button>

// High contrast text
<p className="text-[20px] text-foreground">
  Easy to read text
</p>

// Accessible card
<Card className="p-6 space-y-4">
  <CardTitle className="text-[28px]">Title</CardTitle>
  <CardContent className="text-[20px]">Content</CardContent>
</Card>
```

### Using shadcn Components

```tsx
// Import from @/components/ui/
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

// Always add data-testid for testing
<Button data-testid="button-submit">Submit</Button>
```

---

## 🔍 Debugging Tips

### Frontend Issues

**Check Network Requests**
1. Open DevTools (F12)
2. Go to Network tab
3. Click button that isn't working
4. Look for failed API calls (red)
5. Check request/response in details

**Check React State**
```tsx
// Add console.log to see state
console.log('Current state:', { showSurvey, loggedMedication });

// Check query data
const { data, isLoading, error } = useQuery({...});
console.log({ data, isLoading, error });
```

**Check Form Errors**
```tsx
const form = useForm({...});

// Log form errors
console.log('Form errors:', form.formState.errors);
```

### Backend Issues

**Check Server Logs**
```bash
# Server logs show in terminal where you ran `npm run dev`
# Look for error messages, stack traces
```

**Test API Directly**
```bash
# Use curl to test endpoints
curl http://localhost:5000/api/medications

# POST with data
curl -X POST http://localhost:5000/api/logs \
  -H "Content-Type: application/json" \
  -d '{"medicationId":"123","status":"taken"}'
```

**Check Database**
```typescript
// Add logging in storage methods
async getMedications(userId: string) {
  console.log('Getting medications for:', userId);
  const results = this.medications.filter(...);
  console.log('Found:', results.length);
  return results;
}
```

---

## 📊 Data Flow Examples

### How a Medication Gets Logged

```
1. User clicks "Mark as Taken"
   ↓
2. handleMarkTaken() runs
   ↓
3. markTakenMutation.mutate({ medicationId, ... })
   ↓
4. apiRequest('POST', '/api/logs', data)
   ↓
5. Backend: router.post('/api/logs', ...)
   ↓
6. Validate with Zod: insertMedicationLogSchema.parse(data)
   ↓
7. Save: storage.createLog(validatedData)
   ↓
8. Return: res.json(newLog)
   ↓
9. Frontend: mutation.onSuccess()
   ↓
10. Invalidate cache: queryClient.invalidateQueries()
    ↓
11. Show survey: setShowSurvey(true)
    ↓
12. User answers survey
    ↓
13. surveyMutation.mutate({ ... })
    ↓
14. Backend: router.post('/api/surveys', ...)
    ↓
15. Save: storage.createSurvey(surveyData)
    ↓
16. Frontend: Dialog closes, data refreshes
```

### How TanStack Query Caching Works

```typescript
// First time: Fetches from server
const { data } = useQuery({ queryKey: ['/api/medications'] });
// → GET http://localhost:5000/api/medications

// Second time: Returns from cache
const { data } = useQuery({ queryKey: ['/api/medications'] });
// → No network request! Returns cached data

// After mutation: Cache invalidated, refetches
queryClient.invalidateQueries({ queryKey: ['/api/medications'] });
// → GET http://localhost:5000/api/medications (fresh data)
```

---

## 🧪 Testing

### Manual Testing Checklist

**Scan Flow**:
- [ ] Camera permission requested
- [ ] Camera view appears
- [ ] Capture button works
- [ ] AI detection works (or shows manual selector)
- [ ] Survey appears after logging
- [ ] Survey saves correctly
- [ ] History shows logged dose

**Home Dashboard**:
- [ ] Statistics show correct counts
- [ ] "Mark as Taken" button appears for pending doses
- [ ] Clicking button logs dose
- [ ] Survey appears after marking taken
- [ ] Dashboard updates after survey

**Push Notifications**:
- [ ] Test notification button works
- [ ] Medication reminder fires at scheduled time
- [ ] Refill reminder shows when stock is low

### Adding Test IDs

Always add `data-testid` for:
- Buttons: `data-testid="button-{action}"`
- Inputs: `data-testid="input-{field}"`
- Cards: `data-testid="card-{type}"`
- Text: `data-testid="text-{description}"`

```tsx
// Good examples
<Button data-testid="button-submit">Submit</Button>
<Input data-testid="input-medication-name" />
<Card data-testid="card-medication-aspirin" />
<p data-testid="text-adherence-rate">95%</p>
```

---

## 🚨 Common Mistakes to Avoid

### 1. Forgetting to Invalidate Cache

```typescript
// ❌ BAD - Cache not updated
const mutation = useMutation({
  mutationFn: async (data) => {
    await apiRequest('POST', '/api/logs', data);
  }
  // Missing: onSuccess to invalidate cache!
});

// ✅ GOOD - Cache invalidated
const mutation = useMutation({
  mutationFn: async (data) => {
    await apiRequest('POST', '/api/logs', data);
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['/api/logs'] });
  }
});
```

### 2. Not Validating Input

```typescript
// ❌ BAD - No validation
router.post('/api/medications', async (req, res) => {
  const med = await storage.createMedication(req.body);
  res.json(med);
});

// ✅ GOOD - Validated with Zod
router.post('/api/medications', async (req, res) => {
  const result = insertMedicationSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }
  const med = await storage.createMedication(result.data);
  res.json(med);
});
```

### 3. Missing Error Handling

```typescript
// ❌ BAD - No error handling
async function loadMedications() {
  const response = await fetch('/api/medications');
  const data = await response.json();
  return data;
}

// ✅ GOOD - Handles errors
async function loadMedications() {
  try {
    const response = await fetch('/api/medications');
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to load medications:', error);
    toast({
      title: "Error",
      description: "Could not load medications",
      variant: "destructive"
    });
    return [];
  }
}
```

### 4. Hardcoded Values

```typescript
// ❌ BAD - Magic numbers
<Button className="min-h-[56px] text-[20px]">Click</Button>

// ✅ GOOD - Consistent sizes
<Button className="min-h-[64px] text-[22px]">Click</Button>

// Even better - Use variants
<Button size="default">Click</Button>
```

---

## 🎯 Performance Tips

### 1. Lazy Load Pages

```typescript
import { lazy, Suspense } from 'react';

const History = lazy(() => import('./pages/history'));

<Route path="/history">
  <Suspense fallback={<div>Loading...</div>}>
    <History />
  </Suspense>
</Route>
```

### 2. Optimize Images

```tsx
// Add loading="lazy" and proper sizes
<img 
  src={medication.imageUrl} 
  alt={medication.name}
  loading="lazy"
  className="w-20 h-20 object-cover"
/>
```

### 3. Use React.memo for Heavy Components

```tsx
const MedicationCard = React.memo(function MedicationCard({ name, dosage }) {
  return (
    <Card>
      <h3>{name}</h3>
      <p>{dosage}</p>
    </Card>
  );
});
```

---

## 🔐 Security Checklist

- [ ] API keys stored server-side only (never in frontend)
- [ ] All inputs validated with Zod
- [ ] SQL injection prevented (using ORM, not raw SQL)
- [ ] CORS configured properly
- [ ] HTTPS in production
- [ ] Secrets not committed to git

---

## 📝 Code Style

### TypeScript

```typescript
// Use explicit types for function parameters
function calculateDosage(medication: Medication, time: string): number {
  // ...
}

// Use type inference for simple variables
const count = medications.length;  // inferred as number
```

### React Components

```typescript
// Export as default for pages
export default function Home() { ... }

// Export as named for reusable components
export function MedicationCard({ name, dosage }: Props) { ... }
```

### Naming Conventions

- **Components**: PascalCase (`MedicationCard`)
- **Functions**: camelCase (`handleSubmit`)
- **Constants**: UPPER_SNAKE_CASE (`DEFAULT_USER_ID`)
- **Files**: kebab-case (`medication-card.tsx`)

---

## 🎓 Learning Resources

**Understand the stack:**
1. React Docs: https://react.dev
2. TanStack Query: https://tanstack.com/query
3. Tailwind CSS: https://tailwindcss.com
4. shadcn/ui: https://ui.shadcn.com
5. Drizzle ORM: https://orm.drizzle.team
6. Zod: https://zod.dev

**Next steps:**
1. Read `TECHNICAL_DOCUMENTATION.md` for deep dive
2. Trace a complete feature flow (scan → log → survey)
3. Add a new field to see how data flows
4. Build a new page from scratch

---

## 🤝 Need Help?

**Common questions:**
- Where do I add a new page? → `client/src/pages/`
- Where do I add an API endpoint? → `server/routes.ts`
- Where do I change the database? → `shared/schema.ts`
- How do I test? → Use browser + DevTools Network tab
- App not updating? → Check cache invalidation in mutations

**Still stuck?**
1. Check the console for errors (both browser and terminal)
2. Read the relevant section in `TECHNICAL_DOCUMENTATION.md`
3. Trace the data flow from user action to database
4. Add `console.log` statements to see what's happening
