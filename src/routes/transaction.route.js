import { Router } from "express";
import {
  getLast15Prices,
  getTotalExpenses,
  getTransaction,
} from "../controllers/transaction.controller.js";

const router = Router();

router.get("/transaction/:address", getTransaction);
router.get("/user-expenses/:address", getTotalExpenses);
router.get("/latest-price", getLast15Prices);

export default router;
