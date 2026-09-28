import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  CalendarDays,
  CheckCircle2,
  Edit3,
  Plus,
  Target,
  Wallet,
} from "lucide-react";

type MonthlyBudget = {
  id: string;
  amount: number;
  month: number;
  year: number;
  createdAt?: string;
  updatedAt?: string;
};

type Transaction = {
  id: string;
  amount: number;
  type: "INCOME" | "EXPENSE";
  date: string;
  description?: string;
  categoryId?: string;
};

type Category = {
  id: string;
  name: string;
  type: "INCOME" | "EXPENSE";
  createdAt?: string;
};

type CategoryBudget = {
  id: string;
  amount: number;
  month: number;
  year: number;
  categoryId: string;
  category?: Category;
  createdAt?: string;
  updatedAt?: string;
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

const getCurrentMonthYear = () => {
  const now = new Date();

  return {
    month: now.getMonth() + 1,
    year: now.getFullYear(),
  };
};

export default function Budgets() {
  const currentMonthDetails = useMemo(() => getCurrentMonthYear(), []);
  const { month, year } = currentMonthDetails;

  const [budget, setBudget] = useState<MonthlyBudget | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryBudgets, setCategoryBudgets] = useState<CategoryBudget[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isCategoryBudgetLoading, setIsCategoryBudgetLoading] = useState(true);
  const [error, setError] = useState("");
  const [categoryBudgetError, setCategoryBudgetError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showCategoryBudgetModal, setShowCategoryBudgetModal] = useState(false);
  const [budgetAmount, setBudgetAmount] = useState("");
  const [categoryBudgetForm, setCategoryBudgetForm] = useState({
    categoryId: "",
    amount: "",
  });
  const [editingCategoryBudgetId, setEditingCategoryBudgetId] = useState<string | null>(null);

  const fetchBudgetData = async () => {
    setIsLoading(true);
    setError("");

    try {
      const [budgetResponse, transactionsResponse] = await Promise.all([
        fetch(`http://localhost:5000/api/budgets?month=${month}&year=${year}`),
        fetch("http://localhost:5000/api/transactions"),
      ]);

      if (!budgetResponse.ok || !transactionsResponse.ok) {
        throw new Error("Failed to load budget information.");
      }

      const budgetResult = await budgetResponse.json();
      const transactionsResult = await transactionsResponse.json();

      const currentBudget: MonthlyBudget | null =
        budgetResult && budgetResult.data ? budgetResult.data : null;

      const currentTransactions: Transaction[] =
        Array.isArray(transactionsResult.data) ? transactionsResult.data : [];

      setBudget(currentBudget);
      setTransactions(currentTransactions);
    } catch (loadError) {
      console.error("Failed to load monthly budget data", loadError);
      setBudget(null);
      setTransactions([]);
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Failed to load monthly budget data."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategoryBudgetData = async () => {
    setIsCategoryBudgetLoading(true);
    setCategoryBudgetError("");

    try {
      const [categoriesResponse, categoryBudgetsResponse] = await Promise.all([
        fetch("http://localhost:5000/api/categories"),
        fetch(`http://localhost:5000/api/category-budgets?month=${month}&year=${year}`),
      ]);

      if (!categoriesResponse.ok || !categoryBudgetsResponse.ok) {
        throw new Error("Failed to load category budget information.");
      }

      const categoriesResult = await categoriesResponse.json();
      const categoryBudgetsResult = await categoryBudgetsResponse.json();

      const fetchedCategories: Category[] =
        Array.isArray(categoriesResult.data) ? categoriesResult.data : [];
      const fetchedCategoryBudgets: CategoryBudget[] =
        Array.isArray(categoryBudgetsResult.data) ? categoryBudgetsResult.data : [];

      setCategories(fetchedCategories);
      setCategoryBudgets(fetchedCategoryBudgets);
    } catch (loadError) {
      console.error("Failed to load category budgets", loadError);
      setCategories([]);
      setCategoryBudgets([]);
      setCategoryBudgetError(
        loadError instanceof Error
          ? loadError.message
          : "Failed to load category budgets."
      );
    } finally {
      setIsCategoryBudgetLoading(false);
    }
  };

  useEffect(() => {
    void fetchBudgetData();
  }, [month, year]);

  useEffect(() => {
    void fetchCategoryBudgetData();
  }, [month, year]);

  const totalSpent = useMemo(() => {
    return transactions
      .filter((transaction) => {
        const transactionDate = new Date(transaction.date);

        return (
          transaction.type === "EXPENSE" &&
          transactionDate.getMonth() + 1 === month &&
          transactionDate.getFullYear() === year
        );
      })
      .reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0);
  }, [month, transactions, year]);

  const totalBudget = budget?.amount ?? 0;
  const remaining = totalBudget - totalSpent;
  const percentage =
    totalBudget > 0 ? Math.min(Math.round((totalSpent / totalBudget) * 100), 100) : 0;

  const getBudgetTipMessage = () => {
    if (totalBudget === 0) {
      return "Set a monthly budget to start tracking your spending.";
    }

    if (percentage < 50) {
      return "You're within your budget. Keep tracking your spending to stay on target.";
    }

    if (percentage < 80) {
      return "You're over halfway through your budget. Keep an eye on your remaining spending.";
    }

    if (percentage < 100) {
      return "You're close to your monthly limit. Consider reducing non-essential spending.";
    }

    return "You've reached your monthly limit. Review your recent expenses before spending more.";
  };

  const categoryBudgetUsage = useMemo(() => {
    const usageMap = new Map<string, { spent: number; remaining: number; percentage: number }>();

    for (const budgetItem of categoryBudgets) {
      const spent = transactions
        .filter((transaction) => {
          if (transaction.type !== "EXPENSE") {
            return false;
          }

          if (transaction.categoryId !== budgetItem.categoryId) {
            return false;
          }

          const transactionDate = new Date(transaction.date);
          return (
            transactionDate.getMonth() + 1 === month &&
            transactionDate.getFullYear() === year
          );
        })
        .reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0);

      const remainingAmount = Number(budgetItem.amount || 0) - spent;
      const percentageUsed =
        Number(budgetItem.amount || 0) > 0
          ? Math.min(Math.round((spent / Number(budgetItem.amount || 0)) * 100), 100)
          : 0;

      usageMap.set(budgetItem.id, {
        spent,
        remaining: remainingAmount,
        percentage: percentageUsed,
      });
    }

    return usageMap;
  }, [categoryBudgets, month, transactions, year]);

  const availableCategoriesForBudget = categories.filter((category) => {
    const alreadySelected = categoryBudgets.some(
      (budgetItem) => budgetItem.categoryId === category.id
    );

    return !alreadySelected || category.id === editingCategoryBudgetId;
  });

  const openBudgetModal = () => {
    setBudgetAmount(budget?.amount ? String(budget.amount) : "");
    setShowModal(true);
  };

  const openCategoryBudgetModal = (budgetItem?: CategoryBudget) => {
    if (budgetItem) {
      setEditingCategoryBudgetId(budgetItem.id);
      setCategoryBudgetForm({
        categoryId: budgetItem.categoryId,
        amount: String(budgetItem.amount),
      });
    } else {
      setEditingCategoryBudgetId(null);
      const firstSelectableCategory = availableCategoriesForBudget[0]?.id ?? "";
      setCategoryBudgetForm({
        categoryId: firstSelectableCategory,
        amount: "",
      });
    }

    setShowCategoryBudgetModal(true);
  };

  const closeCategoryBudgetModal = () => {
    setShowCategoryBudgetModal(false);
    setEditingCategoryBudgetId(null);
    setCategoryBudgetForm({ categoryId: "", amount: "" });
  };

  const submitBudget = async (event: FormEvent) => {
    event.preventDefault();

    const parsedAmount = Number(budgetAmount);

    if (!budgetAmount || !Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setError("Please enter a valid budget amount greater than zero.");
      return;
    }

    setIsSaving(true);
    setError("");

    try {
      const response = await fetch("http://localhost:5000/api/budgets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: parsedAmount,
          month,
          year,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to save the monthly budget.");
      }

      setShowModal(false);
      await fetchBudgetData();
    } catch (saveError) {
      console.error("Failed to save monthly budget", saveError);
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Unable to save the monthly budget."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const submitCategoryBudget = async (event: FormEvent) => {
    event.preventDefault();

    const parsedAmount = Number(categoryBudgetForm.amount);

    if (!categoryBudgetForm.categoryId) {
      setCategoryBudgetError("Please select a category.");
      return;
    }

    if (!categoryBudgetForm.amount || !Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setCategoryBudgetError("Please enter a valid category budget amount greater than zero.");
      return;
    }

    try {
      setCategoryBudgetError("");

      const response = await fetch("http://localhost:5000/api/category-budgets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: parsedAmount,
          month,
          year,
          categoryId: categoryBudgetForm.categoryId,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to save the category budget.");
      }

      closeCategoryBudgetModal();
      await fetchCategoryBudgetData();
    } catch (saveError) {
      console.error("Failed to save category budget", saveError);
      setCategoryBudgetError(
        saveError instanceof Error
          ? saveError.message
          : "Unable to save the category budget."
      );
    }
  };

  const deleteCategoryBudget = async (budgetItem: CategoryBudget) => {
    const confirmed = window.confirm(
      `Delete the budget for ${budgetItem.category?.name ?? "this category"}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setCategoryBudgetError("");

      const response = await fetch(
        `http://localhost:5000/api/category-budgets/${budgetItem.id}`,
        { method: "DELETE" }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to delete the category budget.");
      }

      await fetchCategoryBudgetData();
    } catch (saveError) {
      console.error("Failed to delete category budget", saveError);
      setCategoryBudgetError(
        saveError instanceof Error
          ? saveError.message
          : "Unable to delete the category budget."
      );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 dark:bg-slate-950 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="mb-1 text-sm font-medium text-emerald-600 dark:text-emerald-400">
              Financial Planning
            </p>

            <h1 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
              Budgets
            </h1>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Track your monthly spending and stay within your limit.
            </p>
          </div>

          <button
            onClick={openBudgetModal}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-600"
          >
            {budget ? <Edit3 size={18} /> : <Plus size={18} />}
            {budget ? "Edit Budget" : "Set Budget"}
          </button>
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
          <CalendarDays size={18} className="text-emerald-500" />
          {new Date(year, month - 1).toLocaleString("en-IN", {
            month: "long",
            year: "numeric",
          })}
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
            {error}
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            title="Total Budget"
            value={formatCurrency(totalBudget)}
            subtitle="Monthly limit"
            icon={<Wallet size={20} />}
            iconClass="bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
          />

          <SummaryCard
            title="Total Spent"
            value={formatCurrency(totalSpent)}
            subtitle={totalBudget > 0 ? `${percentage}% of budget used` : "No budget set"}
            icon={<ArrowDown size={20} />}
            iconClass="bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"
          />

          <SummaryCard
            title="Remaining"
            value={formatCurrency(remaining)}
            subtitle={remaining >= 0 ? "Available to spend" : "Over budget"}
            icon={<ArrowUp size={20} />}
            iconClass="bg-violet-100 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400"
          />

          <SummaryCard
            title="Percentage Used"
            value={totalBudget > 0 ? `${percentage}%` : "0%"}
            subtitle={
              totalBudget > 0
                ? totalSpent > totalBudget
                  ? "Over budget"
                  : "On track"
                : "No budget set"
            }
            icon={
              totalSpent > totalBudget && totalBudget > 0 ? (
                <AlertCircle size={20} />
              ) : (
                <CheckCircle2 size={20} />
              )
            }
            iconClass={
              totalSpent > totalBudget && totalBudget > 0
                ? "bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400"
                : "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
            }
          />
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-slate-900 dark:text-white">
                Monthly Budget Overview
              </h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Your overall spending progress for this month
              </p>
            </div>

            <span className="text-lg font-bold text-slate-900 dark:text-white">
              {totalBudget > 0 ? `${percentage}%` : "0%"}
            </span>
          </div>

          {isLoading ? (
            <div className="flex h-14 items-center justify-center text-sm text-slate-500 dark:text-slate-400">
              Loading monthly budget...
            </div>
          ) : totalBudget === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center dark:border-slate-700 dark:bg-slate-800/50">
              <p className="text-lg font-semibold text-slate-900 dark:text-white">
                No budget set for this month
              </p>

              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Set a monthly spending limit to start tracking your progress.
              </p>

              <button
                onClick={openBudgetModal}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-600"
              >
                <Plus size={16} />
                Set Budget
              </button>
            </div>
          ) : (
            <>
              <div className="h-3 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div
                  className={`h-full rounded-full transition-all ${
                    totalSpent > totalBudget ? "bg-amber-500" : "bg-emerald-500"
                  }`}
                  style={{ width: `${Math.min(percentage, 100)}%` }}
                />
              </div>

              <div className="mt-3 flex justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>Spent {formatCurrency(totalSpent)}</span>
                <span>Budget {formatCurrency(totalBudget)}</span>
              </div>
            </>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Category Budgets
              </h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Track spending by category for this month.
              </p>
            </div>

            <button
              onClick={() => openCategoryBudgetModal()}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-600"
            >
              <Plus size={16} />
              Add Category Budget
            </button>
          </div>

          {categoryBudgetError && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
              {categoryBudgetError}
            </div>
          )}

          {isCategoryBudgetLoading ? (
            <div className="flex h-16 items-center justify-center text-sm text-slate-500 dark:text-slate-400">
              Loading category budgets...
            </div>
          ) : categoryBudgets.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center dark:border-slate-700 dark:bg-slate-800/50">
              <p className="text-lg font-semibold text-slate-900 dark:text-white">
                No category budgets for this month
              </p>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Set a spending limit for a category to start tracking its progress.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {categoryBudgets.map((budgetItem) => {
                const usage = categoryBudgetUsage.get(budgetItem.id) ?? {
                  spent: 0,
                  remaining: Number(budgetItem.amount || 0),
                  percentage: 0,
                };

                const categoryName = budgetItem.category?.name ?? "Unknown category";
                const budgetAmount = Number(budgetItem.amount || 0);
                const spentAmount = usage.spent;
                const remainingAmount = usage.remaining;
                const percentageUsed = usage.percentage;

                return (
                  <div
                    key={budgetItem.id}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/40"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-base font-semibold text-slate-900 dark:text-white">
                            {categoryName}
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-4 text-sm text-slate-500 dark:text-slate-400">
                          <span>Budget: {formatCurrency(budgetAmount)}</span>
                          <span>Spent: {formatCurrency(spentAmount)}</span>
                          <span>Remaining: {formatCurrency(remainingAmount)}</span>
                          <span>{percentageUsed}% used</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => openCategoryBudgetModal(budgetItem)}
                          className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => deleteCategoryBudget(budgetItem)}
                          className="rounded-xl border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-red-500/30 dark:text-red-300 dark:hover:bg-red-500/10"
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                      <div
                        className={`h-full rounded-full transition-all ${
                          percentageUsed >= 100 ? "bg-amber-500" : "bg-emerald-500"
                        }`}
                        style={{ width: `${Math.min(percentageUsed, 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 p-5 dark:border-emerald-500/20 dark:bg-emerald-500/5">
          <Target className="mt-0.5 shrink-0 text-emerald-600 dark:text-emerald-400" />

          <div>
            <h3 className="font-semibold text-emerald-900 dark:text-emerald-300">
              Budget tip
            </h3>

            <p className="mt-1 text-sm text-emerald-800/80 dark:text-emerald-300/70">
              {getBudgetTipMessage()}
            </p>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {budget ? "Edit Budget" : "Set Budget"}
              </h2>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {new Date(year, month - 1).toLocaleString("en-IN", {
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>

            <form onSubmit={submitBudget} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Monthly Budget Amount
                </label>

                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                    ₹
                  </span>

                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={budgetAmount}
                    onChange={(event) => setBudgetAmount(event.target.value)}
                    placeholder="5000"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-8 pr-4 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 rounded-xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSaving ? "Saving..." : budget ? "Save Changes" : "Set Budget"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showCategoryBudgetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {editingCategoryBudgetId ? "Edit Category Budget" : "Add Category Budget"}
              </h2>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {new Date(year, month - 1).toLocaleString("en-IN", {
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>

            <form onSubmit={submitCategoryBudget} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Category
                </label>

                <select
                  value={categoryBudgetForm.categoryId}
                  onChange={(event) =>
                    setCategoryBudgetForm((current) => ({
                      ...current,
                      categoryId: event.target.value,
                    }))
                  }
                  disabled={Boolean(editingCategoryBudgetId)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-70 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  <option value="">Select a category</option>
                  {availableCategoriesForBudget.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Category Budget Amount
                </label>

                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                    ₹
                  </span>

                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={categoryBudgetForm.amount}
                    onChange={(event) =>
                      setCategoryBudgetForm((current) => ({
                        ...current,
                        amount: event.target.value,
                      }))
                    }
                    placeholder="1500"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-8 pr-4 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              {categoryBudgetError && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
                  {categoryBudgetError}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeCategoryBudgetModal}
                  className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-600"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryCard({
  title,
  value,
  subtitle,
  icon,
  iconClass,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
  iconClass: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            {title}
          </p>

          <p className="mt-2 text-xl font-bold text-slate-900 dark:text-white">
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
    </div>
  );
}