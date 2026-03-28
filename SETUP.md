# Luma — Setup & Build Guide

---

## Prerequisites

| Requirement | Detail |
|-------------|--------|
| Node.js | 18 or later |
| Xcode | 15 or later |
| CocoaPods | 1.13 or later — install with `sudo gem install cocoapods` |
| iPhone model | iPhone 14 Pro, 14 Pro Max, 15, 15 Plus, 15 Pro, 15 Pro Max, 16 (any) — must have Dynamic Island |
| iPhone iOS version | 16.1 or later |
| Apple Developer account | A free account is sufficient for device builds |

Simulators do not support Live Activities. A physical iPhone is required.

---

## Terminal commands

Run all of these from the project root directory (`luma/`).

### Step 1 — Install JavaScript dependencies

```bash
npm install
```

### Step 2 — Generate the iOS Xcode project

```bash
npx expo prebuild --platform ios --clean
```

`--clean` wipes the `ios/` directory before regenerating it. This also deletes the
custom Swift files that are tracked in git. Restore them immediately after:

```bash
git checkout -- ios/LiveActivityModule ios/DoomscrollWidget ios/Shared ios/luma/luma-Bridging-Header.h ios/luma/luma.entitlements
```

After this command, verify the following files exist on disk:

```
ios/LiveActivityModule/LiveActivityModule.swift
ios/LiveActivityModule/LiveActivityModule.m
ios/DoomscrollWidget/DoomscrollLiveActivity.swift
ios/DoomscrollWidget/DoomscrollWidgetBundle.swift
ios/DoomscrollWidget/Info.plist
ios/Shared/DoomscrollAttributes.swift
ios/luma/luma-Bridging-Header.h
ios/luma/luma.entitlements
```

### Step 3 — Install CocoaPods

```bash
cd ios && pod install && cd ..
```

### Step 4 — Open the workspace

```bash
open ios/luma.xcworkspace
```

Always open `luma.xcworkspace`, never `luma.xcodeproj`.

---

## Xcode configuration

Complete all steps below before attempting to build.

---

### Step 5 — Set the bridging header (main app target)

The Swift native module uses React Native Objective-C types. These are exposed
to Swift via a bridging header.

1. In the Project Navigator (left panel), click the **luma** project (the top-level
   blue icon with the project name)
2. In the main area, select the **luma** target (under TARGETS, not PROJECT)
3. Click the **Build Settings** tab
4. In the search field, type: `Objective-C Bridging Header`
   One result appears: **Swift Compiler - General → Objective-C Bridging Header**
5. Double-click the value column on the right of that row
6. Enter exactly:
   ```
   $(SRCROOT)/luma/luma-Bridging-Header.h
   ```
7. Press Enter

`$(SRCROOT)` resolves to the `ios/` directory. The full path this points to is
`ios/luma/luma-Bridging-Header.h`, which exists after the `git checkout` above.

---

### Step 6 — Add native module files to the main app target

The files on disk must be referenced by the Xcode project before they can compile.

1. In the Project Navigator, right-click the **luma** folder (not the top-level project)
2. Select **Add Files to "luma"...**
3. In the file picker, navigate to `ios/LiveActivityModule/`
4. Select `LiveActivityModule.swift` — hold **⌘** and also select `LiveActivityModule.m`
   (select both files at once)
5. At the bottom of the dialog:
   - **Destination:** leave "Copy items if needed" **unchecked** — the files are already
     inside the project directory
   - **Added to targets:** check **luma** only — uncheck DoomscrollWidget if it appears
6. Click **Add**

When Xcode asks "Would you like to configure an Objective-C bridging header?",
click **Cancel**. The bridging header already exists.

Repeat for the shared attributes file:

1. Right-click the **luma** folder → **Add Files to "luma"...**
2. Navigate to `ios/Shared/`
3. Select `DoomscrollAttributes.swift`
4. At the bottom:
   - "Copy items if needed": **unchecked**
   - **Added to targets:** check **luma** only (the widget target does not exist yet)
5. Click **Add**

---

### Step 7 — Verify the main app Info.plist

The `app.json` file contains Live Activities plist keys that Expo prebuild injects
automatically. Verify they made it in.

1. In the Project Navigator, expand the **luma** folder
2. Open `Info.plist`
3. Confirm these two keys exist:

| Key | Value |
|-----|-------|
| `NSSupportsLiveActivities` | `Boolean — YES` |
| `NSSupportsLiveActivitiesFrequentUpdates` | `Boolean — NO` |

