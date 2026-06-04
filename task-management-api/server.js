var express = require("express");
var cors = require("cors");
var helmet = require("helmet");
var rateLimit = require("express-rate-limit");
var dotenv = require("dotenv");
var bcrypt = require("bcryptjs");
var authRoutes = require("./routes/authRoutes");
var taskRoutes = require("./routes/taskRoutes");
var adminRoutes = require("./routes/adminRoutes");

dotenv.config();

console.log("server.js is starting up");
console.log("PORT from .env is:", process.env.PORT);
console.log("JWT_SECRET exists:", process.env.JWT_SECRET ? "yes" : "no");

var app = express();

// --- Security Middleware ---
app.use(helmet());
console.log("helmet is on");

app.use(cors());
console.log("cors is on");

app.use(express.json());
console.log("express.json is on - can now read request bodies");

// --- Rate Limiting for Auth Routes ---
var authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: "Too many attempts, please try again later" },
});
console.log("rate limiter created - 20 requests per 15 minutes");

// --- In-Memory Data Storage ---
var adminHashedPassword = bcrypt.hashSync("admin123", 10);
console.log("admin password hashed at startup");

var users = [
  {
    id: 1,
    username: "admin",
    email: "admin@test.com",
    password: adminHashedPassword,
    role: "admin",
    createdAt: new Date(),
  },
];

var tasks = [];

var nextUserId = 2;
var nextTaskId = 1;

console.log("in-memory storage ready");
console.log("users array has", users.length, "user (the admin)");
console.log("tasks array is empty and ready");

var nextUserIdObj = { value: nextUserId };
app.use("/api/auth", authRoutes(users, nextUserIdObj));
console.log("auth routes mounted at /api/auth");

var nextTaskIdObj = { value: nextTaskId };
app.use("/api/tasks", taskRoutes(tasks, nextTaskIdObj));
console.log("task routes mounted at /api/tasks");

app.use("/api/admin", adminRoutes(users, tasks));
console.log("admin routes mounted at /api/admin");

// --- Root Route ---
app.get("/", function (req, res) {
  console.log("GET / was hit");
  res.json({
    message: "Task Management API is running",
    version: "1.0.0",
  });
});

// --- 404 Handler ---
app.use(function (req, res) {
  console.log("404 - route not found:", req.method, req.url);
  res.status(404).json({ error: "Route not found" });
});

// --- Global Error Handler ---
app.use(function (err, req, res, next) {
  console.log("global error handler caught an error:", err.message);
  res.status(500).json({ error: "Something went wrong on the server" });
});

// --- Start Server ---
var PORT = process.env.PORT || 3001;

app.listen(PORT, function () {
  console.log("server is running on port", PORT);
  console.log("visit http://localhost:" + PORT + " to check it");
});
