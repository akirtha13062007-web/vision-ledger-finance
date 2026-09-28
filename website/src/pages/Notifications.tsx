import { useEffect, useMemo, useState } from "react";
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  X,
  AlertTriangle,
  Wallet,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  CreditCard,
  Info,
  CircleDollarSign,
  CalendarDays,
} from "lucide-react";

const API_URL = "http://localhost:5000/api";

// Your existing test user.
// Replace this later when login/authentication is connected.
const USER_ID = "cmtkcqppm0000z48sh1aes087";

type NotificationType =
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "income"
  | "expense"
  | "budget";

type Notification = {
  id: string;
  title: string;
  message: string;
  type: NotificationType | string;
  icon?: string | null;
  read: boolean;
  deleted: boolean;
  createdAt: string;
  userId: string;
};

type Transaction = {
  id: string;
  amount: number;
  description?: string | null;
  date: string;
  type: "INCOME" | "EXPENSE";
  userId: string;
  categoryId: string;
};

type Category = {
  id: string;
  name: string;
  type: string;
};

type MonthlyBudget = {
  id: string;
  amount: number;
  month: number;
  year: number;
};

type CategoryBudget = {
  id: string;
  amount: number;
  month: number;
  year: number;
  categoryId: string;
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
};

const formatTime = (dateString: string) => {
  const date = new Date(dateString);

  const now = new Date();

  const difference = now.getTime() - date.getTime();

  const minutes = Math.floor(difference / 60000);

  if (minutes < 1) {
    return "Just now";
  }

  if (minutes < 60) {
    return `${minutes} min ago`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours} hr ago`;
  }

  const days = Math.floor(hours / 24);

  if (days < 7) {
    return `${days} day${days === 1 ? "" : "s"} ago`;
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getIcon = (notification: Notification) => {
  const iconClass = "w-5 h-5";

  switch (notification.icon) {
    case "budget":
      return <Wallet className={iconClass} />;

    case "warning":
      return <AlertTriangle className={iconClass} />;

    case "income":
      return <TrendingUp className={iconClass} />;

    case "expense":
      return <TrendingDown className={iconClass} />;

    case "savings":
      return <PiggyBank className={iconClass} />;

    case "payment":
      return <CreditCard className={iconClass} />;

    case "calendar":
      return <CalendarDays className={iconClass} />;

    default:
      return <Bell className={iconClass} />;
  }
};

const getIconBackground = (type: string) => {
  switch (type) {
    case "success":
    case "income":
      return "bg-green-100 text-green-600";

    case "warning":
    case "budget":
      return "bg-yellow-100 text-yellow-600";

    case "danger":
    case "expense":
      return "bg-red-100 text-red-600";

    default:
      return "bg-blue-100 text-blue-600";
  }
};

const Notifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [monthlyBudget, setMonthlyBudget] =
    useState<MonthlyBudget | null>(null);
  const [categoryBudgets, setCategoryBudgets] = useState<CategoryBudget[]>([]);

  const [filter, setFilter] = useState<"all" | "unread">("all");

  const [selectedNotification, setSelectedNotification] =
    useState<Notification | null>(null);

  const [toast, setToast] = useState("");

  const [loading, setLoading] = useState(true);

  const [generating, setGenerating] = useState(false);

  const currentDate = new Date();

  const currentMonth = currentDate.getMonth() + 1;

  const currentYear = currentDate.getFullYear();

  const showToast = (message: string) => {
    setToast(message);

    setTimeout(() => {
      setToast("");
    }, 2500);
  };

  /**
   * Load persistent notification history.
   */
  const loadNotifications = async () => {
    try {
      const response = await fetch(
        `${API_URL}/notifications?userId=${USER_ID}`
      );

      if (!response.ok) {
        throw new Error("Failed to load notifications");
      }

      const result = await response.json();

      if (result.success) {
        setNotifications(result.data || []);
      }
    } catch (error) {
      console.error("Failed to load notifications:", error);
      showToast("Failed to load notification history");
    }
  };

  /**
   * Load financial data used to create new notifications.
   */
  const loadFinancialData = async () => {
    try {
      const [
        transactionsResponse,
        categoriesResponse,
        budgetResponse,
        categoryBudgetResponse,
      ] = await Promise.all([
        fetch(`${API_URL}/transactions`),
        fetch(`${API_URL}/categories`),
        fetch(
          `${API_URL}/budgets?month=${currentMonth}&year=${currentYear}`
        ),
        fetch(
          `${API_URL}/category-budgets?month=${currentMonth}&year=${currentYear}`
        ),
      ]);

      const transactionsResult = await transactionsResponse.json();
      const categoriesResult = await categoriesResponse.json();
      const budgetResult = await budgetResponse.json();
      const categoryBudgetResult =
        await categoryBudgetResponse.json();

      setTransactions(transactionsResult.data || []);
      setCategories(categoriesResult.data || []);

      setMonthlyBudget(
        budgetResult.data || null
      );

      setCategoryBudgets(
        categoryBudgetResult.data || []
      );
    } catch (error) {
      console.error("Failed to load financial data:", error);
    }
  };

  /**
   * Initial page load.
   */
  useEffect(() => {
    const load = async () => {
      setLoading(true);

      await Promise.all([
        loadNotifications(),
        loadFinancialData(),
      ]);

      setLoading(false);
    };

    load();
  }, []);

  /**
   * Create one notification in the database.
   *
   * The frontend no longer stores notification history only
   * in React state.
   */
  const createPersistentNotification = async (
    notification: {
      title: string;
      message: string;
      type: NotificationType;
      icon?: string;
    }
  ) => {
    try {
      const response = await fetch(
        `${API_URL}/notifications`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: USER_ID,
            title: notification.title,
            message: notification.message,
            type: notification.type,
            icon: notification.icon || null,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to create notification");
      }

      const result = await response.json();

      return result.data as Notification;
    } catch (error) {
      console.error(
        "Failed to create notification:",
        error
      );

      return null;
    }
  };

  /**
   * Generate notifications only for important
   * financial events.
   *
   * We check existing database notifications first
   * so refreshing the page does NOT create duplicates.
   */
  const generateNotifications = async () => {
    if (generating) {
      return;
    }

    setGenerating(true);

    try {
      const existingResponse = await fetch(
        `${API_URL}/notifications?userId=${USER_ID}`
      );

      const existingResult =
        await existingResponse.json();

      const existingNotifications: Notification[] =
        existingResult.data || [];

      const currentMonthTransactions =
        transactions.filter((transaction) => {
          const date = new Date(transaction.date);

          return (
            date.getMonth() + 1 === currentMonth &&
            date.getFullYear() === currentYear &&
            transaction.userId === USER_ID
          );
        });

      const expenses =
        currentMonthTransactions.filter(
          (transaction) =>
            transaction.type === "EXPENSE"
        );

      const incomes =
        currentMonthTransactions.filter(
          (transaction) =>
            transaction.type === "INCOME"
        );

      const totalExpenses = expenses.reduce(
        (sum, transaction) =>
          sum + Number(transaction.amount),
        0
      );

      const totalIncome = incomes.reduce(
        (sum, transaction) =>
          sum + Number(transaction.amount),
        0
      );

      const candidates: {
        title: string;
        message: string;
        type: NotificationType;
        icon?: string;
      }[] = [];

      /*
       * Monthly budget notification
       */
      if (monthlyBudget) {
        const budgetAmount =
          Number(monthlyBudget.amount);

        if (budgetAmount > 0) {
          const percentage =
            (totalExpenses / budgetAmount) * 100;

          if (totalExpenses > budgetAmount) {
            candidates.push({
              title: "Monthly budget exceeded",
              message:
                `You have spent ${formatCurrency(
                  totalExpenses
                )} against your ${formatCurrency(
                  budgetAmount
                )} monthly budget.`,
              type: "danger",
              icon: "budget",
            });
          } else if (percentage >= 80) {
            candidates.push({
              title: "Monthly budget almost full",
              message:
                `You have used ${percentage.toFixed(
                  0
                )}% of your monthly budget (${formatCurrency(
                  totalExpenses
                )} of ${formatCurrency(
                  budgetAmount
                )}).`,
              type: "warning",
              icon: "budget",
            });
          }
        }
      }

      /*
       * Category budget notifications
       */
      for (const categoryBudget of categoryBudgets) {
        const category = categories.find(
          (item) =>
            item.id === categoryBudget.categoryId
        );

        if (!category) {
          continue;
        }

        const categorySpent = expenses
          .filter(
            (transaction) =>
              transaction.categoryId ===
              categoryBudget.categoryId
          )
          .reduce(
            (sum, transaction) =>
              sum + Number(transaction.amount),
            0
          );

        const budgetAmount =
          Number(categoryBudget.amount);

        if (budgetAmount <= 0) {
          continue;
        }

        const percentage =
          (categorySpent / budgetAmount) * 100;

        if (categorySpent > budgetAmount) {
          candidates.push({
            title: `${category.name} budget exceeded`,
            message:
              `You have spent ${formatCurrency(
                categorySpent
              )} against your ${formatCurrency(
                budgetAmount
              )} ${category.name} budget.`,
            type: "danger",
            icon: "budget",
          });
        } else if (percentage >= 80) {
          candidates.push({
            title: `${category.name} budget warning`,
            message:
              `${percentage.toFixed(
                0
              )}% of your ${category.name} budget has been used.`,
            type: "warning",
            icon: "budget",
          });
        }
      }

      /*
       * Income notification
       */
      const recentIncome = [...incomes]
        .sort(
          (a, b) =>
            new Date(b.date).getTime() -
            new Date(a.date).getTime()
        )[0];

      if (recentIncome) {
        candidates.push({
          title: "Recent income recorded",
          message:
            `${formatCurrency(
              Number(recentIncome.amount)
            )} was added as income${
              recentIncome.description
                ? ` — ${recentIncome.description}`
                : ""
            }.`,
          type: "income",
          icon: "income",
        });
      }

      /*
       * Recent expense notification
       */
      const recentExpense = [...expenses]
        .sort(
          (a, b) =>
            new Date(b.date).getTime() -
            new Date(a.date).getTime()
        )[0];

      if (recentExpense) {
        candidates.push({
          title: "Recent expense recorded",
          message:
            `${formatCurrency(
              Number(recentExpense.amount)
            )} was recorded${
              recentExpense.description
                ? ` — ${recentExpense.description}`
                : ""
            }.`,
          type: "expense",
          icon: "expense",
        });
      }

      /*
       * Spending vs income notification
       */
      if (
        totalExpenses > totalIncome &&
        totalIncome > 0
      ) {
        candidates.push({
          title: "Spending is above income",
          message:
            `Your expenses this month are ${formatCurrency(
              totalExpenses - totalIncome
            )} higher than your income.`,
          type: "danger",
          icon: "warning",
        });
      }

      /*
       * Savings notification
       */
      if (totalIncome > 0) {
        const savings =
          totalIncome - totalExpenses;

        if (savings > 0) {
          const savingsPercentage =
            (savings / totalIncome) * 100;

          candidates.push({
            title: "Savings update",
            message:
              `You currently have ${formatCurrency(
                savings
              )} remaining from this month's income (${savingsPercentage.toFixed(
                1
              )}%).`,
            type: "success",
            icon: "savings",
          });
        }
      }

      /*
       * Avoid duplicates.
       *
       * We compare title + message instead of generating
       * a duplicate every time the page is refreshed.
       */
      for (const candidate of candidates) {
        const alreadyExists =
          existingNotifications.some(
            (existing) =>
              existing.title === candidate.title &&
              existing.message === candidate.message
          );

        if (alreadyExists) {
          continue;
        }

        await createPersistentNotification(
          candidate
        );
      }

      /*
       * Reload the database history after creating
       * any new notifications.
       */
      await loadNotifications();
    } catch (error) {
      console.error(
        "Failed to generate notifications:",
        error
      );
    } finally {
      setGenerating(false);
    }
  };

  /*
   * Generate after financial data has loaded.
   */
  useEffect(() => {
    if (loading) {
      return;
    }

    if (
      transactions.length === 0 &&
      categories.length === 0 &&
      !monthlyBudget &&
      categoryBudgets.length === 0
    ) {
      return;
    }

    generateNotifications();
  }, [
    loading,
    transactions,
    categories,
    monthlyBudget,
    categoryBudgets,
  ]);

  const visibleNotifications = useMemo(() => {
    if (filter === "unread") {
      return notifications.filter(
        (notification) => !notification.read
      );
    }

    return notifications;
  }, [notifications, filter]);

  const unreadCount = notifications.filter(
    (notification) => !notification.read
  ).length;

  /**
   * Mark one notification as read.
   */
  const handleOpenNotification = async (
    notification: Notification
  ) => {
    setSelectedNotification(notification);

    if (notification.read) {
      return;
    }

    try {
      await fetch(
        `${API_URL}/notifications/${notification.id}/read`,
        {
          method: "PATCH",
        }
      );

      setNotifications((previous) =>
        previous.map((item) =>
          item.id === notification.id
            ? {
                ...item,
                read: true,
              }
            : item
        )
      );
    } catch (error) {
      console.error(
        "Failed to mark notification read:",
        error
      );
    }
  };

  /**
   * Mark all notifications as read.
   */
  const handleMarkAllRead = async () => {
    try {
      const response = await fetch(
        `${API_URL}/notifications/read-all`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: USER_ID,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          "Failed to mark notifications as read"
        );
      }

      setNotifications((previous) =>
        previous.map((notification) => ({
          ...notification,
          read: true,
        }))
      );

      showToast("All notifications marked as read");
    } catch (error) {
      console.error(
        "Mark all read error:",
        error
      );

      showToast(
        "Failed to mark notifications as read"
      );
    }
  };

  /**
   * Soft delete one notification.
   */
  const handleDelete = async (
    id: string
  ) => {
    try {
      const response = await fetch(
        `${API_URL}/notifications/${id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error(
          "Failed to delete notification"
        );
      }

      setNotifications((previous) =>
        previous.filter(
          (notification) =>
            notification.id !== id
        )
      );

      if (
        selectedNotification?.id === id
      ) {
        setSelectedNotification(null);
      }

      showToast("Notification removed");
    } catch (error) {
      console.error(
        "Delete notification error:",
        error
      );

      showToast(
        "Failed to remove notification"
      );
    }
  };

  /**
   * Soft delete all notifications.
   */
  const handleClearAll = async () => {
    try {
      const response = await fetch(
        `${API_URL}/notifications`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: USER_ID,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          "Failed to clear notifications"
        );
      }

      setNotifications([]);

      showToast("Notification history cleared");
    } catch (error) {
      console.error(
        "Clear notifications error:",
        error
      );

      showToast(
        "Failed to clear notification history"
      );
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <div className="rounded-[18px] border border-[var(--border)] bg-[var(--card)] p-8 text-center shadow-sm">
          <Bell className="mx-auto mb-3 h-8 w-8 animate-pulse text-[var(--muted)]" />

          <p className="text-[var(--muted)]">
            Loading notification history...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--primary)]/10 text-[var(--primary)]">
                <Bell className="h-6 w-6" />
              </div>

              <div>
                <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">
                  Notifications
                </h1>

                <p className="text-sm text-[var(--muted)]">
                  Your persistent financial notification history
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--card)] px-4 py-2 text-sm font-medium text-[var(--foreground)] transition hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                <CheckCheck className="h-4 w-4" />

                Mark all read
              </button>
            )}

            {notifications.length > 0 && (
              <button
                onClick={handleClearAll}
                className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />

                Clear all
              </button>
            )}
          </div>
        </div>

        {/* Persistent history information */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 mt-0.5" />

            <div>
              <p className="font-medium text-blue-900">
                Notification history is saved
              </p>

              <p className="text-sm text-blue-700 mt-1">
                Your notifications are stored in the Vision
                Ledger database, so they remain available
                after refreshing or reopening the website.
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilter("all")}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                filter === "all"
                  ? "bg-[var(--primary)] text-white"
                  : "border border-[var(--border)] bg-[var(--card)] text-[var(--muted)] hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              All
              <span className="ml-2">
                {notifications.length}
              </span>
            </button>

            <button
              onClick={() => setFilter("unread")}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                filter === "unread"
                  ? "bg-[var(--primary)] text-white"
                  : "border border-[var(--border)] bg-[var(--card)] text-[var(--muted)] hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              Unread
              <span className="ml-2">
                {unreadCount}
              </span>
            </button>
          </div>
        </div>

        {/* Notification list */}
        <div className="overflow-hidden rounded-[18px] border border-[var(--border)] bg-[var(--card)] shadow-sm">
          {visibleNotifications.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--background)] text-[var(--muted)]">
                <Bell className="h-7 w-7" />
              </div>

              <h3 className="text-lg font-semibold text-[var(--foreground)]">
                No notifications
              </h3>

              <p className="mt-1 text-sm text-[var(--muted)]">
                {filter === "unread"
                  ? "You have no unread notifications."
                  : "Your notification history will appear here."}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[var(--border)]">
              {visibleNotifications.map(
                (notification) => (
                  <div
                    key={notification.id}
                    className={`flex items-start gap-4 p-5 transition hover:bg-slate-50 dark:hover:bg-slate-800/50 ${
                      !notification.read
                        ? "bg-[var(--primary)]/5"
                        : "bg-[var(--card)]"
                    }`}
                  >
                    {/* Icon */}
                    <button
                      onClick={() =>
                        handleOpenNotification(
                          notification
                        )
                      }
                      className={`w-11 h-11 shrink-0 rounded-xl flex items-center justify-center ${getIconBackground(
                        notification.type
                      )}`}
                    >
                      {getIcon(notification)}
                    </button>

                    {/* Content */}
                    <button
                      onClick={() =>
                        handleOpenNotification(
                          notification
                        )
                      }
                      className="min-w-0 flex-1 text-left"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-[var(--foreground)]">
                              {notification.title}
                            </h3>

                            {!notification.read && (
                              <span className="h-2 w-2 rounded-full bg-[var(--primary)]" />
                            )}
                          </div>

                          <p className="mt-1 text-sm text-[var(--muted)]">
                            {notification.message}
                          </p>
                        </div>

                        <span className="whitespace-nowrap text-xs text-[var(--muted)]">
                          {formatTime(
                            notification.createdAt
                          )}
                        </span>
                      </div>
                    </button>

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                      {!notification.read && (
                        <button
                          onClick={() =>
                            handleOpenNotification(
                              notification
                            )
                          }
                          title="Mark as read"
                          className="rounded-lg p-2 text-[var(--muted)] transition hover:bg-green-50 hover:text-green-600"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                      )}

                      <button
                        onClick={() =>
                          handleDelete(
                            notification.id
                          )
                        }
                        title="Delete"
                        className="rounded-lg p-2 text-[var(--muted)] transition hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-center gap-2 text-xs text-[var(--muted)]">
          <CircleDollarSign className="h-4 w-4" />

          Notifications are generated from your current
          budgets, category budgets, income and transactions.
        </div>

      {/* Details modal */}
      {selectedNotification && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() =>
            setSelectedNotification(null)
          }
        >
          <div
            className="w-full max-w-lg rounded-2xl bg-[var(--card)] shadow-xl"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="flex items-center justify-between border-b border-[var(--border)] p-5">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${getIconBackground(
                    selectedNotification.type
                  )}`}
                >
                  {getIcon(selectedNotification)}
                </div>

                <div>
                  <h2 className="font-semibold text-[var(--foreground)]">
                    Notification details
                  </h2>

                  <p className="text-xs text-[var(--muted)]">
                    {new Date(
                      selectedNotification.createdAt
                    ).toLocaleString("en-IN")}
                  </p>
                </div>
              </div>

              <button
                onClick={() =>
                  setSelectedNotification(null)
                }
                className="rounded-lg p-2 hover:bg-[var(--background)]"
              >
                <X className="h-5 w-5 text-[var(--muted)]" />
              </button>
            </div>

            <div className="p-6">
              <h3 className="text-xl font-bold text-[var(--foreground)]">
                {selectedNotification.title}
              </h3>

              <p className="mt-3 leading-relaxed text-[var(--muted)]">
                {selectedNotification.message}
              </p>
            </div>

            <div className="flex justify-end border-t border-[var(--border)] px-6 py-4">
              <button
                onClick={() =>
                  setSelectedNotification(null)
                }
                className="rounded-lg bg-[var(--foreground)] px-4 py-2 text-white transition hover:opacity-90"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-[60]">
          <div className="flex items-center gap-3 rounded-xl bg-[var(--foreground)] px-5 py-3 text-white shadow-lg">
            <Check className="h-4 w-4 text-green-400" />

            <span className="text-sm">
              {toast}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notifications;