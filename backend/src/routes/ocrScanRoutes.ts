import { Router } from "express";
import {
  createReceiptScan,
  getReceiptScanById,
  getReceiptScans,
} from "../controllers/ocrScanController.js";

const router = Router();

router.post("/", createReceiptScan);
router.get("/", getReceiptScans);
router.get("/:id", getReceiptScanById);

export default router;
