const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: String,
  description: String,
  experienceLevel: String,
  endDate: Date,
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Job', jobSchema);
