import { colors } from "@/constants/theme";
import { useSubscriptionStore } from "@/lib/subscriptionStore";
import { formatCurrency } from "@/lib/utils";
import { styled } from "nativewind";
import { useEffect, useMemo, useRef } from "react";
import { Animated, Easing, ScrollView, Text, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

// ─── Types ────────────────────────────────────────────────────────────────────

interface CategoryStat {
  category: string;
  total: number;
  count: number;
  color: string;
}

interface StatusStat {
  status: string;
  count: number;
  color: string;
  label: string;
}

interface BarItem {
  label: string;
  value: number;
  color: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const CATEGORY_COLORS: Record<string, string> = {
  Design: "#ea7a53",
  "Developer Tools": "#8fd1bd",
  "AI Tools": "#b8d4e3",
  Entertainment: "#f5c542",
  Productivity: "#e8def8",
  Other: "#c7c7c7",
};

const STATUS_META: Record<string, { color: string; label: string }> = {
  active: { color: colors.success, label: "Active" },
  paused: { color: "#f59e0b", label: "Paused" },
  cancelled: { color: colors.destructive, label: "Cancelled" },
};

function normalizeMonthlyPrice(subscription: Subscription): number {
  const billing = subscription.billing?.toLowerCase() ?? "";
  if (billing === "yearly" || billing === "annual") {
    return subscription.price / 12;
  }
  return subscription.price;
}

// ─── Animated Bar ─────────────────────────────────────────────────────────────

interface AnimatedBarProps {
  item: BarItem;
  maxValue: number;
  chartHeight: number;
  delay: number;
}

const AnimatedBar = ({
  item,
  maxValue,
  chartHeight,
  delay,
}: AnimatedBarProps) => {
  const anim = useRef(new Animated.Value(0)).current;
  const targetHeight = maxValue > 0 ? (item.value / maxValue) * chartHeight : 0;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: 1,
      duration: 600,
      delay,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [anim, delay]);

  const animatedHeight = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, targetHeight],
  });
  const animatedOpacity = anim.interpolate({
    inputRange: [0, 0.3],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  // Shorten label to fit under bar
  const shortLabel =
    item.label.length > 7 ? item.label.slice(0, 6) + "…" : item.label;

  return (
    <Animated.View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "flex-end",
        opacity: animatedOpacity,
      }}
    >
      {/* Value label on top */}
      <Animated.Text
        style={{
          fontSize: 10,
          fontWeight: "700",
          color: colors.foreground,
          marginBottom: 4,
          opacity: animatedOpacity,
        }}
      >
        {formatCurrency(item.value, "USD").replace("$", "$")}
      </Animated.Text>

      {/* Bar */}
      <Animated.View
        style={{
          width: "70%",
          height: animatedHeight,
          borderRadius: 8,
          backgroundColor: item.color,
          minHeight: item.value > 0 ? 4 : 0,
        }}
      />

      {/* Category label */}
      <Text
        style={{
          fontSize: 9,
          fontWeight: "600",
          color: colors.mutedForeground,
          marginTop: 6,
          textAlign: "center",
        }}
        numberOfLines={2}
      >
        {shortLabel}
      </Text>
    </Animated.View>
  );
};

// ─── Bar Chart ────────────────────────────────────────────────────────────────

interface BarChartProps {
  bars: BarItem[];
  chartHeight?: number;
  title: string;
  subtitle?: string;
}

