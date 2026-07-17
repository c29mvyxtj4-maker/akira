# PHASE 6.2: ANDROID NATIVE APP DEVELOPMENT PLAN

**Target Launch:** October 2026 (8 weeks, parallel with iOS)  
**Primary Goal:** Feature-parity with web app on Android + Wear OS companion  
**Success Metric:** 5,000+ downloads, 4.5+ rating, 30%+ D30 retention  

---

## WEEK 1-2: FOUNDATION & SETUP

### Capacitor Project Configuration (Shared with iOS)

```bash
# Android platform already added with iOS setup
npx cap add android

# Install required plugins
npm install @capacitor/app @capacitor/device @capacitor/filesystem
npm install @capacitor/sqlite
npm install @capacitor/background-tasks
npm install @capacitor/push-notifications
npm install @capacitor-community/google-fit
npm install @capacitor-firebase/messaging  # FCM for push
```

### Android-Specific Configuration

**1. Firebase Cloud Messaging (FCM)**
```
Service: @capacitor-firebase/messaging
Purpose: Push notifications on Android
Setup:
  - Create Firebase project (console.firebase.google.com)
  - Download google-services.json
  - Place in android/App/
  - Configure API keys in Capacitor
```

**2. Google Fit Integration**
```
Dependency: @capacitor-community/google-fit
Purpose: Health data syncing
Permissions:
  - Read steps
  - Read heart rate
  - Read activity
Configuration: OAuth consent screen
```

**3. SQLite for Android**
```
Same as iOS: @capacitor/sqlite
Database: akira_local.db (SQLite)
Tables: Same schema as iOS
Sync: Unified sync algorithm
```

**4. WorkManager for Background Tasks**
```
Native Android library: androidx.work:work-runtime
Purpose: Periodic sync even when app closed
Schedule: 15-minute intervals (configurable)
Tasks:
  - Sync time entries
  - Fetch new invoices
  - Check notifications
  - Upload cached data
```

### Development Setup

**Android Studio Configuration:**
```
- SDK Level 26+ (API 26 = Android 8.0)
- Target SDK 34+ (Android 14+)
- Gradle: 8.0+
- Build Tools: 34.0.0+

Emulator Devices:
- Pixel 4 (1080x2300, API 34)
- Pixel 6 (1440x3120, API 34)
- Samsung Galaxy S21 (1440x3200, API 34)
- Tablet: Pixel Tablet (2560x1600, API 34)
```

**Signing Configuration:**
```
File: android/app/build.gradle.kts

android {
    signingConfigs {
        create("release") {
            storeFile = file("keystore.jks")
            storePassword = "..."
            keyAlias = "akira"
            keyPassword = "..."
        }
    }
    
    buildTypes {
        release {
            signingConfig = signingConfigs.getByName("release")
        }
    }
}
```

**Google Play Console Setup:**
```
- Create app in Play Console
- Bundle ID: com.akira.app
- App name: AKIRA
- Category: Business
- Content rating questionnaire
- Privacy policy URL
- Create release track (internal → closed → open)
```

---

## WEEK 3-4: CORE FEATURES

### Feature 1: Timer (Quick-Start UX)

**Android-Specific Implementation:**
```kotlin
// MainActivity.kt - Native Android integration
class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // Start React Native code
        setContentView(createReactRootView())
    }
    
    // Handle incoming intents (deep links, shortcuts)
    override fun onNewIntent(intent: Intent?) {
        super.onNewIntent(intent)
        intent?.let { handleDeepLink(it) }
    }
}
```

**React Native Component (Shared with Web):**
```javascript
// src/components/time/Timer.jsx (same code)
export function Timer() {
  const [isRunning, setIsRunning] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  
  // Platform-specific: Haptic feedback
  const vibrate = async () => {
    if (Platform.OS === 'android') {
      await Vibration.vibrate(100)
    }
  }
  
  return (
    <SafeAreaView>
      <PressableAnimated onPress={() => { setIsRunning(!isRunning); vibrate() }}>
        {/* Timer UI */}
      </PressableAnimated>
    </SafeAreaView>
  )
}
```

**Material Design 3 Styling:**
```javascript
// Use native Material Design tokens
const colors = {
  primary: '#6750A4',        // Purple
  secondary: '#625B71',      // Gray
  tertiary: '#7D5260',       // Pink
  surface: '#FFFBFE',        // White
  error: '#B3261E',          // Red
}

const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
}
```

**Testing Matrix:**
```
✓ Emulator: Pixel 4 (1080p)
✓ Emulator: Pixel 6 (1440p)
✓ Real device: Samsung Galaxy S21
✓ Real device: Google Pixel 6 Pro
✓ Tablet: Pixel Tablet (landscape mode)
```