If either key is missing:
- Switch to the raw XML view: right-click `Info.plist` → Open As → Source Code
- Add the missing lines inside the root `<dict>`:
  ```xml
  <key>NSSupportsLiveActivities</key>
  <true/>
  <key>NSSupportsLiveActivitiesFrequentUpdates</key>
  <false/>
  ```

---

### Step 8 — Set the main app deployment target

1. Select the **luma** project in the Navigator
2. Select the **luma** target
3. Click the **General** tab
4. Under **Minimum Deployments**, set **iOS** to **16.1**

---

### Step 9 — Sign the main app

1. **luma** target → **Signing & Capabilities** tab
2. Set **Team** to your Apple Developer account
3. Ensure **Automatically manage signing** is checked
4. Bundle Identifier: `com.luma.doomscroll` (already set by Expo prebuild)

If Xcode shows a signing error at this point, it will be one of:
- "No account found" — sign into your Apple account: Xcode menu → Settings → Accounts
- "Failed to create provisioning profile" — your bundle ID may already be registered
  to a different account; change the bundle ID to something unique, e.g.
  `com.yourname.luma.doomscroll`

---

### Step 10 — Create the Widget Extension target

Live Activities are rendered by a WidgetKit extension that runs in a separate process.
This target must be created manually — Expo cannot generate it.

1. In the Xcode menu: **File → New → Target...**
2. In the template chooser, select the **iOS** tab at the top
3. Scroll to or search for **Widget Extension**
4. Select **Widget Extension** → click **Next**
5. Fill in the fields:
   - **Product Name:** `DoomscrollWidget`
   - **Team:** same team you selected in Step 9
   - **Organization Identifier:** `com.luma` (this auto-fills the bundle ID below)
   - **Bundle Identifier:** confirm it reads `com.luma.doomscroll.widget`
   - **Language:** Swift
   - **Include Live Activity:** check this box if it appears
   - **Include Configuration App Intent:** leave this unchecked
6. Click **Finish**
7. A dialog asks: "Activate 'DoomscrollWidget' scheme?" → click **Activate**

---

### Step 11 — Delete Xcode's auto-generated widget files

Xcode generates placeholder Swift files inside the new target. These conflict with
the files from this project. They must be deleted before adding ours.

In the Project Navigator, expand the **DoomscrollWidget** folder. You will see files
similar to these (exact names depend on Xcode version):

- `DoomscrollWidget.swift`
- `DoomscrollWidgetBundle.swift`
- `DoomscrollWidgetLiveActivity.swift`
- `Assets.xcassets` (inside the widget group — keep this if it appears)
- `DoomscrollWidget.intentdefinition` (if present — delete this too)

Select all `.swift` files in the DoomscrollWidget group. Right-click →
**Delete** → in the confirmation dialog, click **Move to Trash**.

Do not delete `Info.plist` from the DoomscrollWidget group — leave that file in place
for now (you will replace its contents in Step 13).

---

### Step 12 — Add widget source files

1. Right-click the **DoomscrollWidget** folder in the Navigator
2. Select **Add Files to "luma"...**
3. Navigate to `ios/DoomscrollWidget/`
4. Select `DoomscrollWidgetBundle.swift` — hold **⌘** and also select
   `DoomscrollLiveActivity.swift`
5. At the bottom:
   - "Copy items if needed": **unchecked**
   - **Added to targets:** check **DoomscrollWidget** only — uncheck **luma**
6. Click **Add**

Now add the shared attributes file to the widget target:

1. In the Project Navigator, single-click `DoomscrollAttributes.swift`
   (which you added to **luma** in Step 6 — it should be visible in the luma group)
2. Open the **File Inspector** (right panel → first tab, the document icon)
3. Under **Target Membership**, you will see a list of targets with checkboxes
4. Check **DoomscrollWidget** — it should now show both `luma` and `DoomscrollWidget`
   checked

This is the only file in the project that belongs to both targets.

---

### Step 13 — Configure the widget Info.plist

The widget extension needs `NSSupportsLiveActivities` in its own `Info.plist`.

1. In the Project Navigator, expand the **DoomscrollWidget** folder
2. Click `Info.plist`
3. Right-click anywhere in the editor → **Open As → Source Code**
4. Add the following key inside the root `<dict>` (before the closing `</dict>`):
   ```xml
   <key>NSSupportsLiveActivities</key>
   <true/>
   ```
5. Save the file (⌘S)

---

### Step 14 — Set the widget deployment target

1. Select the **luma** project in the Navigator
2. Select the **DoomscrollWidget** target (separate from the luma target)
3. Click the **General** tab
4. Under **Minimum Deployments**, set **iOS** to **16.1**

