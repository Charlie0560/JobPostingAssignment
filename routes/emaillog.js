const express = require("express");
const emailLogController = require("../controllers/emailLogsController");

const router = express.Router();

router.get("/getlogs", emailLogController.getEmailLogsForCompany); // Route to post a job

module.exports = router;
