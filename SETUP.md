# Luma — Definitive Setup Guide

---

## Requirements

| Item | Requirement |
|------|-------------|
| Node.js | 18 or later |
| Xcode | 15 or later |
| CocoaPods | 1.13 or later |
| iPhone model | iPhone 14 Pro, 14 Pro Max, 15, 15 Plus, 15 Pro, 15 Pro Max, or any iPhone 16 |
| iPhone OS | 16.1 or later |
| Apple Developer account | Free account is sufficient |

A physical iPhone is required. Dynamic Island does not exist on simulators or on any
iPhone 13 or earlier model.

---

## Part 1 — Terminal

### 1.1 Install dependencies

```bash
npm install
```

### 1.2 Generate the iOS project

```bash
npx expo prebuild --platform ios --clean
```

`--clean` deletes the entire `ios/` directory before regenerating it. This removes the
custom Swift files that are tracked in git. Run the following command immediately after
to restore them:

```bash
git checkout -- ios/LiveActivityModule ios/Shared ios/luma/luma-Bridging-Header.h
```

This restores exactly these files:

```
ios/LiveActivityModule/LiveActivityModule.swift
ios/LiveActivityModule/LiveActivityModule.m
ios/Shared/DoomscrollAttributes.swift
ios/luma/luma-Bridging-Header.h
```

Do not restore `ios/luma/luma.entitlements` — Expo generates a correct entitlements
file and restoring the git version would overwrite it.

Do not restore `ios/DoomscrollWidget/` yet — Xcode will create this directory when you
add the widget extension target in Part 2. You will restore the widget files after that.

### 1.3 Install CocoaPods

```bash
cd ios && pod install && cd ..
```

### 1.4 Open the Xcode workspace

```bash
open ios/luma.xcworkspace
```

Always open `luma.xcworkspace`. Never open `luma.xcodeproj` directly.

---

## Part 2 — Xcode

Complete every step in this exact order.

---

### Step 1 — Set the bridging header path

`LiveActivityModule.swift` uses `RCTPromiseResolveBlock` and `RCTPromiseRejectBlock`,
which are Objective-C types defined in React Native headers. A bridging header makes
these types visible to Swift. The file already exists at `ios/luma/luma-Bridging-Header.h`.
You need to tell Xcode where it is.

1. In the Project Navigator (left panel), click the **luma** project — the top-level
   item with a blue Xcode icon and the name "luma"
2. The centre panel now shows the project and targets. Under **TARGETS**, click **luma**
3. Click the **Build Settings** tab (the fourth tab along the top)
4. In the search field directly below the tabs, type:
   ```
   Objective-C Bridging Header
   ```
5. One row appears: **Swift Compiler - General → Objective-C Bridging Header**
6. Double-click the empty value field on the right side of that row
7. Type exactly:
   ```
   $(SRCROOT)/luma/luma-Bridging-Header.h
   ```
8. Press Enter

`$(SRCROOT)` is an Xcode build variable that resolves to the `ios/` directory (the
directory that contains the `.xcodeproj` file). The full path this value refers to is
`ios/luma/luma-Bridging-Header.h`.

---

### Step 2 — Add the native module files to the main app

1. In the Project Navigator, right-click the **luma** folder (the yellow folder icon,
   not the top-level blue project icon) → **Add Files to "luma"...**
2. In the file picker, navigate to `ios/LiveActivityModule/`
3. Click `LiveActivityModule.swift`. Hold **⌘** and also click `LiveActivityModule.m`.
   Both files should now be highlighted.
4. At the bottom of the dialog:
   - **"Copy items if needed"** checkbox → leave **unchecked**
   - **"Add to targets"** section → check **luma** → uncheck any other target listed
5. Click **Add**

If Xcode shows a dialog asking "Would you like to configure an Objective-C bridging
header?", click **Cancel**. The bridging header already exists.

---

### Step 3 — Add DoomscrollAttributes to the main app

1. Right-click the **luma** folder in the Navigator → **Add Files to "luma"...**
2. Navigate to `ios/Shared/`
3. Click `DoomscrollAttributes.swift`
4. At the bottom:
   - **"Copy items if needed"** → **unchecked**
   - **"Add to targets"** → check **luma** → uncheck any other target listed
5. Click **Add**

You will add this same file to the widget target in Step 9.

---

### Step 4 — Verify the main app Info.plist

1. In the Project Navigator, expand the **luma** folder
2. Click `Info.plist`
3. Confirm these two entries exist in the list:

| Key | Type | Value |
|-----|------|-------|
| `NSSupportsLiveActivities` | Boolean | YES |
| `NSSupportsLiveActivitiesFrequentUpdates` | Boolean | NO |

