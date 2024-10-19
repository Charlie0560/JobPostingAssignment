// index.js
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const authRoutes = require("./routes/auth"); // Import your routes
const jobRoutes = require("./routes/job"); // Import your routes
const emailLogRoutes = require("./routes/emaillog"); // Import your routes
const cors = require("cors");
const { verifyToken } = require("./controllers/authController"); // Adjust the path accordingly


// Load environment variables from .env file
dotenv.config();

// Create an instance of Express
const app = express();

app.use(
  cors({
    credentials: true,
    origin: ["http://localhost:3000","https://job-posting-frontend-xi.vercel.app"],
  })
);
// Middleware
app.use(bodyParser.json()); // Parse JSON bodies

// MongoDB connection
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Define routes
app.use("/api/auth", authRoutes); // Mount the auth routes under the /api/auth path
app.use("/api/jobs", jobRoutes); // Register the job routes
app.use("/api/emailLogs", emailLogRoutes); // Register the job routes
app.get('/api/auth/verify', verifyToken, (req, res) => {
  res.status(200).send("Token is valid.");
});

app.get("/", (req, res) => {
  res.send("API Is Running Successfully");
});
// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
