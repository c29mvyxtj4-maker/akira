# PHASE 6.1: iOS NATIVE APP DEVELOPMENT PLAN

**Target Launch:** October 2026 (8 weeks from start)  
**Primary Goal:** Feature-parity with web app on iPhone + Apple Watch companion  
**Success Metric:** 5,000+ downloads, 4.5+ rating, 30%+ D30 retention  

---

## WEEK 1-2: FOUNDATION & SETUP

### Capacitor Project Initialization
```bash
# Create iOS project
npx cap add ios

# Install required plugins
npm install @capacitor/app @capacitor/device @capacitor/filesystem
npm install @capacitor/sqlite
npm install @capacitor/background-tasks
npm install @capacitor/push-notifications
npm install @capacitor-community/health-kit
```

### Core Plugin Configuration

**1. SQLite Plugin (Offline Storage)**
```
Dependency: @capacitor/sqlite
Purpose: Local database for offline sync
Configuration: Create akira_local.db
Tables: 
  - time_entries (id, project_id, duration, billable, etc)
  - projects (id, name, status, etc)
  - clients (id, name, email, etc)
  - invoices (id, amount, status, etc)
```

**2. Push Notifications**
```
Dependency: @capacitor/push-notifications
Purpose: Real-time alerts
Setup: 
  - Apple Developer account
  - Generate Apple push certificate
  - Register for APNs
  - Token to backend
```

**3. Background Tasks**
```
Dependency: @capacitor/background-tasks
Purpose: Sync while app closed
Frequency: Every 15 minutes (configurable)
Tasks:
  - Sync time entries
  - Download new invoices
  - Check for notifications
```

**4. Health Integration**
```
Dependency: @capacitor-community/health-kit
Purpose: Apple Health sync
Permissions: HealthKit access
Data:
  - Daily step count
  - Heart rate
  - Activity minutes
```

**5. File System**
```
Dependency: @capacitor/filesystem
Purpose: Cache, documents, logs
Directories:
  - app_cache (temp files, images)
  - app_documents (persistent data)
  - app_support (app data)
```

### Code Signing & Provisioning

**Step 1: Apple Developer Account**
- Enroll in Apple Developer Program ($99/year)
- Create Team ID
- Generate development certificate

**Step 2: Provisioning Profile**
```
- Bundle ID: com.akira.app
- App ID prefix: Team ID
- Development devices: Register test devices
- Auto-manage signing (Xcode)
```

**Step 3: Build Configuration**
```
File: ios/App/App.xcodeproj
- Set team
- Set bundle ID
- Set signing certificate
- Configure capabilities (Push Notifications, HealthKit)
```

---

## WEEK 3-4: CORE FEATURES

### Feature 1: Timer (Quick-Start UX)

**Component: TimerScreen.jsx**
```javascript
// Floating action button (bottom-right)
// Large, tappable timer display
// Play/pause/reset controls
// Project selector quick-access
// Haptic feedback on tap

State:
- isRunning: boolean
- elapsedSeconds: number
- selectedProjectId: uuid
- taskDescription: string
```

**Implementation Details:**
- Use native timer (not setInterval)
- Persist state to SQLite
- Sync to cloud when online
- Haptic feedback via Capacitor/Vibration
- Lock screen timer widget (future phase)

**Testing:**
- Start timer, background app, resume → still running ✓
- Start timer, airplane mode → queued for sync ✓
- Timer at 59:59 → rolls to next minute ✓

---

### Feature 2: Time Entries List

**Component: TimeEntriesScreen.jsx**
```javascript
// List of today's entries
// Group by project
// Show duration + billable status
// Pull-to-refresh
// Quick edit (swipe actions)

State:
- entries: Array
- isLoading: boolean
- selectedEntry: TimeEntry
- editMode: boolean
```

**Implementation:**
- Infinite scroll (load 50 at a time)
- Swipe actions: edit, delete, duplicate
- Pull-to-refresh from cloud
- Date picker for navigation
- Search by project/description

**Database Query:**
```sql
SELECT * FROM time_entries 
WHERE date = TODAY 
ORDER BY created_at DESC
LIMIT 50
```

---

### Feature 3: Projects & Clients Quick View

**Component: ProjectsScreen.jsx**
```javascript
// Grid of active projects
// Each card shows:
  - Project name
  - Client name
  - Hours this week
  - Status
  - Tap to start timer

State:
- projects: Array
- filteredProjects: Array
- searchTerm: string
```

**Component: ClientsScreen.jsx**
```javascript
// List of clients
// Sort by recent
// Show total hours/revenue
// Tap to see projects under client

State:
- clients: Array
- selectedClient: Client
```

---

### Feature 4: Offline Database Initialization

