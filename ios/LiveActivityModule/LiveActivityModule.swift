import Foundation
import ActivityKit

@objc(LiveActivityModule)
class LiveActivityModule: NSObject {

  // Holds a reference to the running activity.
  // Typed as Any to avoid compile errors in targets that don't import ActivityKit
  // (e.g. the widget extension). In practice this file only lives in the main app target.
  private var currentActivity: Activity<DoomscrollAttributes>?

  // MARK: - Start

  @objc
  func startActivity(
    _ elapsedSeconds: Int,
    stage: String,
    resolve: @escaping RCTPromiseResolveBlock,
    reject: @escaping RCTPromiseRejectBlock
  ) {
    guard ActivityAuthorizationInfo().areActivitiesEnabled else {
      reject("ACTIVITIES_DISABLED", "Live Activities are not enabled on this device", nil)
      return
    }

    // End any existing activity first
    if let existing = currentActivity {
      Task { await existing.end(dismissalPolicy: .immediate) }
      currentActivity = nil
    }

    let attributes = DoomscrollAttributes(sessionID: UUID().uuidString)
    let contentState = DoomscrollAttributes.ContentState(
      elapsedSeconds: elapsedSeconds,
      stage: stage
    )

    do {
      let activity = try Activity<DoomscrollAttributes>.request(
        attributes: attributes,
        contentState: contentState,
        pushType: nil
      )
      currentActivity = activity
      resolve(activity.id)
    } catch {
      reject("START_FAILED", error.localizedDescription, error)
    }
  }

  // MARK: - Update

  @objc
  func updateActivity(
    _ elapsedSeconds: Int,
    stage: String,
    resolve: @escaping RCTPromiseResolveBlock,
    reject: @escaping RCTPromiseRejectBlock
  ) {
    guard let activity = currentActivity else {
      // No activity running — silently succeed to avoid JS errors during edge cases
      resolve(nil)
      return
    }

    let contentState = DoomscrollAttributes.ContentState(
      elapsedSeconds: elapsedSeconds,
      stage: stage
    )

    Task {
      await activity.update(using: contentState)
      resolve(nil)
    }
  }

  // MARK: - End

  @objc
  func endActivity(
    _ resolve: @escaping RCTPromiseResolveBlock,
    reject: @escaping RCTPromiseRejectBlock
  ) {
    guard let activity = currentActivity else {
      resolve(nil)
      return
    }

    // Nil out synchronously so any concurrent startActivity call does not see
    // a stale reference while the async end is in flight.
    currentActivity = nil
    Task {
      await activity.end(dismissalPolicy: .immediate)
      resolve(nil)
    }
  }

  // MARK: - RCT

  @objc
  static func requiresMainQueueSetup() -> Bool {
    return false
  }
}
