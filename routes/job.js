const express = require("express");
const jobController = require("../controllers/jobPostController");

const router = express.Router();

router.post("/createjob", jobController.createJob); // Route to post a job
router.get("/getjobs", jobController.getAllJobsForCompany); // Route to post a job

module.exports = router;
