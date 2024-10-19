// models/Otp.js
const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true, // Ensure only one OTP per email
  },
  otp: {
    type: Number,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: '10m' // Automatically remove the document after 10 minutes
  }
});

const Otp = mongoose.model('Otp', otpSchema);
module.exports = Otp;
