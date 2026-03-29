import SwiftUI
import WidgetKit

// Entry point for the widget extension target.
// @main must appear exactly once in the extension — here.

@main
struct DoomscrollWidgetBundle: WidgetBundle {
    var body: some Widget {
        DoomscrollLiveActivityWidget()
    }
}
