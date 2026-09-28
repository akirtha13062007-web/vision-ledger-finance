import reportRoutes from "./routes/reportRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import budgetRoutes from "./routes/budgetRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import categoryBudgetRoutes from "./routes/categoryBudgetRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import transactionRoutes from "./routes/transactionRoutes.js";
import ocrScanRoutes from "./routes/ocrScanRoutes.js";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/category-budgets", categoryBudgetRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/ocr-scans", ocrScanRoutes);
app.use("/api/budgets", budgetRoutes);
app.use("/api/reports", reportRoutes);
// Test route
app.get("/api/categories-test", (_req, res) => {
  res.json({
    success: true,
    message: "Category route is connected",
  });
});

// Health check
app.get("/api/health", (_req, res) => {
  res.json({
    success: true,
    message: "Vision Ledger API is healthy",
  });
});

// Start server
app.listen(PORT, () => {
  console.log(
    `🚀 Vision Ledger backend running on http://localhost:${PORT}`
  );
});