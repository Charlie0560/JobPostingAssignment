const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const authRoutes = require("./routes/auth");
const jobRoutes = require("./routes/job");
const emailLogRoutes = require("./routes/emaillog");
const cors = require("cors");
const { verifyToken } = require("./controllers/authController");

dotenv.config();
const app = express();

app.use(
  cors({
    credentials: true,
    origin: ["http://localhost:3000", "https://job-posting-frontend-79voruqrb.vercel.app","https://job-posting-frontend-xi.vercel.app"],
  })
);

app.use(bodyParser.json());

mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/emailLogs", emailLogRoutes);
app.get('/api/auth/verify', verifyToken, (req, res) => {
  res.status(200).send("Token is valid.");
});

app.get("/", (req, res) => {
  res.send("API Is Running Successfully");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
