const Job = require("../models/Job");
const Company = require("../models/Company");
const EmailLog = require("../models/EmailLog");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");

exports.createJob = async (req, res) => {
  const {
    title,
    description,
    experienceLevel,
    endDate,
    emailRecipients,
  } = req.body;
  const token = req.headers["authorization"]?.split(" ")[1];

  if (!token) {
    return res.status(403).json({ message: "No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const companyId = decoded.id;

    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    const newJob = new Job({
      title,
      description,
      experienceLevel,
      endDate,
      companyId: company._id,
    });
    await newJob.save();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL,
      to: emailRecipients,
      subject: `New Job Posting from ${company.companyName}`,
      text: `
        Company: ${company.companyName}
        Title: ${title}
        Description: ${description}
        Experience Level: ${experienceLevel}
        End Date: ${newJob.endDate}
      `,
    };

    transporter.sendMail(mailOptions, async (err, info) => {
      if (err) {
        console.error("Error sending email:", err);
        return res.status(500).json({ message: "Error sending email", error: err });
      }

      const emailLog = new EmailLog({
        companyId: company._id,
        subject: mailOptions.subject,
        to: emailRecipients,
        jobId: newJob._id,
        sender: company.companyEmail,
        sentAt: new Date(),
        body: mailOptions.text,
      });
      await emailLog.save();
      res.status(201).json({ message: "Job posted and emails sent successfully." });
    });
  } catch (error) {
    console.error("Error verifying token or creating job post:", error);
    res.status(500).json({ message: "Error creating job post", error });
  }
};

exports.getAllJobsForCompany = async (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1];

  if (!token) {
    return res.status(403).json({ message: "No token provided." });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const companyId = decoded.id;

    const jobs = await Job.find({ companyId: companyId }).populate("companyId", "companyName");

    if (jobs.length === 0) {
      return res.status(404).json({ message: "No jobs found for this company." });
    }

    res.status(200).json({ jobs });
  } catch (error) {
    console.error("Error verifying token or fetching jobs:", error);
    res.status(500).json({ message: "Error fetching jobs", error });
  }
};

exports.getJobDetailsById = async (req, res) => {
  const { jobId } = req.params;

  try {
    const job = await Job.findById(jobId).populate('companyId', 'companyName');
    
    if (!job) {
      return res.status(404).json({ message: "Job not found." });
    }

    res.status(200).json({ job });
  } catch (error) {
    console.error("Error fetching job details:", error);
    res.status(500).json({ message: "Error fetching job details", error });
  }
};
    