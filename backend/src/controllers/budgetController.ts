import { Request, Response } from "express";
import prisma from "../config/prisma.js";

export const getBudget = async (req: Request, res: Response) => {
  try {
    const month = Number(req.query.month);
    const year = Number(req.query.year);

    if (!month || !year) {
      return res.status(400).json({
        success: false,
        message: "month and year are required",
      });
    }

    const budget = await prisma.budget.findUnique({
      where: {
        month_year: {
          month,
          year,
        },
      },
    });

    res.json({
      success: true,
      data: budget,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to get budget",
    });
  }
};

export const createOrUpdateBudget = async (
  req: Request,
  res: Response
) => {
  try {
    const { amount, month, year } = req.body;

    if (amount === undefined || !month || !year) {
      return res.status(400).json({
        success: false,
        message: "amount, month, and year are required",
      });
    }

    const budget = await prisma.budget.upsert({
      where: {
        month_year: {
          month: Number(month),
          year: Number(year),
        },
      },
      update: {
        amount: Number(amount),
      },
      create: {
        amount: Number(amount),
        month: Number(month),
        year: Number(year),
      },
    });

    res.json({
      success: true,
      data: budget,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to save budget",
    });
  }
};