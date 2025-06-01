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

// Import the MongoDB connection helper and the test router
import { connectToMongoDB } from "../database/mongodb_db/mongodb_connection.js";
import mongodbTestRouter from "./routes/mongodb_test_route.js";

// 4. Connect to MongoDB, then mount only the test route
connectToMongoDB()
  .then(() => {
    console.log("✅ MongoDB connected. Mounting /mongodb_test_route…");
    app.use("/mongodb_test_route", mongodbTestRouter);
  })
  .catch((err) => {
    console.error("❌ Failed to connect to MongoDB:", err);
    // We do NOT exit here, since ping/health endpoints can still work.
  });

// 6. Start listening
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
});