const BarChart = ({
  bars,
  chartHeight = 140,
  title,
  subtitle,
}: BarChartProps) => {
  const maxValue = Math.max(...bars.map((b) => b.value), 1);

  // Horizontal grid lines
  const gridLines = [0.25, 0.5, 0.75, 1];

  return (
    <View
      style={{
        backgroundColor: colors.card,
        borderRadius: 20,
        padding: 20,
        marginBottom: 20,
      }}
    >
      {/* Header */}
      <Text
        style={{ fontSize: 17, fontWeight: "700", color: colors.foreground }}
      >
        {title}
      </Text>
      {subtitle && (
        <Text
          style={{
            fontSize: 12,
            color: colors.mutedForeground,
            marginTop: 2,
            marginBottom: 16,
          }}
        >
          {subtitle}
        </Text>
      )}

      {bars.length === 0 ? (
        <Text style={{ color: colors.mutedForeground, fontSize: 14 }}>
          No data available.
        </Text>
      ) : (
        <View style={{ marginTop: subtitle ? 0 : 16 }}>
          {/* Chart area */}
          <View style={{ flexDirection: "row" }}>
            {/* Y-axis labels */}
            <View
              style={{
                width: 38,
                height: chartHeight,
                justifyContent: "space-between",
                alignItems: "flex-end",
                paddingRight: 6,
                paddingBottom: 2,
              }}
            >
              {[...gridLines].reverse().map((frac) => (
                <Text
                  key={frac}
                  style={{ fontSize: 9, color: colors.mutedForeground }}
                >
                  ${Math.round(maxValue * frac)}
                </Text>
              ))}
              <Text style={{ fontSize: 9, color: colors.mutedForeground }}>
                $0
              </Text>
            </View>

            {/* Bars + grid */}
            <View style={{ flex: 1, position: "relative" }}>
              {/* Grid lines */}
              <View
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: chartHeight,
                  justifyContent: "space-between",
                }}
              >
                {[...gridLines, 0].map((frac) => (
                  <View
                    key={frac}
                    style={{
                      height: 1,
                      backgroundColor:
                        frac === 0
                          ? colors.foreground + "40"
                          : colors.border,
                    }}
                  />
                ))}
              </View>

              {/* Bars */}
              <View
                style={{
                  flexDirection: "row",
                  height: chartHeight,
                  alignItems: "flex-end",
                  gap: 6,
                  paddingHorizontal: 4,
                }}
              >
                {bars.map((bar, i) => (
                  <AnimatedBar
                    key={bar.label}
                    item={bar}
                    maxValue={maxValue}
                    chartHeight={chartHeight - 24} // leave room for value label
                    delay={i * 80}
                  />
                ))}
              </View>
            </View>
          </View>

          {/* Legend */}
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              gap: 8,
              marginTop: 16,
            }}
          >
            {bars.map((bar) => (
              <View
                key={bar.label}
                style={{ flexDirection: "row", alignItems: "center", gap: 5 }}
              >
                <View
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: bar.color,
                  }}
                />
                <Text style={{ fontSize: 11, color: colors.mutedForeground }}>
                  {bar.label}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
};

// ─── Sub-components ──────────────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
  accent?: boolean;
}

const StatCard = ({ label, value, sub, accent = false }: StatCardProps) => (
  <View
    style={{
      flex: 1,
      backgroundColor: accent ? colors.primary : colors.card,
      borderRadius: 16,
      padding: 16,
      gap: 4,
    }}
  >
    <Text
      style={{
        fontSize: 11,
        fontWeight: "600",
        color: accent ? "rgba(255,255,255,0.6)" : colors.mutedForeground,
        textTransform: "uppercase",
        letterSpacing: 0.8,
      }}
    >
      {label}
    </Text>
    <Text
      style={{
        fontSize: 22,
        fontWeight: "800",
        color: accent ? "#fff" : colors.foreground,
      }}
    >
      {value}
    </Text>
    {sub && (
      <Text
        style={{
          fontSize: 12,
          color: accent ? "rgba(255,255,255,0.5)" : colors.mutedForeground,
        }}
      >
        {sub}
      </Text>
    )}
  </View>
);

interface CategoryBarProps {
  stat: CategoryStat;
  max: number;
}

const CategoryBar = ({ stat, max }: CategoryBarProps) => {
  const pct = max > 0 ? stat.total / max : 0;
  return (
    <View style={{ marginBottom: 14 }}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginBottom: 6,
        }}
      >
        <Text
          style={{ fontSize: 14, fontWeight: "600", color: colors.foreground }}
        >
          {stat.category}
        </Text>
        <Text
          style={{ fontSize: 14, fontWeight: "700", color: colors.foreground }}
        >
          {formatCurrency(stat.total)}
          <Text
            style={{
              fontSize: 11,
              fontWeight: "500",
              color: colors.mutedForeground,
            }}
          >
            {" "}
            / mo
          </Text>
        </Text>
      </View>
      <View
        style={{
          height: 8,
          borderRadius: 99,
          backgroundColor: colors.muted,
          overflow: "hidden",
        }}
      >
        <View
          style={{
            width: `${pct * 100}%`,
            height: "100%",
            borderRadius: 99,
            backgroundColor: stat.color,
          }}
        />
      </View>
      <Text
        style={{ fontSize: 11, color: colors.mutedForeground, marginTop: 4 }}
      >
        {stat.count} subscription{stat.count !== 1 ? "s" : ""}
      </Text>
    </View>
  );
};

interface StatusPillProps {
  stat: StatusStat;
  total: number;
}

