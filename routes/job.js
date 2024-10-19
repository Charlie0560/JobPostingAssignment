const express = require("express");
const jobController = require("../controllers/jobPostController");

const router = express.Router();

router.post("/createjob", jobController.createJob); 
router.get("/getjobs", jobController.getAllJobsForCompany);
router.get("/:jobId", jobController.getJobDetailsById); 

module.exports = router;
