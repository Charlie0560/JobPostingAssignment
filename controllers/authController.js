const Company = require("../models/Company");
const Otp = require("../models/Otp");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");

exports.sendLoginOtp = async (req, res) => {
  const { companyEmail } = req.body;

  if (!companyEmail) {
    return res.status(400).json({ message: "Email is required" });
  }

  const company = await Company.findOne({ companyEmail });
  if (!company) {
    return res.status(404).json({ message: "Company not found with this email" });
  }

  const otp = Math.floor(100000 + Math.random() * 900000);
  await Otp.deleteMany({ email: companyEmail });
  const otpEntry = new Otp({ email: companyEmail, otp });
  await otpEntry.save();

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

exports.verifyLoginOtp = async (req, res) => {
  const { companyEmail, otp } = req.body;
  const numericOtp = Number(otp);

  const storedOTP = await Otp.findOne({ email: companyEmail });
  if (!storedOTP || storedOTP.otp !== numericOtp) {
    return res.status(400).send("Invalid or expired OTP");
  }

  const company = await Company.findOne({ companyEmail });
  if (!company) {
    return res.status(404).send("Company not found");
  }

  const token = jwt.sign({ id: company._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
  await Otp.deleteOne({ email: companyEmail });

  res.status(200).json({ message: "Login successful", token, companyData: company });
};

exports.register = async (req, res) => {
  const { name, phone, companyEmail, companyName, employeeSize } = req.body;

  if (!name || !phone || !companyEmail || !companyName || !employeeSize) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const otp = Math.floor(100000 + Math.random() * 900000);
  await Otp.deleteMany({ email: companyEmail });
  const otpEntry = new Otp({ email: companyEmail, otp });
  await otpEntry.save();

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

exports.verifyOTPAndSave = async (req, res) => {
  const { companyEmail, otp, name, phone, companyName, employeeSize } = req.body;
  const storedOTP = await Otp.findOne({ email: companyEmail });
  if (!storedOTP || storedOTP.otp !== otp) {
    return res.status(400).send("Invalid or expired OTP");
  }

  try {
    const company = new Company({
      name,
      phone,
      companyEmail,
      companyName,
      employeeSize: Number(employeeSize),
      verified: true,
    });

    await company.save();
    await Otp.deleteOne({ email: companyEmail });

    const token = jwt.sign({ id: company._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(201).json({ message: "Company registered successfully", token, companyData: company });
  } catch (error) {
    console.error("Error registering company:", error);
    res.status(500).json({ message: "Error registering company", error });
  }
};

exports.logout = (req, res) => {
  res.status(200).json({ message: "Logout successful" });
};

exports.verifyToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) {
    return res.status(403).json({ message: "No token provided." });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Unauthorized!" });
    }
    req.userId = decoded.id;
    next();
  });
};
