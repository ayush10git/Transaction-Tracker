import { Router } from "express";
import {
  getTotalExpenses,
  getTransaction,
} from "../controllers/transaction.controller.js";

const router = Router();

router.get("/:address", getTransaction);
router.get("/user-expenses/:address", getTotalExpenses);

export default router;