---

### Feature 2: Time Entries List

**Android-Specific Optimizations:**
```kotlin
// RecyclerView for efficient list rendering
class TimeEntryAdapter : RecyclerView.Adapter<TimeEntryViewHolder>() {
    // Efficient list updates
    // Item swipe actions (delete, edit)
    // Context menu (copy, duplicate)
}
```

**React Native Implementation:**
```javascript
// Use FlatList with optimizations
<FlatList
  data={entries}
  renderItem={({ item }) => <TimeEntryCard entry={item} />}
  keyExtractor={(item) => item.id}
  removeClippedSubviews={true}
  maxToRenderPerBatch={10}
  updateCellsBatchingPeriod={50}
  onEndReachedThreshold={0.5}
  onEndReached={() => loadMoreEntries()}
/>
```

**Swipe Actions:**
```javascript
// Swipe right: Edit
// Swipe left: Delete
// Long press: Duplicate entry

<Swipeable
  renderLeftActions={() => <EditAction />}
  renderRightActions={() => <DeleteAction />}
>
  <TimeEntryRow entry={entry} />
</Swipeable>
```

---

### Feature 3: Projects & Clients Quick View

**Android Grid Layout:**
```javascript
// Use FlatList with numColumns
<FlatList
  data={projects}
  numColumns={2}  // 2 columns on phone, 3 on tablet
  renderItem={({ item }) => <ProjectCard project={item} />}
  columnWrapperStyle={{ justifyContent: 'space-between' }}
/>
```

**Responsive Design:**
```javascript
const { width } = useWindowDimensions()
const numColumns = width > 600 ? 3 : 2  // Tablet vs phone

const cardWidth = (width - 32) / numColumns  // Padding: 16 each side
```

---

### Feature 4: Offline Database (SQLite)

**Android SQLite Setup:**
```javascript
import { CapacitorSQLite } from '@capacitor-community/sqlite'

export async function initializeAndroidDb() {
  const db = await CapacitorSQLite.createConnection('akira_local')
  
  // Same schema as iOS
  await db.execute(`
    CREATE TABLE IF NOT EXISTS time_entries (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      project_id TEXT,
      duration_seconds INTEGER,
      billable BOOLEAN,
      date_started DATETIME,
      is_synced BOOLEAN DEFAULT false,
      created_at DATETIME,
      updated_at DATETIME
    );
    
    CREATE INDEX idx_user_id ON time_entries(user_id);
    CREATE INDEX idx_date_started ON time_entries(date_started);
    CREATE INDEX idx_is_synced ON time_entries(is_synced);
  `)
  
  return db
}
```

**Performance Optimization:**
```javascript
// Use prepared statements
const stmt = await db.prepare(
  'SELECT * FROM time_entries WHERE user_id = ? AND date = ?'
)
const results = await stmt.all([userId, today])
```

---

### Feature 5: Firebase Cloud Messaging (FCM)

**Setup Push Notifications:**
```javascript
import { Messaging } from '@capacitor-firebase/messaging'

export async function initializeFCM() {
  // Request permission
  const permStatus = await Messaging.requestPermissions()
  
  if (permStatus.receive === 'granted') {
    // Get FCM token
    const { token } = await Messaging.getToken()
    
    // Send to backend
    const user = await supabase.auth.getUser()
    await supabase
      .from('device_tokens')
      .upsert({
        user_id: user.id,
        device_token: token,
        platform: 'android',
        device_name: await Device.getInfo().model
      })
  }
  
  // Listen for messages
  Messaging.addListener('notificationReceived', (notification) => {
    handleNotification(notification)
  })
}

function handleNotification(notification) {
  // Show local notification
  // Navigate to relevant screen
  LocalNotifications.show({
    id: Date.now(),
    title: notification.title,
    body: notification.body,
    actionTypeId: 'tap'
  })
}
```

---

## WEEK 5-6: INTEGRATION & POLISH

### Feature 1: Wear OS Companion App

**WearOS Project Structure:**
```
android/App/wear/
├── src/
│   ├── main/
│   │   ├── AndroidManifest.xml
│   │   ├── res/
│   │   │   ├── layout/
│   │   │   ├── values/
│   │   │   └── drawable/
│   │   └── java/com/akira/wear/
│   │       ├── MainActivity.kt
│   │       ├── TimerActivity.kt
│   │       ├── ProjectsActivity.kt
│   │       └── DashboardActivity.kt
├── build.gradle.kts
└── proguard-rules.pro
```

**Wear OS Features:**

