const mongoose = require('mongoose');

const emailLogSchema = new mongoose.Schema({
    companyId : String,
  to: Array,
  subject: String,
  body: String,
  jobId: String,
  sentAt: { type: Date, default: Date.now }, // Automatically store the time of sending
  sender: String,
});

module.exports = mongoose.model('EmailLog', emailLogSchema);
