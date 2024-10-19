const EmailLog = require('../models/EmailLog');
const jwt = require('jsonwebtoken');

exports.getEmailLogsForCompany = async (req, res) => {
  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) {
    return res.status(403).json({ message: 'No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const companyId = decoded.id;

    const emailLogs = await EmailLog.find({ companyId }).populate('jobId', 'title');

    res.status(200).json(emailLogs);
  } catch (error) {
    console.error('Error fetching email logs:', error);

    if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({ message: 'Invalid token.' });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(403).json({ message: 'Token has expired.' });
    }

    res.status(500).json({ message: 'Internal server error', error });
  }
};