**1. Timer Tile (Main Screen)**
```kotlin
class TimerTile : ProviderViewFactory {
    override fun onCreateViewHolder(context: Context): ViewHolder {
        // Large timer display
        // Play/pause button
        // Current project name
        // Minutes/seconds prominent
    }
}
```

**2. Projects Tile (Quick Access)**
```kotlin
class ProjectsTile : ProviderViewFactory {
    override fun onCreateViewHolder(context: Context): ViewHolder {
        // List of 5 active projects
        // Swipe navigation
        // Tap to start timer
        // Project color indicators
    }
}
```

**3. Dashboard Complication**
```kotlin
// Watch face complication
// Shows:
  - Hours logged today
  - Active projects count
  - Revenue today
  - Billing percentage
```

**4. Voice Commands**
```kotlin
// Trigger timer actions via OK Google
// "Start my timer"
// "Stop tracking"
// "Log time entry"

// Use Google Assistant integration
// Voice input handler
class VoiceCommandActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        handleVoiceInput()
    }
}
```

**Wear OS Data Sync:**
```kotlin
// DataLayerListenerService for phone ↔ watch sync
class DataLayerListenerService : WearableListenerService() {
    override fun onDataChanged(dataEvents: DataEventBuffer) {
        dataEvents.forEach { dataEvent ->
            if (dataEvent.type == DataEvent.TYPE_CHANGED) {
                val dataItem = dataEvent.dataItem
                updateLocalData(dataItem)
            }
        }
    }
}
```

---

### Feature 2: Google Fit Integration

**Setup Health Data Access:**
```javascript
import { GoogleFit } from '@capacitor-community/google-fit'

export async function syncGoogleFitData() {
  // Request permissions
  const permStatus = await GoogleFit.checkAndRequestPermission()
  
  if (permStatus.permission) {
    // Get step count
    const steps = await GoogleFit.getSteps({
      startTime: todayStart,
      endTime: now
    })
    
    // Get heart rate samples
    const heartRate = await GoogleFit.getHeartRateSamples({
      startTime: todayStart,
      endTime: now
    })
    
    // Get activity segments
    const activity = await GoogleFit.getActivitySegments({
      startTime: todayStart,
      endTime: now
    })
    
    // Store locally
    await storeHealthMetrics({
      date: today,
      steps: steps.value,
      heart_rate: heartRate.average,
      activity: activity.segments
    })
  }
}
```

**Productivity Correlation:**
```javascript
export async function correlateHealthAndProductivity() {
  const health = await getHealthMetrics(today)
  const productivity = await getProductivityMetrics(today)
  
  return {
    steps_today: health.steps,
    hours_worked: productivity.hours,
    correlation: calculateCorrelation(health, productivity),
    insights: [
      `${health.steps} steps walked today`,
      `${productivity.hours}h worked (${productivity.billable_rate}% billable)`,
      `Heart rate average: ${health.heart_rate} bpm`,
      ...(health.steps > 8000 ? ['✓ Exercise goal met'] : ['△ More movement needed'])
    ]
  }
}
```

---

### Feature 3: Cross-Device Sync

**Implement from mobileSync.service.js:**
```javascript
// Use same sync engine as iOS
// Platform-agnostic implementation
// Android-specific: Use WorkManager for background sync

export async function setupAndroidSync() {
  // Register this device
  const deviceId = await Device.getId()
  await registerDevice(deviceId, 'android', await Device.getInfo().osVersion)
  
  // Subscribe to state changes
  subscribeToStateChanges((payload) => {
    updateLocalDb(payload)
    if (payload.type === 'notification') {
      showLocalNotification(payload)
    }
  })
  
  // Schedule background sync
  await schedulePeriodicSync()
}

async function schedulePeriodicSync() {
  // Use WorkManager for periodic sync
  // 15-minute interval
  // Sync even if app is closed
  // Respect battery optimization settings
}
```

---

### Feature 4: Offline Capability

**Offline Pattern (Same as iOS):**
```
Offline Features:
✓ Start/stop timers (save to SQLite)
✓ Create time entries (queue for sync)
✓ View cached projects/clients
✓ Browse time entry history
✓ Search local data

When Back Online:
✓ Auto-sync all queued changes
✓ Download latest data
✓ Resolve conflicts
✓ Show sync status badge
```

---

## WEEK 7-8: TESTING & DEPLOYMENT

### Quality Assurance

