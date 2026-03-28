import ActivityKit
import SwiftUI
import WidgetKit

// MARK: - Helpers

private func stageEmoji(_ stage: String) -> String {
    switch stage {
    case "calm":      return "🐛"
    case "restless":  return "🦎"
    case "agitated":  return "🦂"
    case "exhausted": return "💀"
    default:          return "🐛"
    }
}

private func formatElapsed(_ seconds: Int) -> String {
    let m = seconds / 60
    let s = seconds % 60
    return String(format: "%02d:%02d", m, s)
}

// MARK: - Lock Screen / Notification Banner View
//
// This appears on the lock screen and as a banner when the app is foregrounded.

struct DoomscrollLockScreenView: View {
    let context: ActivityViewContext<DoomscrollAttributes>

    var body: some View {
        HStack(spacing: 16) {
            Text(stageEmoji(context.state.stage))
                .font(.system(size: 44))

            VStack(alignment: .leading, spacing: 4) {
                Text(context.state.stage.capitalized)
                    .font(.headline)
                    .foregroundColor(.white)
                Text(formatElapsed(context.state.elapsedSeconds))
                    .font(.system(.title2, design: .monospaced).weight(.light))
                    .foregroundColor(.white.opacity(0.6))
            }

            Spacer()
        }
        .padding(.horizontal, 20)
        .padding(.vertical, 14)
        .background(Color.black)
    }
}

// MARK: - Widget Configuration

struct DoomscrollLiveActivityWidget: Widget {
    var body: some WidgetConfiguration {
        ActivityConfiguration(for: DoomscrollAttributes.self) { context in
            // Lock screen / banner presentation
            DoomscrollLockScreenView(context: context)
        } dynamicIsland: { context in
            DynamicIsland {
                // Expanded state — shown when the user long-presses the Dynamic Island
                DynamicIslandExpandedRegion(.leading) {
                    Text(stageEmoji(context.state.stage))
                        .font(.system(size: 30))
                        .padding(.leading, 8)
                }
                DynamicIslandExpandedRegion(.trailing) {
                    Text(formatElapsed(context.state.elapsedSeconds))
                        .font(.system(.callout, design: .monospaced).bold())
                        .foregroundColor(.white.opacity(0.8))
                        .padding(.trailing, 8)
                }
                DynamicIslandExpandedRegion(.bottom) {
                    Text("Doomscrolling · \(context.state.stage.capitalized)")
                        .font(.caption)
                        .foregroundColor(.white.opacity(0.4))
                }
            } compactLeading: {
                // Left pill — creature stage emoji
                Text(stageEmoji(context.state.stage))
                    .font(.system(size: 15))
            } compactTrailing: {
                // Right pill — elapsed time
                Text(formatElapsed(context.state.elapsedSeconds))
                    .font(.system(.caption2, design: .monospaced).bold())
                    .foregroundColor(.white.opacity(0.85))
                    .minimumScaleFactor(0.7)
            } minimal: {
                // Shown when multiple Live Activities are running simultaneously
                Text(stageEmoji(context.state.stage))
                    .font(.system(size: 13))
            }
            .widgetURL(URL(string: "luma://session"))
            .keylineTint(Color.white.opacity(0.2))
        }
    }
}