**Service: offlineDb.service.js**
```javascript
export async function initializeOfflineDb() {
  // Create connection
  const db = await CapacitorSQLite.createConnection('akira_local')
  
  // Create tables
  await db.execute(`
    CREATE TABLE IF NOT EXISTS time_entries (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      project_id TEXT,
      description TEXT,
      duration_seconds INTEGER,
      billable BOOLEAN,
      date_started DATETIME,
      date_ended DATETIME,
      is_synced BOOLEAN DEFAULT false,
      created_at DATETIME,
      updated_at DATETIME
    );
    
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      name TEXT,
      client_id TEXT,
      status TEXT,
      hourly_rate INTEGER,
      created_at DATETIME,
      updated_at DATETIME
    );
    
    -- ... other tables
  `)
  
  return db
}
```

**Service: syncManager.service.js**
```javascript
export async function syncToCloud() {
  const unsynced = await getUnsyncedRecords()
  
  for (const record of unsynced) {
    try {
      // POST to Supabase
      await supabase.from(record.table).insert(record.data)
      await markSynced(record.id)
    } catch (error) {
      // Log error, retry later
      await logSyncError(record, error)
    }
  }
}
```

---

### Feature 5: Push Notifications Setup

**Service: notifications.service.js**
```javascript
export async function initializePushNotifications() {
  const { token } = await PushNotifications.register()
  
  // Send token to backend
  const user = await supabase.auth.getUser()
  await supabase
    .from('device_tokens')
    .upsert({
      user_id: user.id,
      device_token: token,
      platform: 'ios',
      device_name: await Device.getInfo().model
    })
  
  // Listen for notifications
  PushNotifications.addListener('pushNotificationReceived', (notification) => {
    handleNotification(notification)
  })
}

function handleNotification(notification) {
  // Show local notification
  // Update badge count
  // Navigate to relevant screen
  switch (notification.data.type) {
    case 'invoice_paid':
      // Show notification, navigate to Invoices
      break
    case 'project_update':
      // Show notification, navigate to project
      break
  }
}
```

---

## WEEK 5-6: INTEGRATION & POLISH

### Feature 1: Network Sync Integration

**Implement cross-device sync (from Phase 6)**
```javascript
export async function setupCrossDeviceSync() {
  // Register this device
  const deviceId = await Device.getId()
  await registerDevice(deviceId, 'ios', await Device.getInfo().osVersion)
  
  // Subscribe to state changes
  subscribeToStateChanges((payload) => {
    // Another device changed something
    // Update local cache
    // Show notification
    updateLocalDb(payload)
  })
}
```

---

### Feature 2: Apple Watch Companion App

**Target: Minimal viable watch app**

**WatchKit Project Setup:**
```
ios/App/App WatchKit Extension/
  - Assets.xcassets
  - Interface.storyboard
  - InterfaceController.swift
```

**Watch App Features:**
```
Screen 1: Timer (Main)
  - Large play/pause button
  - Time display (HH:MM:SS)
  - Current project name

Screen 2: Projects (Quick Access)
  - List of 5 active projects
  - Tap to start timer on project

Screen 3: Daily Summary (Complication)
  - Hours logged today
  - Revenue today
  - Active projects count

Screen 4: Quick Actions
  - Start timer
  - Stop timer
  - Log manual entry
```

**Watch to Phone Communication:**
```swift
// Send message from watch
WCSession.default().sendMessage(
  ["action": "start_timer", "projectId": projectId],
  replyHandler: { reply in
    // Update UI with response
  }
)

// Receive messages
func session(_ session: WCSession, didReceiveMessage message: [String : Any]) {
  DispatchQueue.main.async {
    // Handle incoming message
  }
}
```

---

### Feature 3: Health Integration

**Apple HealthKit Integration**
```javascript
import { HKHealthStore } from '@capacitor-community/health-kit'

export async function syncHealthData() {
  const stepCount = await HKHealthStore.getStepCount({
    startDate: todayStartDate,
    endDate: now
  })
  
  const heartRate = await HKHealthStore.getHeartRateSamples({
    startDate: todayStartDate,
    endDate: now
  })
  
  // Store locally
  await storeHealthMetrics({
    date: today,
    steps: stepCount,
    heart_rate: heartRate.average
  })
  
  // Correlate with productivity
  const productivity = await analyzeProductivityCorrelation()
  // Show insights
}
```

---

### Feature 4: Offline Capability

**Feature: Complete offline operation**
```
When offline:
- ✅ Start/stop timers
- ✅ Create time entries
- ✅ View cached projects/clients
- ✅ Browse history

When back online:
- ✅ Auto-sync all changes
- ✅ Download latest data
- ✅ Show sync status
- ✅ Handle conflicts
```

**Implementation:**
```javascript
export async function handleOfflineMode() {
  // Detect network
  subscribeToNetworkState((state) => {
    if (state.online) {
      // Back online - sync
      performBackgroundSync()
    } else {
      // Offline - queue operations
      setOfflineMode(true)
    }
  })
}
```

---

## WEEK 7-8: TESTING & DEPLOYMENT

### Quality Assurance

