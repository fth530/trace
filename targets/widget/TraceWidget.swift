import WidgetKit
import SwiftUI

// MARK: - Data Models

struct Expense: Codable, Identifiable {
    let description: String
    let amount: Double
    let category: String

    var id: String { "\(description)-\(amount)" }
}

struct DailyData: Codable, Identifiable {
    let date: String
    let total: Double

    var id: String { date }

    var shortDay: String {
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd"
        formatter.locale = Locale(identifier: "tr_TR")
        guard let d = formatter.date(from: date) else { return "" }
        let dayFormatter = DateFormatter()
        dayFormatter.dateFormat = "EEE"
        dayFormatter.locale = Locale(identifier: "tr_TR")
        return dayFormatter.string(from: d).prefix(2).uppercased()
    }
}

struct WidgetData {
    let todayTotal: Double
    let dailyLimit: Double
    let monthTotal: Double
    let remainingToday: Double
    let recentExpenses: [Expense]
    let weeklyData: [DailyData]
    let lastUpdated: String

    var progress: Double {
        guard dailyLimit > 0 else { return 0 }
        return min(todayTotal / dailyLimit, 1.0)
    }

    var progressColor: Color {
        let ratio = progress
        if ratio < 0.5 { return Color.widgetGreen }
        if ratio < 0.8 { return Color.widgetOrange }
        return Color.widgetRed
    }

    static let placeholder = WidgetData(
        todayTotal: 245.50,
        dailyLimit: 500.0,
        monthTotal: 4830.0,
        remainingToday: 254.50,
        recentExpenses: [
            Expense(description: "Market", amount: 120.0, category: "market"),
            Expense(description: "Kahve", amount: 45.50, category: "yeme-icme"),
            Expense(description: "Taksi", amount: 80.0, category: "ulasim"),
        ],
        weeklyData: [
            DailyData(date: "2024-01-08", total: 320),
            DailyData(date: "2024-01-09", total: 180),
            DailyData(date: "2024-01-10", total: 450),
            DailyData(date: "2024-01-11", total: 290),
            DailyData(date: "2024-01-12", total: 150),
            DailyData(date: "2024-01-13", total: 380),
            DailyData(date: "2024-01-14", total: 245),
        ],
        lastUpdated: ""
    )
}

// MARK: - Data Provider

struct WidgetDataProvider {
    static func load() -> WidgetData {
        guard let defaults = UserDefaults(suiteName: "group.com.trace.gunluk") else {
            return .placeholder
        }

        let todayTotal = defaults.double(forKey: "todayTotal")
        let dailyLimit = defaults.double(forKey: "dailyLimit")
        let monthTotal = defaults.double(forKey: "monthTotal")
        let remainingToday = defaults.double(forKey: "remainingToday")
        let lastUpdated = defaults.string(forKey: "lastUpdated") ?? ""

        var recentExpenses: [Expense] = []
        if let json = defaults.string(forKey: "recentExpenses"),
           let data = json.data(using: .utf8) {
            recentExpenses = (try? JSONDecoder().decode([Expense].self, from: data)) ?? []
        }

        var weeklyData: [DailyData] = []
        if let json = defaults.string(forKey: "weeklyData"),
           let data = json.data(using: .utf8) {
            weeklyData = (try? JSONDecoder().decode([DailyData].self, from: data)) ?? []
        }

        let hasData = todayTotal > 0 || dailyLimit > 0 || !recentExpenses.isEmpty
        if !hasData {
            return .placeholder
        }

        return WidgetData(
            todayTotal: todayTotal,
            dailyLimit: dailyLimit > 0 ? dailyLimit : 500.0,
            monthTotal: monthTotal,
            remainingToday: remainingToday,
            recentExpenses: recentExpenses,
            weeklyData: weeklyData,
            lastUpdated: lastUpdated
        )
    }
}

// MARK: - Color Extensions

extension Color {
    static let widgetBackground = Color(red: 0, green: 0, blue: 0)
    static let cardBackground = Color(red: 0.11, green: 0.11, blue: 0.118)
    static let widgetBlue = Color(red: 0, green: 0.478, blue: 1.0)
    static let widgetGreen = Color(red: 0.204, green: 0.78, blue: 0.349)
    static let widgetOrange = Color(red: 1.0, green: 0.584, blue: 0)
    static let widgetRed = Color(red: 1.0, green: 0.231, blue: 0.188)
    static let secondaryText = Color(white: 0.56)
}

// MARK: - Currency Formatter

func formatCurrency(_ value: Double) -> String {
    let formatter = NumberFormatter()
    formatter.numberStyle = .decimal
    formatter.maximumFractionDigits = 0
    formatter.groupingSeparator = ","
    let formatted = formatter.string(from: NSNumber(value: value)) ?? "\(Int(value))"
    return "\u{20BA}\(formatted)"
}

