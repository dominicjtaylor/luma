# Luma

A passive doomscroll awareness tool for iPhone.

A virtual creature lives in your Dynamic Island and reflects how long you've been on social media. It doesn't interrupt you. It just watches.

---

## How it works

Tap **Start Social Mode** when you open a social app. A Live Activity starts immediately and the creature appears in the Dynamic Island. As time passes, the creature changes state. When you stop, it disappears.

| Time | State | Emoji |
|------|-------|-------|
| 0 – 5 min | Calm | 🐛 |
| 5 – 10 min | Restless | 🦎 |
| 10 – 15 min | Agitated | 🦂 |
| 15 min + | Exhausted | 💀 |

No notifications. No streaks. No judgment. Just a small persistent thing that reflects time back at you.

---

## Tech stack

- **React Native** (Expo bare workflow) — session state, timer, bridge calls
- **Zustand** — session state management
- **Swift + ActivityKit** — Live Activity lifecycle
- **WidgetKit** — Dynamic Island UI

---

## Requirements

- iPhone 14 Pro or later (Dynamic Island required)
- iOS 16.1 or later
- Xcode 15 or later
- Node.js 18 or later
- CocoaPods

Simulators do not support Live Activities. A physical device is required.

---

## Setup

See [SETUP.md](./SETUP.md) for the full step-by-step guide covering:

- Generating the iOS project with Expo prebuild
- Xcode target configuration
- Widget extension setup
- Signing and deployment
- Verification checklist and failure modes

---

## Project structure

```
src/
├── store/sessionStore.ts       Zustand state — isActive, elapsed, stage
├── screens/HomeScreen.tsx      UI, timer loop, throttled native updates
├── native/LiveActivityModule.ts  JS bridge wrapper
└── utils/stageUtils.ts         Stage thresholds and display values

ios/
├── Shared/
│   └── DoomscrollAttributes.swift   ActivityAttributes — compiled into both targets
├── LiveActivityModule/
│   ├── LiveActivityModule.swift     start / update / end (main app target)
│   └── LiveActivityModule.m         RCT_EXTERN_MODULE bridge declaration
└── DoomscrollWidget/
    ├── DoomscrollWidgetBundle.swift  Widget extension entry point
    └── DoomscrollLiveActivity.swift  Dynamic Island and lock screen views
```

---

## MVP scope

This is a vertical slice. It proves the full system loop:

**React Native state → native bridge → Live Activity → Dynamic Island → updates → clean end**

Out of scope for now: skins, AI, analytics, notifications, social app detection.
