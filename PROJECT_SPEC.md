# Doomscroll Creature App — Project Specification

## Overview

This app is a passive doomscroll awareness tool.

A virtual creature reflects how long a user spends on social media. It appears both inside the app and in the iPhone Dynamic Island via Live Activities.

The goal is not to interrupt or gamify aggressively, but to create subtle behavioural awareness through a persistent, evolving visual companion.

---

## Core Principles

- No notifications
- No streaks or addictive gamification
- Passive awareness only
- Calm, slightly eerie tone
- System-level presence via Dynamic Island is the core feature

---

## MVP Goal (Vertical Slice)

Build a working system where:

1. The user taps "Start Social Mode"
2. A Live Activity starts immediately
3. The Dynamic Island displays:
   - elapsed time
   - a basic creature state (simple visual or emoji)
4. The state updates over time
5. The user taps "Stop"
6. The Live Activity ends cleanly

Nothing else is required for this MVP.

---

## Tech Stack

### Frontend
- React Native (Expo dev client or bare workflow)
- Zustand for state management

### Native iOS
- Swift
- ActivityKit (Live Activities)
- WidgetKit (Dynamic Island UI)

---

## Architecture Overview

### React Native Layer

Responsibilities:
- Manage session state
- Run a timer loop
- Calculate elapsed time
- Determine the current stage
- Send updates to the native iOS layer

Session state tracks:
- whether a session is active
- when the session started
- elapsed time in seconds
- the current stage of the creature

### Stage System

- Calm: 0 to 5 minutes
- Restless: 5 to 10 minutes
- Agitated: 10 to 15 minutes
- Exhausted: 15 minutes and beyond

---

### Native iOS Layer

Responsibilities:
- Start a Live Activity
- Update the Live Activity
- End the Live Activity
- Render the Dynamic Island interface

---

## React Native to Swift Bridge

Implement a native module with three core functions:
- startActivity
- updateActivity
- endActivity

The data passed between layers should include:
- elapsed time
- current stage

---

## Dynamic Island UI (MVP)

Keep it minimal.

Map stages to simple visuals (such as emojis or symbols):
- Calm
- Restless
- Agitated
- Exhausted

Display:
- current state
- elapsed time

No animations required for MVP.

---

## Update Strategy

- React Native can track time every second
- Native Live Activity updates should occur every 5 to 15 seconds
- Avoid overly frequent updates due to system limitations

---

## Constraints

- Must run on a real iPhone (Dynamic Island required)
- Must support iOS 16.1 or later
- Must use ActivityKit for Live Activities
- Avoid overengineering

---

## Out of Scope (MVP)

Do not implement:
- Skins
- AI personalisation
- Analytics dashboards
- Notifications
- Social app detection
- iOS Shortcuts

---

## Success Criteria

The implementation is successful if:

- Live Activity appears immediately when a session starts
- Dynamic Island updates correctly over time
- Stage changes reflect elapsed time
- Ending a session removes the Live Activity reliably

---

## Future Extensions

- Creature animations
- Behaviour-based personality
- iOS Shortcuts automation
- Multiple skins
- Recovery mechanics

---

## Development Strategy

1. Build React Native session state and timer
2. Implement native Live Activity module
3. Connect the bridge between React Native and Swift
4. Test on a real iPhone
5. Only then expand features
