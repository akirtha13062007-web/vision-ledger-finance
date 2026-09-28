import { useState } from "react";
import {
  BarChart3,
  CalendarDays,
  ChevronDown,
  Download,
  FileText,
  PieChart,
  Receipt,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

const monthlyData = [
  { month: "Apr", income: 52000, expenses: 38200 },
  { month: "May", income: 54000, expenses: 42100 },
  { month: "Jun", income: 55000, expenses: 39700 },
  { month: "Jul", income: 58000, expenses: 45600 },
  { month: "Aug", income: 60000, expenses: 41300 },
  { month: "Sep", income: 62000, expenses: 36840 },
];

const categoryData = [
  { name: "Groceries", amount: 8450, percent: 23 },
  { name: "Shopping", amount: 9270, percent: 25 },
  { name: "Bills & Utilities", amount: 7560, percent: 21 },
  { name: "Food & Dining", amount: 6240, percent: 17 },
  { name: "Transport", amount: 3180, percent: 9 },
  { name: "Entertainment", amount: 2140, percent: 5 },
];

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

export default function Reports() {
  const [period, setPeriod] = useState("September 2026");
  const [showPeriodMenu, setShowPeriodMenu] = useState(false);
  const [exported, setExported] = useState(false);

  const totalIncome = 62000;
  const totalExpenses = 36840;
  const savings = totalIncome - totalExpenses;
  const savingsRate = Math.round((savings / totalIncome) * 100);

  const handleExport = () => {
    setExported(true);

    setTimeout(() => {
      setExported(false);
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 dark:bg-slate-950 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="mb-1 text-sm font-medium text-emerald-600 dark:text-emerald-400">
              Financial Overview
            </p>

            <h1 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
              Reports
            </h1>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Review your income, expenses, savings, and financial activity.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            {/* Period selector */}
            <div className="relative">
              <button
                onClick={() => setShowPeriodMenu(!showPeriodMenu)}
                className="flex w-full items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 sm:w-auto"
              >
                <CalendarDays size={17} className="text-emerald-500" />
                {period}
                <ChevronDown size={16} />
              </button>

              {showPeriodMenu && (
                <div className="absolute right-0 z-20 mt-2 w-full min-w-48 overflow-hidden rounded-xl border border-slate-200 bg-white p-1 shadow-xl dark:border-slate-800 dark:bg-slate-900">
                  {[
                    "September 2026",
                    "August 2026",
                    "July 2026",
                    "Last 6 Months",
                  ].map((item) => (
                    <button
                      key={item}
                      onClick={() => {
                        setPeriod(item);
                        setShowPeriodMenu(false);
                      }}
                      className="w-full rounded-lg px-3 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Export */}
            <button
              onClick={handleExport}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-600"
            >
              <Download size={17} />
              {exported ? "Exported!" : "Export Report"}
            </button>
          </div>
        </div>

        {/* Report cards */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <ReportCard
            title="Total Income"
            value={formatCurrency(totalIncome)}
            subtitle="This month"
            icon={<TrendingUp size={20} />}
            iconClass="bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
            trend="+7.4%"
          />

          <ReportCard
            title="Total Expenses"
            value={formatCurrency(totalExpenses)}
            subtitle="This month"
            icon={<TrendingDown size={20} />}
            iconClass="bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-400"
            trend="-8.2%"
          />

          <ReportCard
            title="Net Savings"
            value={formatCurrency(savings)}
            subtitle="Income minus expenses"
            icon={<BarChart3 size={20} />}
            iconClass="bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"
            trend="+18.6%"
          />

          <ReportCard
            title="Savings Rate"
            value={`${savingsRate}%`}
            subtitle="Of total income"
            icon={<PieChart size={20} />}
            iconClass="bg-violet-100 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400"
            trend="+3.2%"
          />
        </div>

        {/* Income vs Expenses */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
          <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h2 className="font-semibold text-slate-900 dark:text-white">
                Income vs Expenses
              </h2>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Compare your income and spending over time.
              </p>
            </div>

            <div className="flex items-center gap-5 text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                Income
              </span>

              <span className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-slate-300 dark:bg-slate-600" />
                Expenses
              </span>
            </div>
          </div>

          <div className="flex h-72 items-end gap-3 sm:gap-6">
            {monthlyData.map((item) => {
              const maxValue = 65000;
              const incomeHeight = (item.income / maxValue) * 100;
              const expenseHeight = (item.expenses / maxValue) * 100;

              return (
                <div
                  key={item.month}
                  className="flex h-full flex-1 flex-col items-center justify-end gap-3"
                >
                  <div className="flex h-full w-full max-w-20 items-end justify-center gap-1 sm:gap-2">
                    <div
                      className="w-1/2 rounded-t-lg bg-emerald-500 transition-all hover:bg-emerald-400"
                      style={{ height: `${incomeHeight}%` }}
                      title={`Income: ${formatCurrency(item.income)}`}
                    />

                    <div
                      className="w-1/2 rounded-t-lg bg-slate-200 dark:bg-slate-700"
                      style={{ height: `${expenseHeight}%` }}
                      title={`Expenses: ${formatCurrency(item.expenses)}`}
                    />
                  </div>

                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    {item.month}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Two-column section */}
        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          {/* Category report */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="border-b border-slate-200 p-5 dark:border-slate-800 sm:p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                  <PieChart size={20} />
                </div>

                <div>
                  <h2 className="font-semibold text-slate-900 dark:text-white">
                    Expense Breakdown
                  </h2>

                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Spending by category
                  </p>
                </div>
              </div>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {categoryData.map((item) => (
                <div
                  key={item.name}
                  className="flex items-center gap-4 p-4 sm:p-5"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-lg dark:bg-slate-800">
                    {getCategoryIcon(item.name)}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <span className="truncate text-sm font-medium text-slate-700 dark:text-slate-300">
                        {item.name}
                      </span>

                      <span className="text-sm font-semibold text-slate-900 dark:text-white">
                        {formatCurrency(item.amount)}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                        <div
                          className="h-full rounded-full bg-emerald-500"
                          style={{ width: `${item.percent * 4}%` }}
                        />
                      </div>

                      <span className="w-8 text-right text-xs text-slate-500">
                        {item.percent}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Financial summary */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="border-b border-slate-200 p-5 dark:border-slate-800 sm:p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                  <FileText size={20} />
                </div>

                <div>
                  <h2 className="font-semibold text-slate-900 dark:text-white">
                    Financial Summary
                  </h2>

                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    September overview
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-5 p-5 sm:p-6">
              <SummaryRow
                label="Income"
                value={formatCurrency(totalIncome)}
                positive
              />

              <SummaryRow
                label="Expenses"
                value={formatCurrency(totalExpenses)}
              />

              <SummaryRow
                label="Net Savings"
                value={formatCurrency(savings)}
                positive
              />

              <div className="border-t border-slate-100 pt-5 dark:border-slate-800">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    Savings progress
                  </span>

                  <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                    {savingsRate}%
                  </span>
                </div>

                <div className="h-3 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div
                    className="h-full rounded-full bg-emerald-500"
                    style={{ width: `${savingsRate}%` }}
                  />
                </div>
              </div>

              <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800/60">
                <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
                  You saved{" "}
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(savings)}
                  </span>{" "}
                  this month. That's a healthy{" "}
                  <span className="font-semibold">{savingsRate}%</span> of
                  your income.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent activity */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-col justify-between gap-3 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:p-6 dark:border-slate-800">
            <div>
              <h2 className="font-semibold text-slate-900 dark:text-white">
                Report Activity
              </h2>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Recently recorded financial activity.
              </p>
            </div>

            <button className="inline-flex items-center gap-2 self-start rounded-lg px-3 py-2 text-sm font-medium text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-500/10">
              View Transactions
            </button>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            <ActivityRow
              title="Fresh Mart"
              category="Groceries"
              amount="-₹1,249"
              date="Sep 2, 2026"
            />

            <ActivityRow
              title="Uber"
              category="Transport"
              amount="-₹420"
              date="Sep 2, 2026"
            />

            <ActivityRow
              title="Monthly Salary"
              category="Income"
              amount="+₹62,000"
              date="Sep 1, 2026"
              income
            />

            <ActivityRow
              title="Netflix"
              category="Entertainment"
              amount="-₹649"
              date="Sep 1, 2026"
            />
          </div>
        </div>

        {/* Footer insight */}
        <div className="flex gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 p-5 dark:border-emerald-500/20 dark:bg-emerald-500/5 sm:p-6">
          <Receipt className="mt-0.5 shrink-0 text-emerald-600 dark:text-emerald-400" />

          <div>
            <h3 className="font-semibold text-emerald-900 dark:text-emerald-300">
              Report insight
            </h3>

            <p className="mt-1 text-sm leading-6 text-emerald-800/80 dark:text-emerald-300/70">
              Your expenses are currently below your income by{" "}
              <strong>{formatCurrency(savings)}</strong>. Keeping this trend
              consistent can significantly improve your monthly savings.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReportCard({
  title,
  value,
  subtitle,
  icon,
  iconClass,
  trend,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
  iconClass: string;
  trend: string;
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

      <div className="mt-4 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
        {trend} vs last month
      </div>
    </div>
  );
}

function SummaryRow({
  label,
  value,
  positive = false,
}: {
  label: string;
  value: string;
  positive?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-slate-500 dark:text-slate-400">
        {label}
      </span>

      <span
        className={`text-sm font-semibold ${
          positive
            ? "text-emerald-600 dark:text-emerald-400"
            : "text-slate-900 dark:text-white"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function ActivityRow({
  title,
  category,
  amount,
  date,
  income = false,
}: {
  title: string;
  category: string;
  amount: string;
  date: string;
  income?: boolean;
}) {
  return (
    <div className="flex items-center gap-4 p-4 sm:p-5">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300">
        <Receipt size={18} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
          {title}
        </p>

        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          {category} • {date}
        </p>
      </div>

      <span
        className={`text-sm font-semibold ${
          income
            ? "text-emerald-600 dark:text-emerald-400"
            : "text-slate-900 dark:text-white"
        }`}
      >
        {amount}
      </span>
    </div>
  );
}

function getCategoryIcon(category: string) {
  switch (category) {
    case "Groceries":
      return "🛒";
    case "Shopping":
      return "🛍️";
    case "Bills & Utilities":
      return "💡";
    case "Food & Dining":
      return "🍽️";
    case "Transport":
      return "🚗";
    case "Entertainment":
      return "🎬";
    default:
      return "💰";
  }
}