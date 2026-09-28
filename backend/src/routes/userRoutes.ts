import { Router } from "express";
import {
  createUser,
  getUser,
  updateCurrentUserProfile,
} from "../controllers/userController.js";

const router = Router();

router.post("/", createUser);
router.get("/:id", getUser);
router.patch("/me", updateCurrentUserProfile);
router.put("/me", updateCurrentUserProfile);

export default router;