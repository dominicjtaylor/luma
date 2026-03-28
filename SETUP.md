# Luma — Setup & Build Guide

This guide takes you from a fresh clone to a running app on a physical iPhone with Dynamic Island.

---

## Prerequisites

| Tool | Version |
|------|---------|
| Node.js | 18 or later |
| Xcode | 15 or later |
| CocoaPods | 1.13 or later |
| Physical iPhone | iPhone 14 Pro / 15 / 16 series (Dynamic Island required) |
| iOS on device | 16.1 or later |
| Apple Developer account | Required for physical device builds |

---

## 1. Install JavaScript dependencies

```bash
cd luma
npm install
```

---

## 2. Generate the native iOS project

Expo bare workflow generates the `ios/` Xcode project from `app.json`:

```bash
npx expo prebuild --platform ios --clean
```

This creates `ios/luma.xcworkspace` and the default Xcode project structure. **Do not run `expo prebuild` again** after you have made manual Xcode changes — it will overwrite them.

---

## 3. Install CocoaPods

```bash
cd ios
pod install
cd ..
```

---

## 4. Configure Xcode — main app target

Open the workspace (not `.xcodeproj`):

```bash
open ios/luma.xcworkspace
```

### 4a. Add the bridging header

1. In the Project Navigator, select the **luma** project → **luma** target → **Build Settings**
2. Search for `Swift Compiler - General`
3. Set **Objective-C Bridging Header** to:
   ```
   luma/luma-Bridging-Header.h
   ```
   (This file exists at `ios/luma/luma-Bridging-Header.h`)

### 4b. Add native module source files to the main target

In the Project Navigator, right-click the `luma` group → **Add Files to "luma"**. Add:

- `ios/LiveActivityModule/LiveActivityModule.swift`
- `ios/LiveActivityModule/LiveActivityModule.m`
- `ios/Shared/DoomscrollAttributes.swift`

When prompted, select **"Add to target: luma"** and uncheck the widget target for these files.

### 4c. Add NSSupportsLiveActivities to the main app Info.plist

Open `ios/luma/Info.plist` and add:

```xml
<key>NSSupportsLiveActivities</key>
<true/>
```

If you want to suppress the system's automatic update-frequency warning, also add:

```xml
<key>NSSupportsLiveActivitiesFrequentUpdates</key>
<false/>
```

### 4d. Set deployment target

**luma** target → **General** → **Minimum Deployments** → set to **iOS 16.1**

---

## 5. Create the Widget Extension target

Live Activities are rendered by a WidgetKit extension. You must add a new target.

1. **File → New → Target**
2. Choose **Widget Extension** → Next
3. Set:
   - Product Name: `DoomscrollWidget`
   - Bundle Identifier: `com.luma.doomscroll.widget`
   - Ensure **"Include Live Activity"** is checked (Xcode 14.1+)
   - Uncheck "Include Configuration App Intent" (not needed)
4. Click Finish. When asked to activate the scheme, click **Activate**.

### 5a. Delete Xcode's generated widget boilerplate

Xcode generates placeholder files. Remove them:

- In the `DoomscrollWidget` group, delete any auto-generated `.swift` files **except** keeping the folder structure.

### 5b. Add your widget source files

Right-click the `DoomscrollWidget` group → **Add Files to "luma"**. Add:

- `ios/DoomscrollWidget/DoomscrollWidgetBundle.swift` — target: **DoomscrollWidget only**
- `ios/DoomscrollWidget/DoomscrollLiveActivity.swift` — target: **DoomscrollWidget only**
- `ios/Shared/DoomscrollAttributes.swift` — target: **both luma AND DoomscrollWidget**

To add a file to multiple targets: select the file in the Project Navigator → in the File Inspector (right panel) → **Target Membership** → check both `luma` and `DoomscrollWidget`.

### 5c. Replace the widget extension's Info.plist

Delete the auto-generated `Info.plist` inside the `DoomscrollWidget` group and add:

- `ios/DoomscrollWidget/Info.plist` — target: **DoomscrollWidget only**

Alternatively, edit the existing generated plist and add:

```xml
<key>NSSupportsLiveActivities</key>
<true/>
```

### 5d. Set widget deployment target

**DoomscrollWidget** target → **General** → **Minimum Deployments** → **iOS 16.1**

---

## 6. Signing & Capabilities

### Main app target

1. **luma** target → **Signing & Capabilities**
2. Select your Team
3. Ensure **Automatically manage signing** is checked

No additional capability is needed for local Live Activity updates.

### Widget extension target

