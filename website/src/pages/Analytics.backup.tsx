import {
  ArrowDownRight,
  ArrowUpRight,
  CalendarDays,
  ChevronDown,
  CreditCard,
  PieChart,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";

const categories = [
  { name: "Groceries", amount: 8450, percentage: 28, icon: "🛒" },
  { name: "Food & Dining", amount: 6240, percentage: 21, icon: "🍽️" },
  { name: "Shopping", amount: 9270, percentage: 19, icon: "🛍️" },
  { name: "Bills & Utilities", amount: 7560, percentage: 16, icon: "💡" },
  { name: "Transport", amount: 3180, percentage: 10, icon: "🚗" },
  { name: "Entertainment", amount: 2140, percentage: 6, icon: "🎬" },
];

const weeklySpending = [
  { day: "Mon", amount: 4200 },
  { day: "Tue", amount: 6800 },
  { day: "Wed", amount: 5100 },
  { day: "Thu", amount: 8200 },
  { day: "Fri", amount: 7400 },
  { day: "Sat", amount: 9600 },
  { day: "Sun", amount: 5300 },
];

const monthlyData = [
  { month: "Apr", amount: 38200 },
  { month: "May", amount: 42100 },
  { month: "Jun", amount: 39700 },
  { month: "Jul", amount: 45600 },
  { month: "Aug", amount: 41300 },
  { month: "Sep", amount: 36840 },
];

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

export default function Analytics() {
  const maxWeekly = Math.max(...weeklySpending.map((item) => item.amount));
  const maxMonthly = Math.max(...monthlyData.map((item) => item.amount));

  return (
    <div className="min-h-screen bg-slate-50 p-4 dark:bg-slate-950 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="mb-1 text-sm font-medium text-emerald-600 dark:text-emerald-400">
              Financial Intelligence
            </p>

            <h1 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
              Analytics
            </h1>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Understand where your money goes and discover spending trends.
            </p>
          </div>

          <button className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
            <CalendarDays size={17} />
            September 2026
            <ChevronDown size={16} />
          </button>
        </div>

        {/* KPI cards */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            title="Total Spending"
            value="₹36,840"
            subtitle="This month"
            icon={<Wallet size={20} />}
            iconClass="bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
            trend="-8.2%"
            trendUp={false}
          />

          <MetricCard
            title="Daily Average"
            value="₹1,228"
            subtitle="Average per day"
            icon={<TrendingDown size={20} />}
            iconClass="bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"
            trend="-5.4%"
            trendUp={false}
          />

          <MetricCard
            title="Transactions"
            value="42"
            subtitle="This month"
            icon={<CreditCard size={20} />}
            iconClass="bg-violet-100 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400"
            trend="+6.1%"
            trendUp={true}
          />

          <MetricCard
            title="Savings Rate"
            value="24.8%"
            subtitle="Of total income"
            icon={<PieChart size={20} />}
            iconClass="bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400"
            trend="+3.2%"
            trendUp={true}
          />
        </div>

        {/* Main charts */}
        <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
          {/* Weekly spending */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-slate-900 dark:text-white">
                  Weekly Spending
                </h2>

                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Spending activity over the last 7 days
                </p>
              </div>

              <TrendingUp
                size={20}
                className="text-emerald-500"
              />
            </div>

            <div className="flex h-64 items-end justify-between gap-2 sm:gap-4">
              {weeklySpending.map((item) => {
                const height = (item.amount / maxWeekly) * 100;

                return (
                  <div
                    key={item.day}
                    className="flex h-full flex-1 flex-col items-center justify-end gap-2"
                  >
                    <span className="hidden text-xs font-medium text-slate-500 dark:text-slate-400 sm:block">
                      ₹{Math.round(item.amount / 1000)}k
                    </span>

                    <div className="flex h-full w-full items-end">
                      <div
                        className="w-full rounded-t-lg bg-emerald-500 transition-all hover:bg-emerald-400"
                        style={{ height: `${height}%` }}
                      />
                    </div>

                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {item.day}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Category breakdown */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
            <div className="mb-5">
              <h2 className="font-semibold text-slate-900 dark:text-white">
                Spending by Category
              </h2>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Where your money is going
              </p>
            </div>

            <div className="space-y-5">
              {categories.map((category) => (
                <div key={category.name}>
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{category.icon}</span>

                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        {category.name}
                      </span>
                    </div>

                    <span className="text-sm font-semibold text-slate-900 dark:text-white">
                      {formatCurrency(category.amount)}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                      <div
                        className="h-full rounded-full bg-emerald-500"
                        style={{
                          width: `${category.percentage * 3.2}%`,
                        }}
                      />
                    </div>

                    <span className="w-8 text-right text-xs text-slate-500">
                      {category.percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Monthly trend */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-slate-900 dark:text-white">
                Monthly Spending Trend
              </h2>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Compare your spending across recent months
              </p>
            </div>

            <div className="hidden items-center gap-2 text-sm text-slate-500 sm:flex">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
              Spending
            </div>
          </div>

          <div className="flex h-72 items-end gap-3 sm:gap-6">
            {monthlyData.map((item) => {
              const height = (item.amount / maxMonthly) * 100;
              const isCurrent = item.month === "Sep";

              return (
                <div
                  key={item.month}
                  className="flex h-full flex-1 flex-col items-center justify-end gap-3"
                >
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    ₹{Math.round(item.amount / 1000)}k
                  </span>

                  <div className="flex h-full w-full max-w-16 items-end">
                    <div
                      className={`w-full rounded-t-xl transition-all ${
                        isCurrent
                          ? "bg-emerald-500"
                          : "bg-slate-200 dark:bg-slate-700"
                      }`}
                      style={{ height: `${height}%` }}
                    />
                  </div>

                  <span
                    className={`text-xs font-medium ${
                      isCurrent
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-slate-500 dark:text-slate-400"
                    }`}
                  >
                    {item.month}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Insights */}
        <div className="grid gap-6 md:grid-cols-3">
          <InsightCard
            icon={<TrendingDown size={20} />}
            title="Spending decreased"
            text="Your spending is 8.2% lower than last month. Keep up the good work."
          />

          <InsightCard
            icon={<ArrowDownRight size={20} />}
            title="Shopping is high"
            text="Shopping accounts for 19% of your monthly spending. Consider setting a tighter budget."
          />

          <InsightCard
            icon={<ArrowUpRight size={20} />}
            title="Savings improved"
            text="Your savings rate increased by 3.2% compared with last month."
          />
        </div>

        {/* Bottom summary */}
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 dark:border-emerald-500/20 dark:bg-emerald-500/5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
              <PieChart size={23} />
            </div>

            <div>
              <h3 className="font-semibold text-emerald-900 dark:text-emerald-300">
                Your finances are trending in the right direction
              </h3>

              <p className="mt-1 text-sm text-emerald-800/80 dark:text-emerald-300/70">
                You spent less this month while improving your savings rate.
                Continue monitoring your largest spending categories.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  title,
  value,
  subtitle,
  icon,
  iconClass,
  trend,
  trendUp,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
  iconClass: string;
  trend: string;
  trendUp: boolean;
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
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconClass}`}
        >
          {icon}
        </div>
      </div>

      <div className="mt-4 flex items-center gap-1.5 text-xs">
        {trendUp ? (
          <ArrowUpRight size={14} className="text-emerald-500" />
        ) : (
          <ArrowDownRight size={14} className="text-emerald-500" />
        )}

        <span className="font-semibold text-emerald-600 dark:text-emerald-400">
          {trend}
        </span>

        <span className="text-slate-400">vs last month</span>
      </div>
    </div>
  );
}

function InsightCard({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
        {icon}
      </div>

      <h3 className="font-semibold text-slate-900 dark:text-white">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
        {text}
      </p>
    </div>
  );
}