These are injected by Expo prebuild from `app.json`. If either entry is missing:
- Click the `+` button at the end of any existing row to add a new row
- Type the key name exactly as shown above
- Set the type to **Boolean**
- Set the value to **YES** or **NO** as shown

---

### Step 5 — Set the main app deployment target

1. Click the **luma** project in the Navigator
2. Under TARGETS, select **luma**
3. Click the **General** tab
4. Under **Minimum Deployments**, set the **iOS** dropdown to **16.1**

If 16.1 does not appear in the dropdown, type `16.1` directly into the field.

---

### Step 6 — Sign the main app

1. Under TARGETS, select **luma**
2. Click the **Signing & Capabilities** tab
3. Set **Team** to your Apple Developer account using the dropdown
   - If no account appears: Xcode menu → Settings → Accounts → add your Apple ID
4. Ensure **Automatically manage signing** is checked
5. **Bundle Identifier** should read `com.luma.doomscroll`

If Xcode shows a red error "Failed to create provisioning profile", the bundle ID is
already registered to a different account. Change the Bundle Identifier to something
unique, for example `com.yourname.luma`. If you change it here, also change the
widget bundle ID in Step 11 to use the same prefix.

---

### Step 7 — Create the widget extension target

1. In the menu bar: **File → New → Target...**
2. At the top of the template chooser, make sure **iOS** is selected (not macOS)
3. In the search field, type `Widget`
4. Select **Widget Extension** from the results
5. Click **Next**
6. Fill in the fields:
   - **Product Name:** `DoomscrollWidget`
   - **Team:** select the same team you chose in Step 6
   - **Bundle Identifier:** this will auto-fill — confirm it reads `com.luma.doomscroll.widget`
     (If you changed the bundle ID in Step 6, it will auto-fill with your prefix instead —
     that is correct, do not change it)
   - **Include Live Activity:** check this box if it is visible
   - **Include Configuration App Intent:** leave this unchecked
7. Click **Finish**
8. A dialog appears: "Activate 'DoomscrollWidget' scheme?" → click **Activate**

---

### Step 8 — Delete Xcode's generated widget files

Xcode places placeholder Swift files in the new target. These files contain an `@main`
entry point that will conflict with the project's own files. They must be deleted.

In the Project Navigator, expand the **DoomscrollWidget** folder. You will see a set of
auto-generated `.swift` files. The exact names depend on Xcode version, but they will
be some combination of:

- `DoomscrollWidget.swift`
- `DoomscrollWidgetBundle.swift`
- `DoomscrollWidgetLiveActivity.swift`
- `DoomscrollWidgetControl.swift`
- `AppIntent.swift`

Select all `.swift` files in this group (do not select `Info.plist` or `Assets.xcassets`).

Right-click the selection → **Delete**

In the confirmation dialog that appears, click **Move to Trash**.

The files must be deleted from disk, not just removed from the Xcode project. "Move to
Trash" confirms disk deletion. "Remove Reference" would only remove them from the
project while leaving them on disk — do not use "Remove Reference".

After this step, the DoomscrollWidget group in the Navigator should contain only
`Info.plist` (and optionally `Assets.xcassets`).

---

### Step 9 — Restore the widget Swift files

Switch to the Terminal window (do not close Xcode). Run:

```bash
git checkout -- ios/DoomscrollWidget/DoomscrollWidgetBundle.swift ios/DoomscrollWidget/DoomscrollLiveActivity.swift
```

This places the project's Swift files back on disk at:

```
ios/DoomscrollWidget/DoomscrollWidgetBundle.swift
ios/DoomscrollWidget/DoomscrollLiveActivity.swift
```

These files are now on disk but not yet part of the Xcode project. Add them in the next step.

---

### Step 10 — Add the widget Swift files to the DoomscrollWidget target

1. In Xcode, right-click the **DoomscrollWidget** folder in the Navigator →
   **Add Files to "luma"...**
2. Navigate to `ios/DoomscrollWidget/`
3. Click `DoomscrollWidgetBundle.swift`. Hold **⌘** and also click
   `DoomscrollLiveActivity.swift`. Both files should be highlighted.
4. At the bottom:
   - **"Copy items if needed"** → **unchecked**
   - **"Add to targets"** → check **DoomscrollWidget** → uncheck **luma**
5. Click **Add**

---

### Step 11 — Add DoomscrollAttributes to the widget target

`DoomscrollAttributes.swift` was already added to the **luma** target in Step 3.
It must also be added to the **DoomscrollWidget** target.

1. In the Project Navigator, click `DoomscrollAttributes.swift` once to select it
2. Open the **File Inspector** panel on the right side of Xcode
   - If the right panel is not visible: View menu → Inspectors → Show Inspector, or press
     **⌥⌘0** (Option + Command + 0)
   - The File Inspector is the first tab in the right panel (document icon)
