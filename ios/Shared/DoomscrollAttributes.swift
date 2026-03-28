import ActivityKit
import Foundation

// DoomscrollAttributes defines the data contract for the Live Activity.
//
// This file must be added to BOTH targets in Xcode:
//   - luma (main app target)  — so LiveActivityModule.swift can call Activity.request(...)
//   - DoomscrollWidget (extension target) — so the widget can render the state
//
// Fixed attributes (set once at start, cannot change):
//   startTime — used if you ever want to display a timer relative to start
//
// ContentState (dynamic, updated via LiveActivityModule):
//   elapsedSeconds — seconds since the session began
//   stage          — one of: "calm" | "restless" | "agitated" | "exhausted"

public struct DoomscrollAttributes: ActivityAttributes {
    public struct ContentState: Codable, Hashable {
        public var elapsedSeconds: Int
        public var stage: String
    }

    public var startTime: Date
}