**Device Testing Matrix:**
```
Phones (Portrait):
✓ Pixel 4 (1080x2300)
✓ Pixel 6 (1440x3120)
✓ Samsung Galaxy S21 (1440x3200)
✓ OnePlus 9 (1440x3216)

Tablets (Landscape):
✓ Pixel Tablet (2560x1600)
✓ Samsung Tab S8 (2560x1600)

Wear OS:
✓ Mobvoi TicWatch Pro 3
✓ Fossil Gen 6

Emulators:
✓ Pixel 4 emulator
✓ Pixel 6 emulator
✓ Tablet emulator
```

**Automated Testing:**
```javascript
// Jest + React Testing Library
test('Timer starts and increments', async () => {
  const { getByRole } = render(<Timer />)
  const playButton = getByRole('button', { name: /play/i })
  
  fireEvent.press(playButton)
  await waitFor(() => {
    expect(screen.getByText(/00:01/)).toBeInTheDocument()
  })
})

// Detox for E2E testing
describe('Time Entry Flow', () => {
  beforeAll(async () => {
    await device.launchApp()
  })
  
  it('should create time entry', async () => {
    // Tap timer
    // Wait for modal
    // Enter description
    // Select project
    // Save
  })
})
```

**Manual Testing Checklist:**
```
Core Features:
✓ Timer start/pause/resume
✓ Timer background mode
✓ Time entry creation
✓ Time entry editing
✓ Project selection
✓ Client view
✓ Pull-to-refresh

Offline:
✓ Create entry offline
✓ Timer runs offline
✓ Sync when online
✓ Conflict resolution

Wear OS:
✓ Timer tile works
✓ Projects tile displays
✓ Voice commands work
✓ Notifications appear

Performance:
✓ App launch < 2 seconds
✓ List scroll 60 FPS
✓ Memory < 200MB
✓ Battery drain < 5% (1h timer)

Android 13+ Features:
✓ Per-app language
✓ Themed icons
✓ Notification runtime permissions
✓ Clipboard access notification
```

---

### Google Play Store Submission

**Step 1: Prepare Assets**
```
App Icon:
  - 512x512 (launcher icon)
  - 192x192, 144x144, 96x96, 72x72 (various sizes)
  - Rounded corners (Android 13+)

Screenshots:
  - 6 screenshots minimum
  - Include timer, entries, projects, offline
  - Portrait + landscape variants
  - Captions with value props

Video Preview:
  - 15-30 seconds
  - Show timer starting, entry created, sync working
  - Silent or with voiceover
  - Captions recommended
```

**Step 2: Store Listing**
```
App Name: AKIRA
Short description (80 chars): 
  "Time tracking & business management OS"

Full description (4,000 chars):
  - Key features
  - Use cases
  - Offline capability
  - Wearable support
  - Team collaboration
  - Links to website/support

Category: Business
Content Rating: Everyone
```

**Step 3: Release Process**
```
Track: Internal Testing (Week 1)
  - QA testing on 5+ devices
  - Fix critical bugs
  - Performance optimization

Track: Closed Testing (Week 2-3)
  - Beta testers (100-500)
  - Feedback collection
  - Last-minute fixes

Track: Production (Week 4)
  - Gradual rollout: 10% → 25% → 50% → 100%
  - Monitor crash reports
  - Rollback if necessary
```

**Step 4: Review Guidelines**
```
Google Play review focuses on:
✓ App stability and functionality
✓ Content appropriateness
✓ Intellectual property
✓ Deceptive behavior prevention
✓ Spam/spam-like content prevention
✓ Targeted advertising compliance

Note: Google Play review is generally faster than App Store (1-2 hours)
```

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
Disk usage:                < 100MB
```

### Optimization Techniques

**Code Splitting:**
```javascript
// Lazy load screens
const ProjectsScreen = lazy(() => import('./screens/ProjectsScreen'))
const AnalyticsScreen = lazy(() => import('./screens/AnalyticsScreen'))
```

**Image Optimization:**
```
- WebP format for all images
- Compressed SVG for icons
- Placeholder images while loading
- Cache strategy (1 week for icons, 1 day for dynamic)
```

**Database Optimization:**
```sql
-- Indexes for frequent queries
CREATE INDEX idx_user_id ON time_entries(user_id);
CREATE INDEX idx_date ON time_entries(date);
CREATE INDEX idx_synced ON time_entries(is_synced);

-- Archive old records (> 1 year)
DELETE FROM time_entries WHERE date < DATE_SUB(NOW(), INTERVAL 1 YEAR);
```

**Memory Optimization:**
```kotlin
// Use ViewModel for lifecycle management
class TimeEntryViewModel : ViewModel() {
    private val _entries = MutableLiveData<List<TimeEntry>>()
    
    // Data survives configuration changes
    // Automatically cleared when ViewModel destroyed
}

