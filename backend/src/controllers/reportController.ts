import { Request, Response } from "express";
import prisma from "../config/prisma.js";
import { AuthenticatedRequest } from "../middleware/authMiddleware.js";

const monthNames = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const getMonthStart = (year: number, month: number) =>
  new Date(year, month - 1, 1);

const getNextMonthStart = (year: number, month: number) =>
  new Date(year, month, 1);

export const getReports = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const now = new Date();

    const requestedMonth = Number(req.query.month);
    const requestedYear = Number(req.query.year);

    const month =
      requestedMonth >= 1 && requestedMonth <= 12
        ? requestedMonth
        : now.getMonth() + 1;

    const year =
      requestedYear >= 2000 && requestedYear <= 2100
        ? requestedYear
        : now.getFullYear();

    const periodStart = getMonthStart(year, month);
    const periodEnd = getNextMonthStart(year, month);

    // Last 6 months, including the selected month.
    const sixMonthStart = new Date(year, month - 7, 1);

    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        date: {
          gte: sixMonthStart,
          lt: periodEnd,
        },
      },
      include: {
        category: true,
      },
      orderBy: {
        date: "desc",
      },
    });

    const currentMonthTransactions = transactions.filter((transaction) => {
      const date = new Date(transaction.date);

      return (
        date.getFullYear() === year &&
        date.getMonth() + 1 === month
      );
    });

    const totalIncome = currentMonthTransactions
      .filter((transaction) => transaction.type === "INCOME")
      .reduce((sum, transaction) => sum + transaction.amount, 0);

    const totalExpenses = currentMonthTransactions
      .filter((transaction) => transaction.type === "EXPENSE")
      .reduce((sum, transaction) => sum + transaction.amount, 0);

    const savings = totalIncome - totalExpenses;

    const savingsRate =
      totalIncome > 0
        ? Math.round((savings / totalIncome) * 100)
        : 0;

    const monthlyData = [];

    for (let i = 5; i >= 0; i--) {
      const date = new Date(year, month - 1 - i, 1);

      const targetYear = date.getFullYear();
      const targetMonth = date.getMonth() + 1;

      const monthTransactions = transactions.filter((transaction) => {
        const transactionDate = new Date(transaction.date);

        return (
          transactionDate.getFullYear() === targetYear &&
          transactionDate.getMonth() + 1 === targetMonth
        );
      });

      const income = monthTransactions
        .filter((transaction) => transaction.type === "INCOME")
        .reduce((sum, transaction) => sum + transaction.amount, 0);

      const expenses = monthTransactions
        .filter((transaction) => transaction.type === "EXPENSE")
        .reduce((sum, transaction) => sum + transaction.amount, 0);

      monthlyData.push({
        month: monthNames[targetMonth - 1],
        income,
        expenses,
      });
    }

    const expenseByCategory = new Map<string, number>();

    currentMonthTransactions
      .filter((transaction) => transaction.type === "EXPENSE")
      .forEach((transaction) => {
        const categoryName = transaction.category?.name || "Other";

        expenseByCategory.set(
          categoryName,
          (expenseByCategory.get(categoryName) || 0) +
            transaction.amount
        );
      });

    const categoryData = Array.from(expenseByCategory.entries())
      .map(([name, amount]) => ({
        name,
        amount,
        percent:
          totalExpenses > 0
            ? Math.round((amount / totalExpenses) * 100)
            : 0,
      }))
      .sort((a, b) => b.amount - a.amount);

    const recentActivity = currentMonthTransactions
      .slice(0, 5)
      .map((transaction) => ({
        id: transaction.id,
        title:
          transaction.description ||
          transaction.category?.name ||
          "Transaction",
        category:
          transaction.category?.name ||
          (transaction.type === "INCOME" ? "Income" : "Expense"),
        amount: transaction.amount,
        type: transaction.type,
        date: transaction.date,
      }));

    return res.json({
      success: true,
      data: {
        period: {
          month,
          year,
          label: `${monthNames[month - 1]} ${year}`,
        },
        summary: {
          totalIncome,
          totalExpenses,
          savings,
          savingsRate,
        },
        monthlyData,
        categoryData,
        recentActivity,
      },
    });
  } catch (error) {
    console.error("Reports error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to generate reports",
    });
  }
};