3. Scroll to the **Target Membership** section
4. You will see a list of targets with checkboxes. Currently only **luma** is checked.
5. Check **DoomscrollWidget**

Both **luma** and **DoomscrollWidget** should now be checked for this file.

---

### Step 12 — Add NSSupportsLiveActivities to the widget Info.plist

1. In the Project Navigator, expand the **DoomscrollWidget** folder
2. Click `Info.plist`
3. In the Xcode plist editor, click the **+** button at the end of the last row in the list
   to add a new entry
4. Type the key name exactly:
   ```
   NSSupportsLiveActivities
   ```
5. The Type column will auto-set to **Boolean**
6. The Value column will show a toggle. Set it to **YES**.
7. Press **⌘S** to save

---

### Step 13 — Set the widget deployment target

1. Click the **luma** project in the Navigator
2. Under TARGETS, select **DoomscrollWidget** (not luma — a separate row)
3. Click the **General** tab
4. Under **Minimum Deployments**, set the **iOS** dropdown to **16.1**

---

### Step 14 — Sign the widget

1. Under TARGETS, select **DoomscrollWidget**
2. Click the **Signing & Capabilities** tab
3. Set **Team** to the same team as the main app (Step 6)
4. Ensure **Automatically manage signing** is checked
5. **Bundle Identifier** should read `com.luma.doomscroll.widget`
   (or `com.yourname.luma.widget` if you changed the prefix in Step 6)

---

### Step 15 — Verify target membership for all native files

Select each file below in the Navigator and check its Target Membership in the
File Inspector. This is the final verification before building.

**`ios/LiveActivityModule/LiveActivityModule.swift`**
- luma: **checked**
- DoomscrollWidget: **unchecked**
- If wrong: build error — `'RCTPromiseResolveBlock' is not a function type`

**`ios/LiveActivityModule/LiveActivityModule.m`**
- luma: **checked**
- DoomscrollWidget: **unchecked**
- If wrong: `LiveActivityModule` methods will not be registered with the bridge

**`ios/Shared/DoomscrollAttributes.swift`**
- luma: **checked**
- DoomscrollWidget: **checked**
- If unchecked in luma: build error — `cannot find type 'DoomscrollAttributes' in scope` (in LiveActivityModule.swift)
- If unchecked in DoomscrollWidget: build error — `cannot find type 'DoomscrollAttributes' in scope` (in DoomscrollLiveActivity.swift)

**`ios/DoomscrollWidget/DoomscrollWidgetBundle.swift`**
- luma: **unchecked**
- DoomscrollWidget: **checked**
- If also checked in luma: linker error or duplicate `@main` attribute

**`ios/DoomscrollWidget/DoomscrollLiveActivity.swift`**
- luma: **unchecked**
- DoomscrollWidget: **checked**
- If also checked in luma: potential symbol conflicts at link time

---

## Part 3 — Build and run

### Step 16 — Connect the iPhone

1. Connect the iPhone to your Mac with a USB cable
2. If the iPhone shows "Trust This Computer?" — tap **Trust** and enter your passcode
3. In Xcode, click the device selector at the top centre of the window
   (it shows something like "iPhone 16 Pro Simulator" by default)
4. A dropdown appears. Your iPhone should appear under a **Device** heading.
   Click it to select it.
5. If the iPhone shows as "unavailable" or does not appear, unplug and reconnect the
   cable and wait 10 seconds

### Step 17 — Build and run

Press **⌘R** or click the **▶** button at the top left of Xcode.

The first build takes 3–10 minutes. Progress appears in the Xcode status bar at the top.

When the build succeeds, the app installs on the iPhone and launches automatically.
If the build fails, see the Failure Modes section below.

---

## Part 4 — Confirming it works

### When Start Social Mode is tapped

1. The in-app UI changes: the creature emoji (🐛) appears large in the centre, and a
   timer starts counting up from `00:00`
2. Within 1–2 seconds, the Dynamic Island at the top of the iPhone changes shape —
   it expands from the camera-only pill into a wider pill shape
3. The left side of the pill displays: **🐛**
4. The right side of the pill displays: **00:00**

### While the session runs

- Every second, the in-app timer increments
- Every 10 seconds, the Dynamic Island timer updates (it will show `00:10`, `00:20`, etc.)
- When you background the app (swipe up from the bottom), the Dynamic Island stays
  visible at the top of the screen with the emoji and timer
- When you lock the screen, a larger banner appears on the lock screen showing the
  emoji, stage name, and timer
- Long-press the Dynamic Island — it expands to show three regions: emoji on the left,
  timer on the right, and "Doomscrolling · Calm" at the bottom
