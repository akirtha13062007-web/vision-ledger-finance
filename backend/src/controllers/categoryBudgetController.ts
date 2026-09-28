import { Request, Response } from "express";
import prisma from "../config/prisma.js";

const validateMonthYear = (month: number, year: number) => {
  if (!Number.isInteger(month) || month < 1 || month > 12) {
    return "month must be between 1 and 12";
  }

  if (!Number.isInteger(year) || year <= 0) {
    return "year must be a valid positive number";
  }

  return null;
};

export const getCategoryBudgets = async (req: Request, res: Response) => {
  try {
    const month = Number(req.query.month);
    const year = Number(req.query.year);

    const validationError = validateMonthYear(month, year);
    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    const categoryBudgets = await prisma.categoryBudget.findMany({
      where: {
        month: Number(month),
        year: Number(year),
      },
      include: {
        category: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.json({
      success: true,
      data: categoryBudgets,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to get category budgets",
    });
  }
};

export const createOrUpdateCategoryBudget = async (
  req: Request,
  res: Response
) => {
  try {
    const { amount, month, year, categoryId } = req.body ?? {};
    const normalizedAmount = Number(amount);
    const normalizedMonth = Number(month);
    const normalizedYear = Number(year);
    const normalizedCategoryId = typeof categoryId === "string" ? categoryId.trim() : "";

    if (!Number.isFinite(normalizedAmount) || normalizedAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "amount must be a finite number greater than zero",
      });
    }

    const monthError = validateMonthYear(normalizedMonth, normalizedYear);
    if (monthError) {
      return res.status(400).json({
        success: false,
        message: monthError,
      });
    }

    if (!normalizedCategoryId) {
      return res.status(400).json({
        success: false,
        message: "categoryId is required",
      });
    }

    const category = await prisma.category.findUnique({
      where: { id: normalizedCategoryId },
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    const categoryBudget = await prisma.categoryBudget.upsert({
      where: {
        categoryId_month_year: {
          categoryId: normalizedCategoryId,
          month: normalizedMonth,
          year: normalizedYear,
        },
      },
      update: {
        amount: normalizedAmount,
      },
      create: {
        amount: normalizedAmount,
        month: normalizedMonth,
        year: normalizedYear,
        categoryId: normalizedCategoryId,
      },
      include: {
        category: true,
      },
    });

    return res.json({
      success: true,
      data: categoryBudget,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to save category budget",
    });
  }
};

export const deleteCategoryBudget = async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    const existingBudget = await prisma.categoryBudget.findUnique({
      where: { id },
    });

    if (!existingBudget) {
      return res.status(404).json({
        success: false,
        message: "Category budget not found",
      });
    }

    const deletedBudget = await prisma.categoryBudget.delete({
      where: { id },
      include: {
        category: true,
      },
    });

    return res.json({
      success: true,
      data: deletedBudget,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete category budget",
    });
  }
};
