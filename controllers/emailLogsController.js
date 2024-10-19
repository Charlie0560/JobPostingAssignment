const EmailLog = require('../models/EmailLog');
const jwt = require('jsonwebtoken');

// Function to get all email logs for a specific company
exports.getEmailLogsForCompany = async (req, res) => {
  const token = req.body.token

  // Verify the token and extract company ID
  if (!token) {
    return res.status(403).json({ message: "No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const companyId = decoded.id;

    // Find email logs associated with the company
    const emailLogs = await EmailLog.find({ companyId }).populate('companyId', 'companyName').populate('jobId', 'title');

    if (emailLogs.length === 0) {
      return res.status(404).json({ message: "No email logs found for this company." });
    }

    res.status(200).json({ emailLogs });
  } catch (error) {
    console.error("Error verifying token or fetching email logs:", error);
    res.status(500).json({ message: "Error fetching email logs", error });
  }
};