- At exactly 5 minutes elapsed: the emoji changes from 🐛 to 🦎 and the Dynamic Island
  reflects this immediately without waiting for the 10-second interval
- At exactly 10 minutes: 🦎 → 🦂
- At exactly 15 minutes: 🦂 → 💀

### When Stop is tapped

- The Dynamic Island shrinks back to the standard camera pill immediately
- The Live Activity banner disappears from the lock screen
- The in-app UI resets to 🐛 with no timer visible

---

## Part 5 — Failure modes

### Build error: `cannot find type 'DoomscrollAttributes' in scope`

**Root cause:** `DoomscrollAttributes.swift` is not assigned to the target that is
failing to build. If the error appears in `LiveActivityModule.swift`, the file is
missing from the luma target. If it appears in `DoomscrollLiveActivity.swift`, it is
missing from DoomscrollWidget.

**Fix:** Click `DoomscrollAttributes.swift` in the Navigator. In the File Inspector,
check that both **luma** and **DoomscrollWidget** are checked under Target Membership.

---

### Build error: `'RCTPromiseResolveBlock' is not a function type`

**Root cause:** The bridging header path in Build Settings is wrong, or the file does
not exist on disk.

**Fix — verify the path:**
luma target → Build Settings → search "Objective-C Bridging Header" → confirm the
value is exactly:
```
$(SRCROOT)/luma/luma-Bridging-Header.h
```

**Fix — verify the file exists:**
```bash
ls ios/luma/luma-Bridging-Header.h
```
If the file is missing, run: `git checkout -- ios/luma/luma-Bridging-Header.h`

---

### Build error: `'main' attribute cannot be applied to a type that is already marked as '@main'`

**Root cause:** An auto-generated Xcode widget file containing `@main` was not deleted
in Step 8. Two `@main` definitions exist in the DoomscrollWidget target.

**Fix:** In the Project Navigator, expand DoomscrollWidget. Find any `.swift` file that
is NOT one of: `DoomscrollWidgetBundle.swift`, `DoomscrollLiveActivity.swift`. Select it.
Right-click → Delete → Move to Trash.

---

### Build error: `No such module 'ActivityKit'`

**Root cause:** The DoomscrollWidget deployment target is below 16.1. ActivityKit is
not available before iOS 16.1.

**Fix:** DoomscrollWidget target → General → Minimum Deployments → iOS 16.1

---

### Signing error: `No profiles for 'com.luma.doomscroll' were found`

**Root cause:** The bundle ID `com.luma.doomscroll` is already registered to a
different Apple account.

**Fix:** In the luma target → Signing & Capabilities → change Bundle Identifier to
something unique, for example `com.yourfirstname.luma`. Then change the DoomscrollWidget
bundle identifier to the same prefix with `.widget` appended:
`com.yourfirstname.luma.widget`.

---

### Live Activity does not appear after tapping Start, and no error in Xcode console

**Root cause:** Live Activities are disabled at the system level.

**Fix:** On the iPhone:
Settings → Face ID & Passcode → enter your passcode → scroll to **Live Activities** →
toggle ON

Then launch the app. After the first launch, also check:
Settings → scroll down to **Luma** → **Live Activities** → ON

---

### Live Activity does not appear after tapping Start, and Xcode console shows `ACTIVITIES_DISABLED`

Same cause and fix as above.

---

### Live Activity does not appear after tapping Start, and Xcode console shows `START_FAILED`

**Root cause:** `NSSupportsLiveActivities` is missing from the main app Info.plist, or
the widget extension Info.plist does not have the same key.

**Fix:** Verify both plists as described in Step 4 and Step 12. Also confirm the widget
deployment target is 16.1 or later (Step 13).

---

### Dynamic Island shows the emoji and timer at start, but the timer never updates

**Root cause:** Low Power Mode is active. ActivityKit suspends non-critical updates
in Low Power Mode.

**Fix:** Settings → Battery → Low Power Mode → OFF

---

### `NativeModules.LiveActivityModule` is undefined (JavaScript error on device)

**Root cause:** `LiveActivityModule.swift` and/or `LiveActivityModule.m` are not in
the Xcode project or are not assigned to the luma target.

**Fix:** Confirm both files appear in the Navigator. Click each one and check that
**luma** is checked in the File Inspector Target Membership.

---

### `pod install` fails

```bash
sudo gem install cocoapods
cd ios && pod install --repo-update
```

---

## Stage reference

| Stage | Emoji | Time |
|-------|-------|------|
| calm | 🐛 | 0:00 to 4:59 |
| restless | 🦎 | 5:00 to 9:59 |
| agitated | 🦂 | 10:00 to 14:59 |
| exhausted | 💀 | 15:00 onwards |

In-app timer updates every **1 second**.
Dynamic Island updates every **10 seconds**, or immediately when the stage changes.
