import { useState } from "react";
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Bot,
  Brain,
  CheckCircle2,
  ChevronRight,
  Lightbulb,
  MessageCircle,
  PiggyBank,
  RefreshCw,
  Sparkles,
  Target,
  TrendingDown,
  TrendingUp,
  X,
} from "lucide-react";

const insights = [
  {
    id: 1,
    type: "positive",
    icon: TrendingDown,
    title: "Your spending is improving",
    description:
      "You've spent 8.2% less this month compared with last month. Your biggest improvement is in dining and transportation.",
    action: "Keep it up",
  },
  {
    id: 2,
    type: "warning",
    icon: AlertTriangle,
    title: "Shopping spending is high",
    description:
      "Shopping accounts for 25% of your expenses this month. You're close to reaching your shopping budget.",
    action: "Review spending",
  },
  {
    id: 3,
    type: "saving",
    icon: PiggyBank,
    title: "You could save more",
    description:
      "Based on your recent spending pattern, reducing discretionary expenses by ₹2,000 could increase your savings rate to over 28%.",
    action: "View plan",
  },
];

const recommendations = [
  {
    icon: Target,
    title: "Set a shopping limit",
    text: "Create a ₹8,000 monthly shopping budget to keep discretionary spending under control.",
  },
  {
    icon: PiggyBank,
    title: "Increase your savings",
    text: "Automatically move ₹3,000 into savings after your monthly income arrives.",
  },
  {
    icon: TrendingDown,
    title: "Reduce food delivery",
    text: "Cooking two additional meals at home each week could save approximately ₹1,500 per month.",
  },
];

const spendingData = [
  { category: "Shopping", amount: 9270, change: 14 },
  { category: "Groceries", amount: 8450, change: -5 },
  { category: "Bills", amount: 7560, change: 3 },
  { category: "Dining", amount: 6240, change: -12 },
];

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

