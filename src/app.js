import express from "express";

const app = express();

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));

import transactionRouter from "./routes/transaction.route.js";

app.use("/api/ethereum", transactionRouter);

export { app }