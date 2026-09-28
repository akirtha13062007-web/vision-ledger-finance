import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import prisma from "../config/prisma.js";

const getAuthenticatedUserId = (req: Request): string | null => {
  const authHeader = req.headers.authorization;
  if (typeof authHeader !== "string") {
    return null;
  }

  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  if (!match) {
    return null;
  }

  const token = match[1];
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }

  const payload = jwt.verify(token, secret) as { userId?: string };
  if (!payload?.userId || typeof payload.userId !== "string") {
    return null;
  }

  return payload.userId;
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const { email, name } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const user = await prisma.user.create({
      data: {
        email,
        name,
      },
    });

    res.status(201).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to create user",
    });
  }
};

export const getUser = async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: String(req.params.id),
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to get user",
    });
  }
};

export const updateCurrentUserProfile = async (req: Request, res: Response) => {
  try {
    const userId = getAuthenticatedUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const incomingName = typeof req.body?.name === "string" ? req.body.name.trim() : "";
    if (!incomingName) {
      return res.status(400).json({
        success: false,
        message: "Name is required",
      });
    }

    const incomingLocation = typeof req.body?.location === "string" ? req.body.location.trim() : "";
    const incomingOccupation = typeof req.body?.occupation === "string" ? req.body.occupation.trim() : "";

    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name: incomingName,
        location: incomingLocation || null,
        occupation: incomingOccupation || null,
      },
    });

    return res.json({
      success: true,
      data: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        location: updatedUser.location,
        occupation: updatedUser.occupation,
      },
    });
  } catch (error) {
    console.error("Update profile error:", error);

    if (error instanceof Error && error.message === "JWT_SECRET is not configured") {
      return res.status(500).json({
        success: false,
        message: "Authentication configuration error",
      });
    }

    if (error instanceof Error && error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to update profile",
    });
  }
};