export default function AIInsights() {
  const [activeInsight, setActiveInsight] = useState<number | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [message, setMessage] = useState("");

  const refreshInsights = () => {
    setIsRefreshing(true);

    setTimeout(() => {
      setIsRefreshing(false);
    }, 1200);
  };

  const handleAction = (title: string) => {
    setMessage(title);

    setTimeout(() => {
      setMessage("");
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 dark:bg-slate-950 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="mb-1 flex items-center gap-2 text-sm font-medium text-emerald-600 dark:text-emerald-400">
              <Sparkles size={16} />
              AI-Powered Finance
            </div>

            <h1 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
              AI Insights
            </h1>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Smart recommendations based on your financial activity.
            </p>
          </div>

          <button
            onClick={refreshInsights}
            disabled={isRefreshing}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-emerald-300 hover:text-emerald-600 disabled:cursor-not-allowed dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-emerald-500"
          >
            <RefreshCw
              size={17}
              className={isRefreshing ? "animate-spin" : ""}
            />
            {isRefreshing ? "Analyzing..." : "Refresh Insights"}
          </button>
        </div>

        {/* AI hero */}
        <div className="relative overflow-hidden rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-slate-50 p-6 shadow-sm dark:border-emerald-500/20 dark:from-emerald-500/10 dark:via-slate-900 dark:to-slate-900 sm:p-8">
          <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-emerald-400/10 blur-2xl" />
          <div className="absolute -bottom-20 left-1/3 h-48 w-48 rounded-full bg-emerald-400/10 blur-3xl" />

          <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/20">
                <Brain size={28} />
              </div>

              <div>
                <div className="mb-1 flex items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    Vision AI
                  </span>

                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                    ACTIVE
                  </span>
                </div>

                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  Your finances look healthy
                </h2>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
                  You've reduced your overall spending while improving your
                  savings rate. The main area to watch is discretionary
                  shopping.
                </p>
              </div>
            </div>

            <div className="shrink-0 rounded-2xl border border-emerald-200 bg-white/70 p-5 text-center backdrop-blur dark:border-emerald-500/20 dark:bg-slate-900/70">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Financial Health
              </p>

              <p className="mt-1 text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                82
              </p>

              <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                Excellent
              </p>
            </div>
          </div>
        </div>

        {/* Quick metrics */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Metric
            title="Spending Trend"
            value="-8.2%"
            subtitle="vs last month"
            icon={<TrendingDown size={20} />}
            positive
          />

          <Metric
            title="Savings Rate"
            value="24.8%"
            subtitle="of your income"
            icon={<PiggyBank size={20} />}
            positive
          />

          <Metric
            title="Budget Usage"
            value="68%"
            subtitle="monthly budget used"
            icon={<Target size={20} />}
          />

          <Metric
            title="Potential Savings"
            value="₹3,500"
            subtitle="estimated monthly"
            icon={<Sparkles size={20} />}
            positive
          />
        </div>

        {/* Insights */}
        <div className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-200 p-5 dark:border-slate-800 sm:p-6">
              <div>
                <h2 className="font-semibold text-slate-900 dark:text-white">
                  Personalized Insights
                </h2>

                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  AI-generated observations from your spending.
                </p>
              </div>

              <Bot
                size={22}
                className="text-emerald-500"
              />
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {insights.map((item) => {
                const Icon = item.icon;
                const expanded = activeInsight === item.id;

                return (
                  <div key={item.id} className="p-5 sm:p-6">
                    <div className="flex gap-4">
                      <div
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                          item.type === "warning"
                            ? "bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400"
                            : item.type === "saving"
                            ? "bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"
                            : "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
                        }`}
                      >
                        <Icon size={21} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-start">
                          <div>
                            <h3 className="font-semibold text-slate-900 dark:text-white">
                              {item.title}
                            </h3>

                            <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
                              {item.description}
                            </p>
                          </div>

                          <button
                            onClick={() =>
                              setActiveInsight(expanded ? null : item.id)
                            }
                            className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
                          >
                            {item.action}
                            <ChevronRight
                              size={16}
                              className={`transition-transform ${
                                expanded ? "rotate-90" : ""
                              }`}
                            />
                          </button>
                        </div>

                        {expanded && (
                          <div className="mt-4 rounded-xl bg-slate-50 p-4 dark:bg-slate-800/60">
                            <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
                              Based on your current financial pattern, this
                              area is worth monitoring over the next few
                              weeks. Small consistent changes can have a
                              meaningful impact on your monthly savings.
                            </p>

                            <button
                              onClick={() => handleAction(item.title)}
                              className="mt-3 rounded-lg bg-emerald-500 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-600"
                            >
                              Take Action
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Spending watchlist */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="border-b border-slate-200 p-5 dark:border-slate-800 sm:p-6">
              <h2 className="font-semibold text-slate-900 dark:text-white">
                Spending Watchlist
              </h2>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Categories AI thinks you should monitor.
              </p>
            </div>

            <div className="space-y-1 p-3">
              {spendingData.map((item) => {
                const increased = item.change > 0;

                return (
                  <div
                    key={item.category}
                    className="flex items-center gap-3 rounded-xl p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-sm dark:bg-slate-800">
                      {getIcon(item.category)}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        {item.category}
                      </p>

                      <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                        {formatCurrency(item.amount)}
                      </p>
                    </div>

                    <div
                      className={`flex items-center gap-1 text-xs font-semibold ${
                        increased
                          ? "text-red-500"
                          : "text-emerald-600 dark:text-emerald-400"
                      }`}
                    >
                      {increased ? (
                        <ArrowUpRight size={14} />
                      ) : (
                        <ArrowDownRight size={14} />
                      )}
                      {Math.abs(item.change)}%
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="m-5 rounded-xl border border-amber-100 bg-amber-50 p-4 dark:border-amber-500/20 dark:bg-amber-500/5">
              <div className="flex gap-3">
                <AlertTriangle className="shrink-0 text-amber-500" size={18} />

                <p className="text-xs leading-5 text-amber-800 dark:text-amber-300">
                  Shopping is currently your fastest-growing discretionary
                  category.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="border-b border-slate-200 p-5 dark:border-slate-800 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                <Lightbulb size={20} />
              </div>

              <div>
                <h2 className="font-semibold text-slate-900 dark:text-white">
                  Recommended Actions
                </h2>

                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Simple steps that could improve your finances.
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 p-5 md:grid-cols-3 sm:p-6">
            {recommendations.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="rounded-2xl border border-slate-200 p-5 transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-sm dark:border-slate-800 dark:hover:border-emerald-500/30"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    <Icon size={19} />
                  </div>

                  <h3 className="mt-4 font-semibold text-slate-900 dark:text-white">
                    {item.title}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                    {item.text}
                  </p>

                  <button
                    onClick={() => handleAction(item.title)}
                    className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-emerald-600 dark:text-emerald-400"
                  >
                    Apply recommendation
                    <ChevronRight size={15} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* AI assistant */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500 text-white">
              <MessageCircle size={22} />
            </div>

            <div className="flex-1">
              <h2 className="font-semibold text-slate-900 dark:text-white">
                Ask Vision AI
              </h2>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Ask questions about your spending, budgets, savings, or
                financial goals.
              </p>
            </div>

            <button
              onClick={() => handleAction("AI Assistant")}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-600"
            >
              Start Conversation
              <ChevronRight size={17} />
            </button>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="flex gap-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <CheckCircle2
            size={18}
            className="mt-0.5 shrink-0 text-slate-400"
          />

          <p className="text-xs leading-5 text-slate-500 dark:text-slate-400">
            AI insights are generated from your financial activity and are
            intended for informational purposes. They are not professional
            financial advice.
          </p>
        </div>
      </div>

      {/* Action toast */}
      {message && (
        <div className="fixed bottom-5 right-5 z-50 flex max-w-sm items-center gap-3 rounded-xl border border-emerald-200 bg-white px-4 py-3 shadow-xl dark:border-emerald-500/20 dark:bg-slate-900">
          <CheckCircle2
            size={19}
            className="shrink-0 text-emerald-500"
          />

          <p className="flex-1 text-sm font-medium text-slate-700 dark:text-slate-200">
            {message} selected
          </p>

          <button
            onClick={() => setMessage("")}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
}

function Metric({
  title,
  value,
  subtitle,
  icon,
  positive = false,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
  positive?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            {title}
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
            {value}
          </p>

          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {subtitle}
          </p>
        </div>

        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${
            positive
              ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
              : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
          }`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

function getIcon(category: string) {
  switch (category) {
    case "Shopping":
      return "🛍️";
    case "Groceries":
      return "🛒";
    case "Bills":
      return "💡";
    case "Dining":
      return "🍽️";
    default:
      return "💰";
  }
}