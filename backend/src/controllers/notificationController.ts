import { Request, Response } from "express";
import prisma from "../config/prisma.js";

/**
 * GET /api/notifications
 *
 * Returns notification history for a user.
 *
 * Query:
 * ?userId=USER_ID
 *
 * Deleted notifications are excluded from the normal history.
 */
export const getNotifications = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = String(req.query.userId || "").trim();

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required",
      });
    }

    const notifications = await prisma.notification.findMany({
      where: {
        userId,
        deleted: false,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    console.error("Get notifications error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get notifications",
    });
  }
};

/**
 * POST /api/notifications
 *
 * Creates a persistent notification.
 */
export const createNotification = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      userId,
      title,
      message,
      type,
      icon,
    } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required",
      });
    }

    if (!title) {
      return res.status(400).json({
        success: false,
        message: "title is required",
      });
    }

    if (!message) {
      return res.status(400).json({
        success: false,
        message: "message is required",
      });
    }

    const notification = await prisma.notification.create({
      data: {
        userId,
        title,
        message,
        type: type || "info",
        icon: icon || null,
      },
    });

    return res.status(201).json({
      success: true,
      data: notification,
    });
  } catch (error) {
    console.error("Create notification error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create notification",
    });
  }
};

/**
 * PATCH /api/notifications/:id/read
 *
 * Marks one notification as read.
 */
export const markNotificationRead = async (
  req: Request,
  res: Response
) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    const notification = await prisma.notification.update({
      where: {
        id,
      },
      data: {
        read: true,
      },
    });

    return res.json({
      success: true,
      data: notification,
    });
  } catch (error) {
    console.error("Mark notification read error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to mark notification as read",
    });
  }
};

/**
 * PATCH /api/notifications/read-all
 *
 * Marks all notifications for a user as read.
 */
export const markAllNotificationsRead = async (
  req: Request,
  res: Response
) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required",
      });
    }

    await prisma.notification.updateMany({
      where: {
        userId,
        deleted: false,
        read: false,
      },
      data: {
        read: true,
      },
    });

    return res.json({
      success: true,
      message: "All notifications marked as read",
    });
  } catch (error) {
    console.error("Mark all notifications read error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to mark all notifications as read",
    });
  }
};

/**
 * DELETE /api/notifications/:id
 *
 * Soft deletes a notification.
 *
 * The notification remains in the database,
 * so the historical record is preserved.
 */
export const deleteNotification = async (
  req: Request,
  res: Response
) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    const notification = await prisma.notification.update({
      where: {
        id,
      },
      data: {
        deleted: true,
      },
    });

    return res.json({
      success: true,
      data: notification,
    });
  } catch (error) {
    console.error("Delete notification error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete notification",
    });
  }
};

/**
 * DELETE /api/notifications
 *
 * Soft deletes all notifications for a user.
 */
export const clearAllNotifications = async (
  req: Request,
  res: Response
) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required",
      });
    }

    await prisma.notification.updateMany({
      where: {
        userId,
        deleted: false,
      },
      data: {
        deleted: true,
      },
    });

    return res.json({
      success: true,
      message: "All notifications cleared",
    });
  } catch (error) {
    console.error("Clear notifications error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to clear notifications",
    });
  }
};