**Manual Testing Checklist:**
```
Timer:
  ✓ Start/pause/resume
  ✓ Stop and save
  ✓ Background timing
  ✓ Offline persistence

Time Entries:
  ✓ Create new entry
  ✓ Edit existing entry
  ✓ Delete entry
  ✓ Search/filter

Sync:
  ✓ Online sync to cloud
  ✓ Offline queueing
  ✓ Conflict resolution
  ✓ Cross-device broadcast

Apple Watch:
  ✓ Start timer from watch
  ✓ Stop timer from watch
  ✓ View project list
  ✓ See daily summary

Notifications:
  ✓ Receive push notification
  ✓ Tap to navigate
  ✓ Badge count updates

Performance:
  ✓ App launch time < 2s
  ✓ Scroll smoothness
  ✓ Memory usage < 200MB
  ✓ Battery impact reasonable
```

---

### App Store Submission

**Step 1: Prepare Assets**
```
- App Icon (1024x1024)
- Screenshots (x2-5 for each iPhone size)
- App Preview video (15-30s)
- App description
- Keywords (5-10 highly searchable)
- Support URL
- Privacy policy
```

**Step 2: App Store Connect Setup**
```
- Create App record
- Set up pricing & availability
- Add screenshots & preview
- Set age rating
- Add app category
```

**Step 3: App Review Preparation**
```
Guidelines:
- ✓ No crashes
- ✓ Functional timer
- ✓ Offline functionality
- ✓ No test data in production build
- ✓ Privacy policy linked
- ✓ Proper Health data usage

Note: Apple Health access requires user consent
```

**Step 4: Build & Submit**
```bash
# Production build
npm run build

# Upload to App Store Connect
# Set version (1.0.0)
# Upload IPA
# Fill in release notes
# Submit for review
```

**Timeline:**
- Review time: 1-3 days typically
- If rejected: Fix issues, resubmit
- Approval: App goes live

---

## PERFORMANCE TARGETS

### Metrics

```
App Launch Time:           < 2 seconds
Timer Start:               < 100ms
List scroll (50 entries):  60 FPS
Time entry sync:           < 5 seconds
Memory baseline:           < 150MB
Memory peak:               < 250MB
Battery drain (1h timer):  < 5%
```

### Optimization Strategies

1. **Code Splitting**
   - Lazy load screens not visible on startup
   - Async chunk loading

2. **Image Optimization**
   - WebP format where possible
   - Compression pipeline
   - Caching strategy

3. **Database Optimization**
   - Indexes on frequently queried fields
   - Pagination (50 items per page)
   - Archive old entries (>1 year)

4. **Network Optimization**
   - Request batching
   - Compression (gzip)
   - Delta sync (only changes)

---

## ROLLOUT STRATEGY

### Beta Phase (Week 5-6)
```
- 100 TestFlight beta testers
- Collect feedback
- Monitor crashes
- Measure retention
- Iterate on UX
```

### Soft Launch (Week 7)
```
- Australia/New Zealand launch
- Monitor App Store metrics
- Fix critical issues
- Gather reviews
```

### Full Launch (Week 8)
```
- Global availability
- App Store featured placement (negotiated)
- Press release
- Social media campaign
- Email newsletter announcement
```

---

## SUCCESS CRITERIA

### Launch Goals
```
Week 1:
- 500+ downloads
- 4.5+ average rating
- < 1% crash rate
- D1 retention > 40%

Week 2-4:
- 2,500+ downloads
- 4.5+ average rating
- D7 retention > 25%
- D30 retention > 15%

Month 2:
- 5,000+ downloads
- Feature parity with web
- ⚠️ If < 3,000 downloads: reassess UX
```

---

## TECHNICAL DEBT & FUTURE

### Phase 6.1 Scope (MVP)
- ✅ Timer (core feature)
- ✅ Time entries list
- ✅ Projects/clients view
- ✅ Offline sync
- ✅ Push notifications
- ✅ Apple Watch basic app
- ✅ Health data read

### Phase 6.1+ Future Enhancements (Post-Launch)
- ⏳ Invoices view/management
- ⏳ Project details/editing
- ⏳ Financial dashboard
- ⏳ Advanced watch app (complications, WatchKit)
- ⏳ Siri shortcuts library
- ⏳ Share sheet integration
- ⏳ App groups (share data between apps)
- ⏳ iCloud sync (CloudKit)

---

## TEAM REQUIREMENTS

### iOS Development Team
```
1x iOS Lead Engineer (Swift/SwiftUI)
  - Capacitor integration
  - WatchKit development
  - App Store submission
  - Performance optimization

1x Backend/Sync Engineer
  - Offline-first architecture
  - Conflict resolution
  - Sync algorithm
  - Testing

1x QA Engineer
  - Device testing (iPhone, iPad, Apple Watch)
  - Network condition testing (throttle, offline)
  - Beta management
  - Regression testing
```

---

**Timeline: 8 weeks to launch**  
**Target: 5,000+ downloads by end of month 1**  
**Success Metric: 4.5+ rating, 30%+ D30 retention**

Ready to build! 🚀
