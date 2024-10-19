// models/Company.js
const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  name: { type: String, required: true }, // The name of the contact person or representative
  phone: { type: String, required: true }, // Phone number of the company
  companyEmail: { type: String, unique: true, required: true }, // Email address of the company
  companyName: { type: String, required: true }, // Official name of the company
  employeeSize: { type: Number, min: 0 }, // Number of employees in the company
  verified: { type: Boolean, default: false }, // Verification status
});

// Create and export the Company model
module.exports = mongoose.model('Company', companySchema);