// MARK: - Timeline Provider

struct TraceTimelineProvider: TimelineProvider {
    func placeholder(in context: Context) -> TraceEntry {
        TraceEntry(date: Date(), data: .placeholder)
    }

    func getSnapshot(in context: Context, completion: @escaping (TraceEntry) -> Void) {
        let data = WidgetDataProvider.load()
        completion(TraceEntry(date: Date(), data: data))
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<TraceEntry>) -> Void) {
        let data = WidgetDataProvider.load()
        let entry = TraceEntry(date: Date(), data: data)
        let nextUpdate = Calendar.current.date(byAdding: .minute, value: 15, to: Date())!
        let timeline = Timeline(entries: [entry], policy: .after(nextUpdate))
        completion(timeline)
    }
}

struct TraceEntry: TimelineEntry {
    let date: Date
    let data: WidgetData
}

// MARK: - Small Widget View

struct SmallWidgetView: View {
    let data: WidgetData

    var body: some View {
        ZStack {
            Color.widgetBackground

            VStack(spacing: 8) {
                HStack {
                    Text("Bug\u{00FC}n")
                        .font(.caption)
                        .fontWeight(.medium)
                        .foregroundColor(.secondaryText)
                    Spacer()
                    Circle()
                        .fill(data.progressColor)
                        .frame(width: 6, height: 6)
                }

                Spacer()

                ZStack {
                    Circle()
                        .stroke(Color.cardBackground, lineWidth: 6)
                        .frame(width: 72, height: 72)

                    Circle()
                        .trim(from: 0, to: data.progress)
                        .stroke(
                            data.progressColor,
                            style: StrokeStyle(lineWidth: 6, lineCap: .round)
                        )
                        .frame(width: 72, height: 72)
                        .rotationEffect(.degrees(-90))

                    VStack(spacing: 1) {
                        Text(formatCurrency(data.todayTotal))
                            .font(.system(size: 16, weight: .bold, design: .rounded))
                            .foregroundColor(.white)
                            .minimumScaleFactor(0.6)
                            .lineLimit(1)

                        Text("%\(Int(data.progress * 100))")
                            .font(.system(size: 10, weight: .medium))
                            .foregroundColor(data.progressColor)
                    }
                }

                Spacer()

                Text("Limit: \(formatCurrency(data.dailyLimit))")
                    .font(.system(size: 10))
                    .foregroundColor(.secondaryText)
            }
            .padding(14)
        }
    }
}

// MARK: - Medium Widget View

struct MediumWidgetView: View {
    let data: WidgetData

    var body: some View {
        ZStack {
            Color.widgetBackground

            HStack(spacing: 12) {
                // Left side - Summary
                VStack(alignment: .leading, spacing: 6) {
                    Text("Bug\u{00FC}n")
                        .font(.caption)
                        .fontWeight(.medium)
                        .foregroundColor(.secondaryText)

                    Text(formatCurrency(data.todayTotal))
                        .font(.system(size: 26, weight: .bold, design: .rounded))
                        .foregroundColor(.white)
                        .minimumScaleFactor(0.7)
                        .lineLimit(1)

                    Spacer()

                    // Progress bar
                    VStack(alignment: .leading, spacing: 4) {
                        GeometryReader { geo in
                            ZStack(alignment: .leading) {
                                RoundedRectangle(cornerRadius: 3)
                                    .fill(Color.cardBackground)
                                    .frame(height: 6)

                                RoundedRectangle(cornerRadius: 3)
                                    .fill(data.progressColor)
                                    .frame(width: geo.size.width * data.progress, height: 6)
                            }
                        }
                        .frame(height: 6)

                        HStack {
                            Text("Kalan")
                                .font(.system(size: 10))
                                .foregroundColor(.secondaryText)
                            Spacer()
                            Text(formatCurrency(data.remainingToday))
                                .font(.system(size: 10, weight: .semibold))
                                .foregroundColor(data.progressColor)
                        }
                    }
                }
                .frame(maxWidth: .infinity)

                // Divider
                RoundedRectangle(cornerRadius: 0.5)
                    .fill(Color.cardBackground)
                    .frame(width: 1)
                    .padding(.vertical, 4)

                // Right side - Recent expenses
                VStack(alignment: .leading, spacing: 4) {
                    Text("Son Harcamalar")
                        .font(.system(size: 10, weight: .medium))
                        .foregroundColor(.secondaryText)
                        .padding(.bottom, 2)

                    ForEach(Array(data.recentExpenses.prefix(3).enumerated()), id: \.offset) { index, expense in
                        HStack {
                            Text(expense.description)
                                .font(.system(size: 12))
                                .foregroundColor(.white)
                                .lineLimit(1)
                            Spacer()
                            Text(formatCurrency(expense.amount))
                                .font(.system(size: 12, weight: .semibold, design: .rounded))
                                .foregroundColor(.white)
                        }

                        if index < min(data.recentExpenses.count, 3) - 1 {
                            Divider()
                                .background(Color.cardBackground)
                        }
                    }

                    if data.recentExpenses.isEmpty {
                        Text("Hen\u{00FC}z harcama yok")
                            .font(.system(size: 11))
                            .foregroundColor(.secondaryText)
                            .frame(maxHeight: .infinity)
                    }

                    Spacer(minLength: 0)
                }
                .frame(maxWidth: .infinity)
            }
            .padding(14)
        }
    }
}

