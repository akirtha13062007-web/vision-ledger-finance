import { Request, Response } from "express";
import { Prisma } from "@prisma/client";
import prisma from "../config/prisma.js";

export const createTransaction = async (req: Request, res: Response) => {
  try {
    const { amount, description, date, type, userId, categoryId } = req.body;

    if (amount === undefined || !type || !userId || !categoryId) {
      return res.status(400).json({
        success: false,
        message: "amount, type, userId, and categoryId are required",
      });
    }

    const transaction = await prisma.transaction.create({
      data: {
        amount: Number(amount),
        description,
        date: date ? new Date(date) : undefined,
        type,
        userId,
        categoryId,
      },
      include: {
        user: true,
        category: true,
      },
    });

    res.status(201).json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to create transaction",
    });
  }
};

export const getTransactions = async (_req: Request, res: Response) => {
  try {
    const transactions = await prisma.transaction.findMany({
      orderBy: {
        date: "desc",
      },
      include: {
        user: true,
        category: true,
      },
    });

    res.json({
      success: true,
      data: transactions,
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to get transactions",
    });
  }
};

export const deleteTransaction = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (typeof id !== "string" || !id) {
      return res.status(400).json({
        success: false,
        message: "Transaction id is required",
      });
    }

    await prisma.transaction.delete({
      where: {
        id,
      },
    });

    res.json({
      success: true,
      message: "Transaction deleted successfully",
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to delete transaction",
    });
  }
};
export const updateTransaction = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { amount, description, date, type, categoryId } = req.body;

    if (typeof id !== "string" || !id) {
      return res.status(400).json({
        success: false,
        message: "Transaction id is required",
      });
    }

    if (amount === undefined || !type || !categoryId) {
      return res.status(400).json({
        success: false,
        message: "amount, type, and categoryId are required",
      });
    }

    const transaction = await prisma.transaction.update({
      where: {
        id,
      },
      data: {
        amount: Number(amount),
        description,
        date: date ? new Date(date) : undefined,
        type,
        categoryId,
      },
      include: {
        user: true,
        category: true,
      },
    });

    res.json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to update transaction",
    });
  }
};