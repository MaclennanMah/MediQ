// backend/src/index.js
import express from "express";
import dotenv from "dotenv";

// 1. Load .env variables first
dotenv.config();

// 2. Create the Express app
const app = express();

// 3. Mount middleware
app.use(express.json());

// 4. Mount routes *after* app exists
import pingRouter from "./routes/ping.js";
app.use("/ping", pingRouter);

// Standard route
app.get('/', (req, res) => {
  res.json({'message': 'Backend is running'})
})

// 5. Health check (you can keep this before or after)
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: Date.now() });
});

// 6. Start listening
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
});
