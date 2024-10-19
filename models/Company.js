const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  companyEmail: { type: String, unique: true, required: true },
  companyName: { type: String, required: true },
  employeeSize: { type: Number, min: 0 },
  verified: { type: Boolean, default: false },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Company', companySchema);
