const Company = require("../models/Company");
const Otp = require("../models/Otp");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");

// Login Function - Step 1: Send OTP
exports.sendLoginOtp = async (req, res) => {
  const { companyEmail } = req.body;

  // Check for required fields
  if (!companyEmail) {
    return res.status(400).json({ message: "Email is required" });
  }

  // Check if the company exists
  const company = await Company.findOne({ companyEmail });
  if (!company) {
    return res.status(404).json({ message: "Company not found with this email" });
  }

  // Generate OTP
  const otp = Math.floor(100000 + Math.random() * 900000); // Generate a 6-digit OTP

  // Store OTP in the database
  await Otp.deleteMany({ email: companyEmail });
  const otpEntry = new Otp({ email: companyEmail, otp });
  await otpEntry.save();

  // Send OTP to email
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL,
    to: companyEmail,
    subject: "Your OTP for Login",
    text: `Your OTP is: ${otp}. Please use this to log in to your account.`,
  };

  transporter.sendMail(mailOptions, (err) => {
    if (err) {
      console.error("Error sending email:", err);
      return res.status(500).send("Email not sent");
    }

    res.status(200).json({ message: "OTP sent to email. Please verify." });
  });
};


// Login Function - Step 2: Verify OTP and Log In
exports.verifyLoginOtp = async (req, res) => {
  const { companyEmail, otp } = req.body;

  // Convert OTP to number format
  const numericOtp = Number(otp);

  // Check if the OTP exists and is valid
  const storedOTP = await Otp.findOne({ email: companyEmail });
  if (!storedOTP || storedOTP.otp !== numericOtp) {
    return res.status(400).send("Invalid or expired OTP");
  }

  // Find the company by email
  const company = await Company.findOne({ companyEmail });
  if (!company) {
    return res.status(404).send("Company not found");
  }

  // Create a JWT token
  const token = jwt.sign({ id: company._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

  // Clean up stored OTP after successful verification
  await Otp.deleteOne({ email: companyEmail });

  res.status(200).json({ message: "Login successful", token });
};

// Registration Function
exports.register = async (req, res) => {
  const { name, phone, companyEmail, companyName, employeeSize, password } = req.body;

  // Check for required fields
  if (!name || !phone || !companyEmail || !companyName || !employeeSize || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // Generate OTP
  const otp = Math.floor(100000 + Math.random() * 900000); // Generate a 6-digit OTP

  // Store OTP in the database
  await Otp.deleteMany({ email: companyEmail });
  const otpEntry = new Otp({ email: companyEmail, otp });
  await otpEntry.save();

  // Send OTP to email
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL,
    to: companyEmail,
    subject: "Your OTP for verification",
    text: `Your OTP is: ${otp}. Please use this to verify your account.`,
  };

  transporter.sendMail(mailOptions, (err) => {
    if (err) {
      console.error("Error sending email:", err);
      return res.status(500).send("Email not sent");
    }

    res.status(200).json({ message: "OTP sent to email. Please verify." });
  });
};

// OTP Verification and Company Registration
exports.verifyOTPAndSave = async (req, res) => {
  const { companyEmail, otp, name, phone, companyName, employeeSize, password } = req.body;

  // Convert OTP and phone to number format
  const numericOtp = Number(otp); // Convert OTP to number
  const numericPhone = Number(phone); // Convert phone to number

  // Check if the OTP exists and is valid
  const storedOTP = await Otp.findOne({ email: companyEmail });
  if (!storedOTP || storedOTP.otp !== numericOtp) {
    return res.status(400).send("Invalid or expired OTP");
  }

  // Hash the password and create the company record
  try {
    const hashedPassword = await bcrypt.hash(password, 10); // Hash the password
    const company = new Company({
      name,
      phone: numericPhone,
      companyEmail,
      companyName,
      employeeSize: Number(employeeSize), // Convert employeeSize to number if applicable
      password: hashedPassword, // Save hashed password
      verified: true, // Mark as verified after OTP
    });

    await company.save();

    // Clean up stored OTP after successful registration
    await Otp.deleteOne({ email: companyEmail });

    // Create a JWT token
    const token = jwt.sign({ id: company._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(201).json({ message: "Company registered successfully", token });
  } catch (error) {
    console.error("Error registering company:", error);
    res.status(500).json({ message: "Error registering company", error });
  }
};

// Logout Function
exports.logout = (req, res) => {
  // If using JWT, simply instruct the client to delete the token
  res.status(200).json({ message: "Logout successful" });
};

// Middleware to verify JWT
exports.verifyToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1]; // Get token from header
  if (!token) {
    return res.status(403).json({ message: "No token provided." });
  }
  
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Unauthorized!" });
    }
    req.userId = decoded.id; // Save user ID in request
    next(); // Proceed to the next middleware
  });
};
