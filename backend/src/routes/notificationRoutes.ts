import { Router } from "express";

import {
  getNotifications,
  createNotification,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  clearAllNotifications,
} from "../controllers/notificationController.js";

const router = Router();

router.get("/", getNotifications);

router.post("/", createNotification);

router.patch("/read-all", markAllNotificationsRead);

router.patch("/:id/read", markNotificationRead);

router.delete("/:id", deleteNotification);

router.delete("/", clearAllNotifications);

export default router;