---

### Step 15 — Sign the widget extension

1. **DoomscrollWidget** target → **Signing & Capabilities** tab
2. Set **Team** to the **same team** as the main app (Step 9)
3. Ensure **Automatically manage signing** is checked
4. Bundle Identifier: `com.luma.doomscroll.widget`

The widget bundle ID must begin with the main app bundle ID followed by a dot and
any suffix. `com.luma.doomscroll.widget` satisfies this. If you changed the main
app bundle ID in Step 9 (e.g. to `com.yourname.luma.doomscroll`), update the widget
bundle ID to match: `com.yourname.luma.doomscroll.widget`.

---

### Step 16 — Final target membership verification

Before building, verify every native file has the correct target membership.
Click each file in the Navigator and check the **File Inspector → Target Membership**.

| File | luma | DoomscrollWidget |
|------|:----:|:----------------:|
| `LiveActivityModule.swift` | ✅ | ❌ |
| `LiveActivityModule.m` | ✅ | ❌ |
| `DoomscrollAttributes.swift` | ✅ | ✅ |
| `DoomscrollWidgetBundle.swift` | ❌ | ✅ |
| `DoomscrollLiveActivity.swift` | ❌ | ✅ |
| `luma-Bridging-Header.h` | ✅ | ❌ |

**What breaks if this is wrong:**

- `LiveActivityModule.swift` in DoomscrollWidget → compile error:
  `"RCTPromiseResolveBlock" is not a function type`
- `DoomscrollAttributes.swift` missing from DoomscrollWidget → compile error:
  `cannot find type 'DoomscrollAttributes' in scope` (in the widget)
- `DoomscrollAttributes.swift` missing from luma → compile error:
  `cannot find type 'DoomscrollAttributes' in scope` (in LiveActivityModule.swift)
- `DoomscrollWidgetBundle.swift` in luma → linker error or `@main` conflict
- Any auto-generated Xcode widget file left in DoomscrollWidget AND our
  `DoomscrollWidgetBundle.swift` also present → compile error:
  `'main' attribute cannot be applied to a type that is already marked as '@main'`

---

## Build and run

### Step 17 — Connect the iPhone and select it as the run target

1. Connect your iPhone with a USB cable
2. Trust the computer on the iPhone if prompted
3. In Xcode, at the top centre, click the device selector (shows a simulator name
   by default, e.g. "iPhone 16 Pro")
4. A dropdown appears. Under **Device**, select your iPhone by name.
   If it shows "disconnected", unplug and replug the cable.

### Step 18 — Run the app

Press **⌘R** or click the **▶ Run** button in Xcode.

The build will take 3–8 minutes on first run. Subsequent builds are incremental.

When the build succeeds:
- The app installs on the iPhone automatically
- The app launches and shows the Luma screen

If the build fails, see the **Failure modes** section below.

---

## Confirming the system works

### What to expect when "Start Social Mode" is tapped

1. The app UI transitions — the creature emoji (🐛) appears, the timer starts
   counting up from `00:00`
2. Within one second, the Dynamic Island changes shape: instead of showing only
   the camera cutout, it expands into a pill shape
3. The left side of the pill shows: **🐛**
4. The right side of the pill shows: **00:00**

### What to expect while the session is running

- Every 10 seconds, the timer in the Dynamic Island updates
  (e.g. `00:10`, `00:20`, `00:30`)
- The timer in the app UI updates every second
- Background the app (swipe up from the bottom edge) — the Dynamic Island
  remains visible at the top of the screen
- Lock the screen — a larger Live Activity banner appears on the lock screen
  showing the emoji, stage name, and elapsed time
- Long-press the Dynamic Island — it expands to show emoji, timer, and the text
  "Doomscrolling · Calm"
- At 5 minutes elapsed, the emoji changes to **🦎** in both the app and Dynamic
  Island (stage change triggers an immediate native update, not waiting 10 seconds)
- At 10 minutes: **🦂**
- At 15 minutes: **💀**

### What to expect when "Stop" is tapped

- The Dynamic Island immediately shrinks back to the camera-only oval
- The Live Activity banner disappears from the lock screen
- The app UI resets — creature returns to 🐛, timer disappears

---

## Failure modes

### Build error: `cannot find type 'DoomscrollAttributes' in scope`

**Cause:** `DoomscrollAttributes.swift` is not assigned to the correct target.

**Fix:** Click `DoomscrollAttributes.swift` in the Navigator → File Inspector →
Target Membership → ensure both `luma` and `DoomscrollWidget` are checked.

---