1. **DoomscrollWidget** target → **Signing & Capabilities**
2. Select the same Team
3. Bundle Identifier must be prefixed with the main app's: `com.luma.doomscroll.widget`

---

## 7. Verify file targets

Open each file and check **Target Membership** in the File Inspector:

| File | luma target | DoomscrollWidget target |
|------|-------------|------------------------|
| `LiveActivityModule.swift` | ✅ | ❌ |
| `LiveActivityModule.m` | ✅ | ❌ |
| `DoomscrollAttributes.swift` | ✅ | ✅ |
| `DoomscrollLiveActivity.swift` | ❌ | ✅ |
| `DoomscrollWidgetBundle.swift` | ❌ | ✅ |

Incorrect target membership is the most common build error.

---

## 8. Build and run on device

Connect your iPhone and select it as the run destination.

```bash
# From the project root — this also opens Xcode if not already open
npx expo run:ios --device
```

Or build directly from Xcode: select your device → **Product → Run** (⌘R).

The first build will take several minutes. Subsequent builds are incremental.

---

## 9. Test the Live Activity

1. Open the app on your iPhone
2. Tap **Start Social Mode**
3. Lock the screen or background the app — the Live Activity appears on the lock screen
4. Look at the Dynamic Island — the creature emoji and timer should appear
5. Wait 10 seconds — the time updates
6. Wait past 5 minutes — the emoji changes from 🐛 to 🦎 (restless)
7. Return to the app, tap **Stop** — the Live Activity disappears

---

## 10. Troubleshooting

### "No module named 'ActivityKit'"

The widget extension or main app target is missing the file or has wrong deployment target. Check it is set to iOS 16.1+.

### Build error: "Cannot find type 'DoomscrollAttributes'"

`DoomscrollAttributes.swift` is not added to the correct target(s). It must be in both `luma` and `DoomscrollWidget`.

### Build error: "RCTPromiseResolveBlock undeclared"

The bridging header path in Build Settings is wrong or the file is missing. Verify step 4a.

### Live Activity does not appear

- Check `NSSupportsLiveActivities` is `true` in the **main app** Info.plist
- Check `NSSupportsLiveActivities` is `true` in the **widget** Info.plist
- Ensure the device has Live Activities enabled: **Settings → Face ID & Passcode → Live Activities → ON**
- Ensure the device supports Dynamic Island (iPhone 14 Pro / 15 / 16 series)

### "areActivitiesEnabled" returns false

The user has disabled Live Activities for the app. Direct them to Settings.

### Live Activity appears but never updates

The throttle in `HomeScreen.tsx` sends updates every 10 seconds or on stage change. Check the device is not in Low Power Mode, which can suspend background updates.

### `pod install` fails

```bash
sudo gem install cocoapods
cd ios && pod install --repo-update
```

---

## Project structure

```
luma/
├── index.js                          # RN entry point
├── app.json                          # Expo config
├── package.json
├── babel.config.js
├── tsconfig.json
│
├── src/
│   ├── App.tsx                       # Root component
│   ├── store/
│   │   └── sessionStore.ts           # Zustand session state + timer logic
│   ├── screens/
│   │   └── HomeScreen.tsx            # Main UI + bridge calls
│   ├── native/
│   │   └── LiveActivityModule.ts     # JS wrapper around the native module
│   └── utils/
│       └── stageUtils.ts             # Stage thresholds, labels, emojis
│
└── ios/
    ├── Shared/
    │   └── DoomscrollAttributes.swift  # ActivityAttributes — added to both targets
    │
    ├── LiveActivityModule/             # Native module (main app target only)
    │   ├── LiveActivityModule.swift
    │   └── LiveActivityModule.m
    │
    ├── DoomscrollWidget/               # Widget extension target
    │   ├── DoomscrollWidgetBundle.swift
    │   ├── DoomscrollLiveActivity.swift
    │   └── Info.plist
    │
    └── luma/
        ├── luma-Bridging-Header.h
        └── luma.entitlements
```

---

## Stage reference

| Stage | Emoji | Time threshold |
|-------|-------|---------------|
| calm | 🐛 | 0 – 4:59 |
| restless | 🦎 | 5:00 – 9:59 |
| agitated | 🦂 | 10:00 – 14:59 |
| exhausted | 💀 | 15:00+ |

---

## Update cadence

- JavaScript timer ticks every **1 second** (updates UI only)
- Native Live Activity is updated every **10 seconds** or immediately on a stage change
- This keeps well within ActivityKit's system-imposed update budget