// MARK: - Large Widget View

struct LargeWidgetView: View {
    let data: WidgetData

    var body: some View {
        ZStack {
            Color.widgetBackground

            VStack(spacing: 12) {
                // Top summary row
                HStack(alignment: .top) {
                    VStack(alignment: .leading, spacing: 4) {
                        Text("Bug\u{00FC}n")
                            .font(.caption)
                            .fontWeight(.medium)
                            .foregroundColor(.secondaryText)

                        Text(formatCurrency(data.todayTotal))
                            .font(.system(size: 30, weight: .bold, design: .rounded))
                            .foregroundColor(.white)
                            .minimumScaleFactor(0.7)
                            .lineLimit(1)
                    }

                    Spacer()

                    VStack(alignment: .trailing, spacing: 4) {
                        Text("Ayl\u{0131}k")
                            .font(.caption)
                            .foregroundColor(.secondaryText)

                        Text(formatCurrency(data.monthTotal))
                            .font(.system(size: 16, weight: .semibold, design: .rounded))
                            .foregroundColor(.white)
                    }
                }

                // Progress bar
                VStack(spacing: 4) {
                    GeometryReader { geo in
                        ZStack(alignment: .leading) {
                            RoundedRectangle(cornerRadius: 4)
                                .fill(Color.cardBackground)
                                .frame(height: 8)

                            RoundedRectangle(cornerRadius: 4)
                                .fill(data.progressColor)
                                .frame(width: geo.size.width * data.progress, height: 8)
                        }
                    }
                    .frame(height: 8)

                    HStack {
                        Text("G\u{00FC}nl\u{00FC}k Limit: \(formatCurrency(data.dailyLimit))")
                            .font(.system(size: 10))
                            .foregroundColor(.secondaryText)
                        Spacer()
                        Text("Kalan: \(formatCurrency(data.remainingToday))")
                            .font(.system(size: 10, weight: .semibold))
                            .foregroundColor(data.progressColor)
                    }
                }

                // Weekly chart
                VStack(alignment: .leading, spacing: 6) {
                    Text("Haftal\u{0131}k")
                        .font(.system(size: 11, weight: .medium))
                        .foregroundColor(.secondaryText)

                    WeeklyChartView(weeklyData: data.weeklyData, dailyLimit: data.dailyLimit)
                        .frame(height: 60)
                }
                .padding(10)
                .background(
                    RoundedRectangle(cornerRadius: 10)
                        .fill(Color.cardBackground)
                )

                // Recent expenses
                VStack(alignment: .leading, spacing: 6) {
                    Text("Son Harcamalar")
                        .font(.system(size: 11, weight: .medium))
                        .foregroundColor(.secondaryText)

                    ForEach(Array(data.recentExpenses.prefix(5).enumerated()), id: \.offset) { index, expense in
                        HStack {
                            CategoryIcon(category: expense.category)

                            Text(expense.description)
                                .font(.system(size: 13))
                                .foregroundColor(.white)
                                .lineLimit(1)

                            Spacer()

                            Text(formatCurrency(expense.amount))
                                .font(.system(size: 13, weight: .semibold, design: .rounded))
                                .foregroundColor(.white)
                        }

                        if index < min(data.recentExpenses.count, 5) - 1 {
                            Divider()
                                .background(Color.cardBackground)
                        }
                    }

                    if data.recentExpenses.isEmpty {
                        HStack {
                            Spacer()
                            Text("Hen\u{00FC}z harcama yok")
                                .font(.system(size: 12))
                                .foregroundColor(.secondaryText)
                            Spacer()
                        }
                        .padding(.vertical, 8)
                    }
                }
                .padding(10)
                .background(
                    RoundedRectangle(cornerRadius: 10)
                        .fill(Color.cardBackground)
                )

                Spacer(minLength: 0)
            }
            .padding(16)
        }
    }
}