### Build error: `'RCTPromiseResolveBlock' is not a function type` or `use of undeclared identifier 'RCTPromiseResolveBlock'`

**Cause:** The bridging header path in Build Settings is wrong or points to the
wrong file.

**Fix:** luma target → Build Settings → search "Objective-C Bridging Header" →
set value to exactly `$(SRCROOT)/luma/luma-Bridging-Header.h`

Also confirm the file exists on disk: `ios/luma/luma-Bridging-Header.h`

---

### Build error: `'main' attribute cannot be applied to a type that is already marked as '@main'`

**Cause:** An auto-generated Xcode widget file containing `@main` was not deleted in
Step 11. Two entry points exist in the DoomscrollWidget target.

**Fix:** In the Project Navigator, expand the DoomscrollWidget group. Look for any
`.swift` file that contains `@main` (you can click each one and check). Delete it:
right-click → Delete → Move to Trash.

---

### Build error: `No such module 'ActivityKit'`

**Cause:** The DoomscrollWidget deployment target is lower than 16.1. ActivityKit
requires iOS 16.1+.

**Fix:** DoomscrollWidget target → General → Minimum Deployments → iOS 16.1

---

### Signing error: `No profiles for 'com.luma.doomscroll' were found`

**Cause:** The bundle ID is already registered to a different Apple account.

**Fix:** Change the bundle ID in both targets to something unique:
- luma target: `com.yourname.luma.doomscroll`
- DoomscrollWidget target: `com.yourname.luma.doomscroll.widget`

Also update `app.json` → `ios.bundleIdentifier` to match. Do not re-run
`expo prebuild` (it will delete your Xcode changes) — update the bundle ID
only in Xcode.

---

### Live Activity does not appear after tapping Start

Check all three of these:

**1. Device settings:**
On the iPhone: Settings → Face ID & Passcode → scroll to the bottom →
Live Activities → toggle ON

**2. App-level Live Activities:**
Settings → scroll to the app list → find **Luma** → Live Activities → ON
(This entry only appears after you have launched the app at least once)

**3. Missing plist key:**
In Xcode: open the main app `Info.plist`. Confirm `NSSupportsLiveActivities` is
present and set to `YES`. Also open the DoomscrollWidget `Info.plist` and confirm
the same key is present.

**4. Check the Xcode console:**
With the device connected and Xcode open, run the app and tap Start. Watch the
debug output at the bottom of Xcode. If you see:
```
ACTIVITIES_DISABLED
```
the device or app has Live Activities turned off (see points 1 and 2 above).

If you see:
```
START_FAILED
```
followed by an error message, the `Activity.request` call threw. The message will
describe the reason (e.g. the system has reached the maximum number of activities).

---

### Dynamic Island updates but timer stops after a few minutes

**Cause:** Low Power Mode is active. ActivityKit rate-limits and eventually suspends
updates in Low Power Mode.

**Fix:** Settings → Battery → Low Power Mode → OFF

---

### App builds and runs but `NativeModules.LiveActivityModule` is undefined (JS error)

**Cause:** `LiveActivityModule.swift` and/or `LiveActivityModule.m` are not in the
Xcode project or are not assigned to the luma target.

**Fix:** Check both files appear in the Project Navigator under the luma group, then
check their Target Membership includes luma.

---

### `pod install` fails

```bash
sudo gem install cocoapods --pre
cd ios && pod install --repo-update
```

---

## File target membership reference

```
ios/
├── Shared/
│   └── DoomscrollAttributes.swift     ← luma + DoomscrollWidget
│
├── LiveActivityModule/
│   ├── LiveActivityModule.swift       ← luma only
│   └── LiveActivityModule.m           ← luma only
│
├── DoomscrollWidget/
│   ├── DoomscrollWidgetBundle.swift   ← DoomscrollWidget only
│   ├── DoomscrollLiveActivity.swift   ← DoomscrollWidget only
│   └── Info.plist                     ← DoomscrollWidget only
│
└── luma/
    ├── luma-Bridging-Header.h         ← luma only (referenced in Build Settings)
    └── luma.entitlements              ← luma only
```

---

## Stage reference

| Stage | Emoji | Elapsed time |
|-------|-------|-------------|
| calm | 🐛 | 0:00 – 4:59 |
| restless | 🦎 | 5:00 – 9:59 |
| agitated | 🦂 | 10:00 – 14:59 |
| exhausted | 💀 | 15:00 onwards |

JS timer ticks every **1 second** — updates the in-app UI only.
Native Live Activity update fires every **10 seconds** or immediately when the
stage changes — this is what the Dynamic Island reflects.
