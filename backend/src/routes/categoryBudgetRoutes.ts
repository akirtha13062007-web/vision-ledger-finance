import { Router } from "express";
import {
  createOrUpdateCategoryBudget,
  deleteCategoryBudget,
  getCategoryBudgets,
} from "../controllers/categoryBudgetController.js";

const router = Router();

router.get("/", getCategoryBudgets);
router.post("/", createOrUpdateCategoryBudget);
router.delete("/:id", deleteCategoryBudget);

export default router;
