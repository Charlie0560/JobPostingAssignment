const express = require("express");
const emailLogController = require("../controllers/emailLogsController");

const router = express.Router();

router.get("/getlogs", emailLogController.getEmailLogsForCompany); 

module.exports = router;
