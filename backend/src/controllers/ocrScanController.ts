import { Request, Response } from "express";
import prisma from "../config/prisma.js";

export const createReceiptScan = async (req: Request, res: Response) => {
  try {
    const {
      userId,
      merchant,
      date,
      time,
      address,
      phone,
      website,
      receiptNumber,
      paymentMethod,
      category,
      amount,
      rawText,
      items,
    } = req.body ?? {};

    const receiptScan = await prisma.receiptScan.create({
      data: {
        userId: userId || null,
        merchant: merchant || null,
        date: date || null,
        time: time || null,
        address: address || null,
        phone: phone || null,
        website: website || null,
        receiptNumber: receiptNumber || null,
        paymentMethod: paymentMethod || null,
        category: category || null,
        amount: amount === undefined || amount === null || amount === "" ? null : Number(amount),
        rawText: rawText || null,
        items: {
          create: Array.isArray(items)
            ? items.map((item: Record<string, string | number | null>) => ({
                name: typeof item?.name === "string" ? item.name : null,
                quantity: typeof item?.quantity === "string" || typeof item?.quantity === "number" ? String(item.quantity) : null,
                unitPrice: typeof item?.unitPrice === "string" || typeof item?.unitPrice === "number" ? String(item.unitPrice) : null,
                lineTotal: typeof item?.lineTotal === "string" || typeof item?.lineTotal === "number" ? String(item.lineTotal) : null,
              }))
            : [],
        },
      },
      include: {
        items: true,
      },
    });

    res.status(201).json({
      success: true,
      data: receiptScan,
    });
  } catch (error) {
    console.error("Failed to save OCR scan", error);
    res.status(500).json({
      success: false,
      message: "Failed to save OCR scan",
    });
  }
};

export const getReceiptScans = async (_req: Request, res: Response) => {
  try {
    const scans = await prisma.receiptScan.findMany({
      orderBy: { createdAt: "desc" },
      include: { items: true },
    });

    res.json({
      success: true,
      data: scans,
    });
  } catch (error) {
    console.error("Failed to fetch receipt scans", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch receipt scans",
    });
  }
};

export const getReceiptScanById = async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    const scan = await prisma.receiptScan.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!scan) {
      return res.status(404).json({
        success: false,
        message: "Receipt scan not found",
      });
    }

    res.json({
      success: true,
      data: scan,
    });
  } catch (error) {
    console.error("Failed to fetch receipt scan", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch receipt scan",
    });
  }
};
