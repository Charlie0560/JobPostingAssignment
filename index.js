// index.js
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const authRoutes = require("../backend/routes/auth"); // Import your routes
const cors = require("cors");
const { verifyToken } = require("../backend/controllers/authController"); // Adjust the path accordingly


// Load environment variables from .env file
dotenv.config();

// Create an instance of Express
const app = express();

app.use(
  cors({
    credentials: true,
    origin: ["http://localhost:3000"],
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
app.get('/api/auth/verify', verifyToken, (req, res) => {
  res.status(200).send("Token is valid.");
});

// const path = require("path");
// const __dirname1 = path.resolve();
// if ((process.env.NODE_ENV = "production")) {
//     app.use(express.static(path.join(__dirname1, "/frontend/build")));

//     app.get("*", (req, res) => {
//       res.sendFile(path.resolve(__dirname1, "frontend", "build", "index.html"));
//     });
//   } else {
//   }
app.get("/", (req, res) => {
  res.send("API Is Running Successfully");
});
// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
