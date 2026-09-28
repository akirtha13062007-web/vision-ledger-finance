import { Router } from "express";
import {
  getBudget,
  createOrUpdateBudget,
} from "../controllers/budgetController.js";

const router = Router();

router.get("/", getBudget);
router.post("/", createOrUpdateBudget);

export default router;