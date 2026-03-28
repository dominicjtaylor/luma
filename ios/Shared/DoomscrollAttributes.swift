import ActivityKit
import Foundation

// DoomscrollAttributes defines the data contract for the Live Activity.
//
// This file must be added to BOTH targets in Xcode:
//   - luma (main app target)  — so LiveActivityModule.swift can call Activity.request(...)
//   - DoomscrollWidget (extension target) — so the widget can render the state
//
// ActivityAttributes requires at least one fixed attribute, so a placeholder is used.
// ContentState (dynamic, updated via LiveActivityModule):
//   elapsedSeconds — seconds since the session began
//   stage          — one of: "calm" | "restless" | "agitated" | "exhausted"

public struct DoomscrollAttributes: ActivityAttributes {
    public struct ContentState: Codable, Hashable {
        public var elapsedSeconds: Int
        public var stage: String
    }

    // ActivityAttributes requires a body — unused but required by the protocol.
    public var sessionID: String
}