// Avoid memory leaks
override fun onDestroy() {
    unsubscribeFromLiveData()
    cancelPendingRequests()
    super.onDestroy()
}
```

---

## ROLLOUT STRATEGY

### Phase 1: Internal Testing (Week 7)
```
- QA team on 5+ devices
- Daily crash reporting
- Performance metrics collection
- Emergency bug fixes
- Target: < 1% crash rate
```

### Phase 2: Closed Beta (Week 7-8)
```
- 500 beta testers
- Feedback collection
- App store screenshots/reviews validation
- Last-minute UX adjustments
- Monitor D1/D7/D30 retention
- Target: D30 retention > 25%
```

### Phase 3: Gradual Rollout (Week 8+)
```
Timeline:
- Day 1-2: 10% of users (10,000 if 100k+ installs possible)
- Day 3-4: 25% rollout (if no critical issues)
- Day 5-6: 50% rollout (monitor feedback)
- Day 7+: 100% rollout (full release)

Metrics to monitor:
- Crash rate
- ANR (Application Not Responding) rate
- User ratings
- Uninstall rate
- Support ticket volume
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
- Wear OS working reliably
- ⚠️ If < 3,000 downloads: reassess UX
```

### Retention Metrics
```
Good:
- D1 retention > 40%
- D7 retention > 25%
- D30 retention > 15%

Fair:
- D1 retention 25-40%
- D7 retention 15-25%
- D30 retention 10-15%

At Risk (requires UX overhaul):
- D1 retention < 25%
- D7 retention < 15%
- D30 retention < 10%
```

---

## ANDROID-SPECIFIC CONSIDERATIONS

### Device Fragmentation
```
Screen Sizes:
- Phone: 4.5" - 6.7"
- Tablet: 7" - 13"
- Wear: 1.2" - 1.5" (watch)

OS Versions:
- Target: Android 8.0+ (API 26)
- Minimum: Android 7.0 (API 24)
- Recommended: Android 12+ (90%+ market share)

Manufacturers:
- Samsung (One UI)
- Google (Stock Android)
- OnePlus (OxygenOS)
- Xiaomi (MIUI)
- Oppo (ColorOS)
```

### Tablet Optimization
```
Layout:
- Multi-pane UI for wider screens
- Master-detail pattern
- Side navigation drawer
- Adaptive columns (1-3 columns depending on width)

Examples:
- Projects + details side-by-side
- Entries list + entry editor side-by-side
- Statistics dashboard with multiple widgets

Test on:
- Pixel Tablet (2560x1600)
- Samsung Tab S8 (2560x1600)
- Foldable devices (Samsung Galaxy Z Fold)
```

### Notification Channels (Android 8+)
```kotlin
// Create notification channels
val channel = NotificationChannel(
    CHANNEL_ID,
    "AKIRA Updates",
    NotificationManager.IMPORTANCE_HIGH
).apply {
    description = "Notifications about your time tracking and invoices"
    enableVibration(true)
    setSound(soundUri, audioAttributes)
}

notificationManager.createNotificationChannel(channel)
```

---

## TEAM REQUIREMENTS

### Android Development Team
```
1x Android Lead Engineer (Kotlin/Jetpack Compose)
  - Capacitor integration
  - Wear OS development
  - Play Store submission
  - Performance optimization
  - Estimated: 250h (8 weeks × 1 person = available)

1x Android Engineer (ReactNative/Kotlin)
  - Shared React code adaptation
  - Android-specific UI components
  - Database/sync implementation
  - Estimated: 250h

1x Backend/Sync Engineer (Shared with iOS)
  - Offline-first architecture
  - Sync algorithm
  - Conflict resolution
  - Estimated: 200h shared between iOS/Android

1x QA Engineer (Android specialist)
  - Device testing (phones, tablets, watches)
  - Performance testing
  - Regression testing
  - Estimated: 150h
```

**Total: 3-4 engineers (with potential to share backend engineer with iOS team)**

---

## CRITICAL SUCCESS FACTORS

1. **Feature Parity with iOS:** Match iOS launch quality (not rushed)
2. **Performance:** < 2s launch, 60 FPS scrolling (crucial for Android)
3. **Offline Reliability:** Sync algorithm must be bulletproof
4. **Wear OS UX:** Smartwatch experience must be effortless
5. **Battery Efficiency:** Background sync must not drain battery

---

**Timeline: 8 weeks to launch (parallel with iOS)**  
**Target: 5,000+ downloads by end of month 1**  
**Success Metric: 4.5+ rating, 30%+ D30 retention**  
**Platform Distribution:** Target 60% iOS, 40% Android (by market demand)

Ready to build! 🚀
