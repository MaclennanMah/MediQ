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

// -------------- FOR MONGODB -----------------------
// Import the MongoDB connection helper and the test router
import { connectToMongoDB } from "../database/mongodb_db/mongodb_connection.js";
import submissionRouter from "./routes/submissions.js"
import organizationsRouter from "./routes/organizations.js"

// 4. Connect to MongoDB, then mount only the test route
connectToMongoDB()
  .then(() => {
    // Mount the submissions router
    console.log("✅ MongoDB connected. Now mounting /submissions.js routes....")
    app.use("/submissions", submissionRouter)

    // Mount the Organizations router
    console.log("Mounting Organizations router.....")
    app.use("/organizations", organizationsRouter)
  })
  .catch((err) => {
    console.error("❌ Failed to connect to MongoDB:", err);
    // We do NOT exit here, since ping/health endpoints can still work.
  });

// -------------- FOR MySQL -----------------------
import { connectToMySQL } from "../database/mysql_db/mysql_connection.js";
import mysqlTestRouter from "./routes/mysql_test_route.js"

connectToMySQL()
  .then((mysqlConnection) => {
    console.log('🚀 Now mounting /mysql_test_route');

    // Inject `mysqlConnection` into req.db for all requests to this route
    app.use('/mysql_test_route', mysqlTestRouter);
  })
  .catch((err) => {
    console.error('❌ MySQL connection failed, skipping /mysql_test_route:');
  });


//Catch malformed JSON bodies
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res
      .status(400)
      .json({ error: "Invalid JSON payload. Please check your request body." });
  }
  next(err);
});

// 6. Start listening
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
});