const StatusPill = ({ stat, total }: StatusPillProps) => {
  const pct = total > 0 ? Math.round((stat.count / total) * 100) : 0;
  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        backgroundColor: colors.card,
        borderRadius: 16,
        padding: 14,
        gap: 6,
      }}
    >
      <View
        style={{
          width: 10,
          height: 10,
          borderRadius: 5,
          backgroundColor: stat.color,
        }}
      />
      <Text
        style={{ fontSize: 22, fontWeight: "800", color: colors.foreground }}
      >
        {stat.count}
      </Text>
      <Text style={{ fontSize: 12, fontWeight: "600", color: stat.color }}>
        {stat.label}
      </Text>
      <Text style={{ fontSize: 11, color: colors.mutedForeground }}>
        {pct}%
      </Text>
    </View>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

const Insights = () => {
  const { subscriptions } = useSubscriptionStore();

  const analytics = useMemo(() => {
    const activeOnly = subscriptions.filter((s) => s.status === "active");

    const monthlyTotal = activeOnly.reduce(
      (sum, s) => sum + normalizeMonthlyPrice(s),
      0,
    );
    const yearlyTotal = monthlyTotal * 12;

    // Category breakdown
    const categoryMap = new Map<string, CategoryStat>();
    for (const sub of activeOnly) {
      const cat = sub.category?.trim() || "Other";
      const monthly = normalizeMonthlyPrice(sub);
      const existing = categoryMap.get(cat);
      categoryMap.set(cat, {
        category: cat,
        total: (existing?.total ?? 0) + monthly,
        count: (existing?.count ?? 0) + 1,
        color: CATEGORY_COLORS[cat] ?? "#c7c7c7",
      });
    }
    const categories = Array.from(categoryMap.values()).sort(
      (a, b) => b.total - a.total,
    );

    // Status breakdown
    const statusMap = new Map<string, number>();
    for (const sub of subscriptions) {
      const s = sub.status ?? "unknown";
      statusMap.set(s, (statusMap.get(s) ?? 0) + 1);
    }
    const statuses: StatusStat[] = Array.from(statusMap.entries()).map(
      ([status, count]) => ({
        status,
        count,
        color: STATUS_META[status]?.color ?? "#c7c7c7",
        label: STATUS_META[status]?.label ?? status,
      }),
    );

    // Most expensive
    const mostExpensive = activeOnly.reduce<Subscription | null>(
      (best, s) =>
        best === null ||
        normalizeMonthlyPrice(s) > normalizeMonthlyPrice(best)
          ? s
          : best,
      null,
    );

    // Billing breakdown
    const billingMap = new Map<string, number>();
    for (const sub of activeOnly) {
      const b = sub.billing ?? "Unknown";
      billingMap.set(b, (billingMap.get(b) ?? 0) + 1);
    }

    // Per-subscription bar data
    const subBars: BarItem[] = activeOnly
      .map((s) => ({
        label: s.name,
        value: normalizeMonthlyPrice(s),
        color: s.color ?? CATEGORY_COLORS[s.category ?? "Other"] ?? "#c7c7c7",
      }))
      .sort((a, b) => b.value - a.value);

    return {
      monthlyTotal,
      yearlyTotal,
      totalCount: subscriptions.length,
      activeCount: activeOnly.length,
      categories,
      statuses,
      mostExpensive,
      billingMap,
      subBars,
    };
  }, [subscriptions]);

  const maxCategoryTotal = analytics.categories[0]?.total ?? 1;

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 120 }}
      >
        {/* Header */}
        <View style={{ paddingTop: 20, marginBottom: 24 }}>
          <Text
            style={{
              fontSize: 30,
              fontWeight: "800",
              color: colors.foreground,
              letterSpacing: -0.5,
            }}
          >
            Insights
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: colors.mutedForeground,
              marginTop: 4,
            }}
          >
            Your subscription spending at a glance
          </Text>
        </View>

        {/* Top stat cards */}
        <View style={{ flexDirection: "row", gap: 12, marginBottom: 12 }}>
          <StatCard
            label="Monthly"
            value={formatCurrency(analytics.monthlyTotal)}
            sub="Active only"
            accent
          />
          <StatCard
            label="Yearly"
            value={formatCurrency(analytics.yearlyTotal)}
            sub="Projected"
          />
        </View>

        <View style={{ flexDirection: "row", gap: 12, marginBottom: 24 }}>
          <StatCard
            label="Total Subs"
            value={String(analytics.totalCount)}
            sub={`${analytics.activeCount} active`}
          />
          {analytics.mostExpensive && (
            <StatCard
              label="Most Expensive"
              value={formatCurrency(
                normalizeMonthlyPrice(analytics.mostExpensive),
              )}
              sub={analytics.mostExpensive.name}
            />
          )}
        </View>

        {/* ── Bar Chart ─────────────────────────────────── */}
        <BarChart
          title="Monthly Cost per Subscription"
          subtitle="Active subscriptions · USD / month"
          bars={analytics.subBars}
          chartHeight={160}
        />

        {/* Spending by Category */}
        <View
          style={{
            backgroundColor: colors.card,
            borderRadius: 20,
            padding: 20,
            marginBottom: 20,
          }}
        >
          <Text
            style={{
              fontSize: 17,
              fontWeight: "700",
              color: colors.foreground,
            }}
          >
            Spending by Category
          </Text>
          <Text
            style={{
              fontSize: 12,
              color: colors.mutedForeground,
              marginTop: 2,
              marginBottom: 20,
            }}
          >
            Monthly · Active subscriptions
          </Text>

          {analytics.categories.length === 0 ? (
            <Text style={{ color: colors.mutedForeground, fontSize: 14 }}>
              No active subscriptions.
            </Text>
          ) : (
            analytics.categories.map((cat) => (
              <CategoryBar
                key={cat.category}
                stat={cat}
                max={maxCategoryTotal}
              />
            ))
          )}
        </View>

        {/* Subscription Status */}
        <View
          style={{
            backgroundColor: colors.card,
            borderRadius: 20,
            padding: 20,
            marginBottom: 20,
          }}
        >
          <Text
            style={{
              fontSize: 17,
              fontWeight: "700",
              color: colors.foreground,
              marginBottom: 16,
            }}
          >
            Subscription Status
          </Text>
          <View style={{ flexDirection: "row", gap: 10 }}>
            {analytics.statuses.map((s) => (
              <StatusPill
                key={s.status}
                stat={s}
                total={analytics.totalCount}
              />
            ))}
          </View>
        </View>

        {/* Billing Frequency */}
        <View
          style={{
            backgroundColor: colors.card,
            borderRadius: 20,
            padding: 20,
            marginBottom: 20,
          }}
        >
          <Text
            style={{
              fontSize: 17,
              fontWeight: "700",
              color: colors.foreground,
              marginBottom: 16,
            }}
          >
            Billing Frequency
          </Text>
          <View style={{ gap: 10 }}>
            {Array.from(analytics.billingMap.entries()).map(
              ([billing, count]) => {
                const totalActive = analytics.activeCount || 1;
                const pct = count / totalActive;
                return (
                  <View key={billing}>
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        marginBottom: 6,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: "600",
                          color: colors.foreground,
                        }}
                      >
                        {billing}
                      </Text>
                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: "700",
                          color: colors.foreground,
                        }}
                      >
                        {count}{" "}
                        <Text
                          style={{
                            fontSize: 12,
                            color: colors.mutedForeground,
                            fontWeight: "400",
                          }}
                        >
                          ({Math.round(pct * 100)}%)
                        </Text>
                      </Text>
                    </View>
                    <View
                      style={{
                        height: 6,
                        borderRadius: 99,
                        backgroundColor: colors.muted,
                        overflow: "hidden",
                      }}
                    >
                      <View
                        style={{
                          width: `${pct * 100}%`,
                          height: "100%",
                          borderRadius: 99,
                          backgroundColor: colors.accent,
                        }}
                      />
                    </View>
                  </View>
                );
              },
            )}
            {analytics.billingMap.size === 0 && (
              <Text style={{ color: colors.mutedForeground, fontSize: 14 }}>
                No active subscriptions.
              </Text>
            )}
          </View>
        </View>

        {/* Tip card */}
        <View
          style={{
            backgroundColor: colors.accent,
            borderRadius: 20,
            padding: 20,
          }}
        >
          <Text
            style={{
              fontSize: 13,
              fontWeight: "700",
              color: "rgba(255,255,255,0.8)",
              textTransform: "uppercase",
              letterSpacing: 0.8,
              marginBottom: 8,
            }}
          >
            💡 Smart Tip
          </Text>
          <Text
            style={{
              fontSize: 15,
              fontWeight: "600",
              color: "#fff",
              lineHeight: 22,
            }}
          >
            {analytics.mostExpensive
              ? `${analytics.mostExpensive.name} is your largest expense at ${formatCurrency(normalizeMonthlyPrice(analytics.mostExpensive))}/mo. Consider reviewing its usage.`
              : "Add subscriptions to see personalized spending tips."}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Insights;
