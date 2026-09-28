import { useEffect, useMemo, useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  CalendarDays,
  CreditCard,
  PieChart,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

type Transaction = {
  id: string;
  amount: number;
  description?: string | null;
  date: string;
  type: "INCOME" | "EXPENSE";
  categoryId: string;
  category?: {
    id: string;
    name: string;
    type: string;
  };
};

type Category = {
  id: string;
  name: string;
  type: string;
};

const categoryIcons: Record<string, string> = {
  Food: "🍽️",
  Grocery: "🛒",
  Shopping: "🛍️",
  Bills: "💡",
  Rent: "🏠",
  Fuel: "🚗",
  Travel: "✈️",
  Entertainment: "🎬",
  Medical: "🏥",
  Education: "📚",
  Subscriptions: "📱",
  Business: "💼",
  Investment: "📈",
  Other: "📦",
};

const formatCurrency = (amount: number) =>
  `₹${Math.round(amount).toLocaleString("en-IN")}`;

export default function Analytics() {
  const now = new Date();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setLoading(true);

        const [transactionsResponse, categoriesResponse] =
          await Promise.all([
            fetch("http://localhost:5000/api/transactions"),
            fetch("http://localhost:5000/api/categories"),
          ]);

        const transactionsData = await transactionsResponse.json();
        const categoriesData = await categoriesResponse.json();

        if (transactionsData.success) {
          setTransactions(transactionsData.data || []);
        }

        if (categoriesData.success) {
          setCategories(categoriesData.data || []);
        }
      } catch (error) {
        console.error("Failed to load analytics:", error);
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, []);

  const expenseTransactions = useMemo(
    () => transactions.filter((transaction) => transaction.type === "EXPENSE"),
    [transactions]
  );

  const incomeTransactions = useMemo(
    () => transactions.filter((transaction) => transaction.type === "INCOME"),
    [transactions]
  );

  /*
   * Selected month transactions
   */
  const selectedMonthExpenses = useMemo(
    () =>
      expenseTransactions.filter((transaction) => {
        const date = new Date(transaction.date);

        return (
          date.getMonth() === selectedMonth &&
          date.getFullYear() === selectedYear
        );
      }),
    [expenseTransactions, selectedMonth, selectedYear]
  );

  const selectedMonthIncome = useMemo(
    () =>
      incomeTransactions.filter((transaction) => {
        const date = new Date(transaction.date);

        return (
          date.getMonth() === selectedMonth &&
          date.getFullYear() === selectedYear
        );
      }),
    [incomeTransactions, selectedMonth, selectedYear]
  );

  /*
   * Main calculations
   */
  const totalSpending = selectedMonthExpenses.reduce(
    (sum, transaction) => sum + Number(transaction.amount),
    0
  );

  const totalIncome = selectedMonthIncome.reduce(
    (sum, transaction) => sum + Number(transaction.amount),
    0
  );

  const daysInSelectedMonth = new Date(
    selectedYear,
    selectedMonth + 1,
    0
  ).getDate();

  const isCurrentMonth =
    selectedMonth === now.getMonth() &&
    selectedYear === now.getFullYear();

  const daysElapsed = isCurrentMonth
    ? Math.max(now.getDate(), 1)
    : daysInSelectedMonth;

  const dailyAverage =
    daysElapsed > 0 ? totalSpending / daysElapsed : 0;

  const transactionCount = selectedMonthExpenses.length;

  const savingsRate =
    totalIncome > 0
      ? Math.max(
          0,
          ((totalIncome - totalSpending) / totalIncome) * 100
        )
      : 0;

  /*
   * Category spending
   */
  const categorySpending = useMemo(() => {
    const categoryMap = new Map<string, number>();

    selectedMonthExpenses.forEach((transaction) => {
      const current = categoryMap.get(transaction.categoryId) || 0;

      categoryMap.set(
        transaction.categoryId,
        current + Number(transaction.amount)
      );
    });

    return categories
      .map((category) => ({
        id: category.id,
        name: category.name,
        amount: categoryMap.get(category.id) || 0,
        percentage:
          totalSpending > 0
            ? ((categoryMap.get(category.id) || 0) / totalSpending) * 100
            : 0,
        icon: categoryIcons[category.name] || "📦",
      }))
      .filter((category) => category.amount > 0)
      .sort((a, b) => b.amount - a.amount);
  }, [categories, selectedMonthExpenses, totalSpending]);

  /*
   * Last 7 days of selected month
   */
  const weeklySpending = useMemo(() => {
    const result: { day: string; amount: number }[] = [];

    const lastDay = isCurrentMonth
      ? now.getDate()
      : daysInSelectedMonth;

    for (let i = 6; i >= 0; i--) {
      const dayNumber = lastDay - i;

      if (dayNumber < 1) {
        continue;
      }

      const date = new Date(
        selectedYear,
        selectedMonth,
        dayNumber
      );

      const amount = expenseTransactions
        .filter((transaction) => {
          const transactionDate = new Date(transaction.date);

          return (
            transactionDate.getFullYear() === selectedYear &&
            transactionDate.getMonth() === selectedMonth &&
            transactionDate.getDate() === dayNumber
          );
        })
        .reduce(
          (sum, transaction) => sum + Number(transaction.amount),
          0
        );

      result.push({
        day: date.toLocaleDateString("en-IN", {
          weekday: "short",
        }),
        amount,
      });
    }

    return result;
  }, [
    expenseTransactions,
    selectedMonth,
    selectedYear,
    isCurrentMonth,
    daysInSelectedMonth,
  ]);

  /*
   * Six-month trend ending at selected month
   */
  const monthlyData = useMemo(() => {
    const result: {
      month: string;
      amount: number;
      isCurrent: boolean;
    }[] = [];

    for (let i = 5; i >= 0; i--) {
      const date = new Date(
        selectedYear,
        selectedMonth - i,
        1
      );

      const month = date.getMonth();
      const year = date.getFullYear();

      const amount = expenseTransactions
        .filter((transaction) => {
          const transactionDate = new Date(transaction.date);

          return (
            transactionDate.getMonth() === month &&
            transactionDate.getFullYear() === year
          );
        })
        .reduce(
          (sum, transaction) => sum + Number(transaction.amount),
          0
        );

      result.push({
        month: date.toLocaleDateString("en-IN", {
          month: "short",
        }),
        amount,
        isCurrent: true,
      });
    }

    return result;
  }, [
    expenseTransactions,
    selectedMonth,
    selectedYear,
  ]);

  const maxWeekly = Math.max(
    ...weeklySpending.map((item) => item.amount),
    1
  );

  const maxMonthly = Math.max(
    ...monthlyData.map((item) => item.amount),
    1
  );

  /*
   * Previous month comparison
   */
  const previousMonthDate = new Date(
    selectedYear,
    selectedMonth - 1,
    1
  );

  const previousMonthSpending = expenseTransactions
    .filter((transaction) => {
      const date = new Date(transaction.date);

      return (
        date.getMonth() === previousMonthDate.getMonth() &&
        date.getFullYear() === previousMonthDate.getFullYear()
      );
    })
    .reduce(
      (sum, transaction) => sum + Number(transaction.amount),
      0
    );

  const spendingChange =
    previousMonthSpending > 0
      ? ((totalSpending - previousMonthSpending) /
          previousMonthSpending) *
        100
      : 0;

  /*
   * Insights
   */
  const insights = useMemo(() => {
    const result: {
      title: string;
      description: string;
      type: "positive" | "warning" | "info";
    }[] = [];

    if (categorySpending.length > 0) {
      const highestCategory = categorySpending[0];

      result.push({
        title: "Highest spending category",
        description: `${highestCategory.name} accounts for ${highestCategory.percentage.toFixed(
          0
        )}% of your spending this month.`,
        type: "info",
      });
    }

    if (previousMonthSpending > 0) {
      if (totalSpending > previousMonthSpending) {
        result.push({
          title: "Spending increased",
          description: `Your spending is ${Math.abs(
            spendingChange
          ).toFixed(
            0
          )}% higher than the previous month.`,
          type: "warning",
        });
      } else if (totalSpending < previousMonthSpending) {
        result.push({
          title: "Spending decreased",
          description: `Your spending is ${Math.abs(
            spendingChange
          ).toFixed(
            0
          )}% lower than the previous month.`,
          type: "positive",
        });
      }
    }

    if (totalIncome > 0) {
      if (savingsRate >= 30) {
        result.push({
          title: "Healthy savings",
          description: `You saved approximately ${savingsRate.toFixed(
            1
          )}% of your income this month.`,
          type: "positive",
        });
      } else {
        result.push({
          title: "Savings opportunity",
          description: `Your current savings rate is ${savingsRate.toFixed(
            1
          )}%.`,
          type: "info",
        });
      }
    } else {
      result.push({
        title: "Add income",
        description:
          "Add income transactions to see your savings analysis.",
        type: "info",
      });
    }

    return result;
  }, [
    categorySpending,
    previousMonthSpending,
    totalSpending,
    spendingChange,
    totalIncome,
    savingsRate,
  ]);

  const selectedDate = new Date(
    selectedYear,
    selectedMonth,
    1
  );

  const monthName = selectedDate.toLocaleDateString("en-IN", {
    month: "long",
  });

  /*
   * Month selector
   * Shows the last 24 months, including 2025 data.
   */
  const availableMonths = useMemo(() => {
    return Array.from({ length: 24 }, (_, index) => {
      const date = new Date(
        now.getFullYear(),
        now.getMonth() - index,
        1
      );

      return {
        month: date.getMonth(),
        year: date.getFullYear(),
        label: date.toLocaleDateString("en-IN", {
          month: "long",
          year: "numeric",
        }),
        value: `${date.getFullYear()}-${date.getMonth()}`,
      };
    });
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-sm text-slate-500 dark:text-slate-400">
          Loading analytics...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Analytics
          </h1>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Understand your spending and financial patterns.
          </p>
        </div>

        {/* Functional month selector */}
        <div className="relative">
          <CalendarDays
            size={17}
            className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-slate-500"
          />

          <select
            value={`${selectedYear}-${selectedMonth}`}
            onChange={(event) => {
              const [year, month] = event.target.value
                .split("-")
                .map(Number);

              setSelectedYear(year);
              setSelectedMonth(month);
            }}
            className="cursor-pointer appearance-none rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-10 text-sm font-medium text-slate-700 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
          >
            {availableMonths.map((item) => (
              <option
                key={item.value}
                value={item.value}
              >
                {item.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Selected month indicator */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Showing analytics for
        </p>

        <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">
          {monthName} {selectedYear}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Total Spending"
          value={formatCurrency(totalSpending)}
          subtitle="Expenses this month"
          icon={<CreditCard size={20} />}
        />

        <MetricCard
          title="Daily Average"
          value={formatCurrency(dailyAverage)}
          subtitle="Average per day"
          icon={<TrendingUp size={20} />}
        />

        <MetricCard
          title="Transactions"
          value={transactionCount.toString()}
          subtitle="Expenses this month"
          icon={<PieChart size={20} />}
        />

        <MetricCard
          title="Savings Rate"
          value={`${savingsRate.toFixed(1)}%`}
          subtitle="Based on income"
          icon={<TrendingUp size={20} />}
        />
      </div>

      {/* Weekly Spending */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Weekly Spending
            </h2>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Last 7 days of {monthName}
            </p>
          </div>

          <TrendingDown
            size={20}
            className="text-slate-400"
          />
        </div>

        {weeklySpending.length > 0 ? (
          <div className="flex h-56 items-end gap-3">
            {weeklySpending.map((item, index) => {
              const height =
                item.amount > 0
                  ? Math.max(
                      (item.amount / maxWeekly) * 100,
                      5
                    )
                  : 3;

              return (
                <div
                  key={`${item.day}-${index}`}
                  className="flex h-full flex-1 flex-col justify-end"
                >
                  <div className="mb-2 text-center text-xs font-medium text-slate-500 dark:text-slate-400">
                    {item.amount > 0
                      ? formatCurrency(item.amount)
                      : "₹0"}
                  </div>

                  <div
                    className="w-full rounded-t-lg bg-emerald-500 transition-all"
                    style={{
                      height: `${height}%`,
                    }}
                  />

                  <div className="mt-2 text-center text-xs text-slate-500 dark:text-slate-400">
                    {item.day}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-12 text-center text-sm text-slate-500">
            No spending data available.
          </div>
        )}
      </section>

      {/* Category Spending */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Spending by Category
          </h2>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Where your money went in {monthName}.
          </p>
        </div>

        {categorySpending.length > 0 ? (
          <div className="space-y-5">
            {categorySpending.map((category) => (
              <div key={category.id}>
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">
                      {category.icon}
                    </span>

                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">
                        {category.name}
                      </p>

                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {category.percentage.toFixed(0)}%
                      </p>
                    </div>
                  </div>

                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    {formatCurrency(category.amount)}
                  </p>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all"
                    style={{
                      width: `${Math.min(
                        category.percentage,
                        100
                      )}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              No expenses recorded for {monthName}{" "}
              {selectedYear}.
            </p>
          </div>
        )}
      </section>

      {/* Monthly Trend */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Monthly Spending Trend
          </h2>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Six-month spending trend ending in {monthName}{" "}
            {selectedYear}.
          </p>
        </div>

        <div className="flex h-64 items-end gap-4">
          {monthlyData.map((item, index) => {
            const height =
              item.amount > 0
                ? Math.max(
                    (item.amount / maxMonthly) * 100,
                    5
                  )
                : 3;

            const isSelected =
              index === monthlyData.length - 1;

            return (
              <div
                key={`${item.month}-${index}`}
                className="flex h-full flex-1 flex-col justify-end"
              >
                <div className="mb-2 text-center text-xs font-medium text-slate-500 dark:text-slate-400">
                  {item.amount > 0
                    ? formatCurrency(item.amount)
                    : "₹0"}
                </div>

                <div
                  className={`w-full rounded-t-lg transition-all ${
                    isSelected
                      ? "bg-emerald-500"
                      : "bg-slate-300 dark:bg-slate-700"
                  }`}
                  style={{
                    height: `${height}%`,
                  }}
                />

                <div
                  className={`mt-2 text-center text-xs ${
                    isSelected
                      ? "font-semibold text-emerald-600"
                      : "text-slate-500 dark:text-slate-400"
                  }`}
                >
                  {item.month}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Insights */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Insights
          </h2>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Automatically generated from your transactions.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {insights.map((insight, index) => (
            <InsightCard
              key={index}
              title={insight.title}
              description={insight.description}
              type={insight.type}
            />
          ))}
        </div>
      </section>

      {/* Bottom Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Total Income
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
            {formatCurrency(totalIncome)}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Total Spending
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
            {formatCurrency(totalSpending)}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Remaining
          </p>

          <p
            className={`mt-2 text-2xl font-bold ${
              totalIncome - totalSpending >= 0
                ? "text-emerald-600"
                : "text-red-600"
            }`}
          >
            {formatCurrency(
              totalIncome - totalSpending
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

/*
 * Metric Card
 */
function MetricCard({
  title,
  value,
  subtitle,
  icon,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between">
        <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600 dark:bg-emerald-950/40">
          {icon}
        </div>
      </div>

      <p className="mt-5 text-sm text-slate-500 dark:text-slate-400">
        {title}
      </p>

      <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
        {value}
      </p>

      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
        {subtitle}
      </p>
    </div>
  );
}

/*
 * Insight Card
 */
function InsightCard({
  title,
  description,
  type,
}: {
  title: string;
  description: string;
  type: "positive" | "warning" | "info";
}) {
  const Icon =
    type === "positive"
      ? ArrowUpRight
      : type === "warning"
      ? ArrowDownRight
      : TrendingUp;

  const iconClass =
    type === "positive"
      ? "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40"
      : type === "warning"
      ? "text-amber-600 bg-amber-50 dark:bg-amber-950/40"
      : "text-blue-600 bg-blue-50 dark:bg-blue-950/40";

  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
      <div
        className={`mb-4 inline-flex rounded-lg p-2 ${iconClass}`}
      >
        <Icon size={18} />
      </div>

      <h3 className="font-semibold text-slate-900 dark:text-white">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
        {description}
      </p>
    </div>
  );
}