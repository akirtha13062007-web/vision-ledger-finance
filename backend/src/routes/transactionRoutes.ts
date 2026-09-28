import { Router } from "express";
import {
        createTransaction,
        getTransactions,
        deleteTransaction,
        updateTransaction,
} from "../controllers/transactionController.js";

const router = Router();

router.get("/", getTransactions);
router.post("/", createTransaction);
router.delete("/:id", deleteTransaction);
router.put("/:id", updateTransaction);

export default router;