// MARK: - Weekly Chart

struct WeeklyChartView: View {
    let weeklyData: [DailyData]
    let dailyLimit: Double

    private var maxValue: Double {
        max(weeklyData.map(\.total).max() ?? 1, dailyLimit)
    }

    var body: some View {
        HStack(alignment: .bottom, spacing: 6) {
            ForEach(Array(weeklyData.suffix(7).enumerated()), id: \.offset) { _, day in
                VStack(spacing: 4) {
                    Spacer(minLength: 0)

                    RoundedRectangle(cornerRadius: 3)
                        .fill(barColor(for: day.total))
                        .frame(height: max(barHeight(for: day.total), 4))

                    Text(day.shortDay)
                        .font(.system(size: 8, weight: .medium))
                        .foregroundColor(.secondaryText)
                }
            }

            if weeklyData.count < 7 {
                ForEach(0..<(7 - weeklyData.count), id: \.self) { _ in
                    VStack(spacing: 4) {
                        Spacer(minLength: 0)
                        RoundedRectangle(cornerRadius: 3)
                            .fill(Color.cardBackground)
                            .frame(height: 4)
                        Text("--")
                            .font(.system(size: 8))
                            .foregroundColor(.secondaryText)
                    }
                }
            }
        }
    }

    private func barHeight(for value: Double) -> CGFloat {
        guard maxValue > 0 else { return 4 }
        return CGFloat(value / maxValue) * 44
    }

    private func barColor(for value: Double) -> Color {
        let ratio = dailyLimit > 0 ? value / dailyLimit : 0
        if ratio < 0.5 { return .widgetGreen }
        if ratio < 0.8 { return .widgetOrange }
        return .widgetRed
    }
}

// MARK: - Category Icon

struct CategoryIcon: View {
    let category: String

    private var iconName: String {
        switch category.lowercased() {
        case "market", "al\u{0131}\u{015F}veri\u{015F}":
            return "cart.fill"
        case "yeme-icme", "yemek":
            return "fork.knife"
        case "ula\u{015F}\u{0131}m", "taksi":
            return "car.fill"
        case "e\u{011F}lence":
            return "gamecontroller.fill"
        case "sa\u{011F}l\u{0131}k":
            return "heart.fill"
        case "fatura":
            return "doc.text.fill"
        default:
            return "creditcard.fill"
        }
    }

    var body: some View {
        Image(systemName: iconName)
            .font(.system(size: 10))
            .foregroundColor(.widgetBlue)
            .frame(width: 22, height: 22)
            .background(
                RoundedRectangle(cornerRadius: 6)
                    .fill(Color.widgetBlue.opacity(0.15))
            )
    }
}

// MARK: - Main Widget View

struct TraceWidgetEntryView: View {
    var entry: TraceEntry

    @Environment(\.widgetFamily) var family

    var body: some View {
        Group {
            switch family {
            case .systemSmall:
                SmallWidgetView(data: entry.data)
            case .systemMedium:
                MediumWidgetView(data: entry.data)
            case .systemLarge:
                LargeWidgetView(data: entry.data)
            @unknown default:
                SmallWidgetView(data: entry.data)
            }
        }
        .widgetURL(URL(string: "gunluk://home"))
    }
}

// MARK: - Widget Configuration

struct TraceWidget: Widget {
    let kind: String = "TraceWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: TraceTimelineProvider()) { entry in
            if #available(iOSApplicationExtension 17.0, *) {
                TraceWidgetEntryView(entry: entry)
                    .containerBackground(.black, for: .widget)
            } else {
                TraceWidgetEntryView(entry: entry)
            }
        }
        .configurationDisplayName("Trace - Harcama Takibi")
        .description("G\u{00FC}nl\u{00FC}k harcamalar\u{0131}n\u{0131}z\u{0131} takip edin")
        .supportedFamilies([.systemSmall, .systemMedium, .systemLarge])
    }
}

// MARK: - Previews

#if DEBUG
struct TraceWidget_Previews: PreviewProvider {
    static var previews: some View {
        let entry = TraceEntry(date: Date(), data: .placeholder)

        TraceWidgetEntryView(entry: entry)
            .previewContext(WidgetPreviewContext(family: .systemSmall))
            .previewDisplayName("Small")

        TraceWidgetEntryView(entry: entry)
            .previewContext(WidgetPreviewContext(family: .systemMedium))
            .previewDisplayName("Medium")

        TraceWidgetEntryView(entry: entry)
            .previewContext(WidgetPreviewContext(family: .systemLarge))
            .previewDisplayName("Large")
    }
}
#endif
