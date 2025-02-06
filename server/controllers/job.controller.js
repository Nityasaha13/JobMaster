import { Job } from "../models/job.model.js";
import https from "https";



export const postJob = async(req, res) => {
    try {
        const { title, description, requirements, salary, location, jobType, experience, position, companyId } = req.body;
        const userId = req.id;

        if (!title || !description || !requirements || !salary || !location || !jobType || !experience || !position || !companyId) {
            return res.status(400).json({
                message: "Somethin is missing.",
                success: false
            })
        };
        const job = await Job.create({
            title,
            description,
            requirements: requirements.split(","),
            salary: Number(salary),
            location,
            jobType,
            experienceLevel: experience,
            position,
            company: companyId,
            created_by: userId
        });
        return res.status(201).json({
            message: "New job created successfully.",
            job,
            success: true
        });
    } catch (error) {
        console.log(error);
    }
}

export const getAllJobs = async(req, res) => {
        try {
            const keyword = req.query.keyword || "";
            const query = {
                $or: [
                    { title: { $regex: keyword, $options: "i" } },
                    { description: { $regex: keyword, $options: "i" } },
                ]
            };
            const jobs = await Job.find(query).populate({
                path: "company"
            }).sort({ createdAt: -1 });
            if (!jobs) {
                return res.status(404).json({
                    message: "Jobs not found.",
                    success: false
                })
            };
            return res.status(200).json({
                jobs,
                success: true
            })
        } catch (error) {
            console.log(error);
        }
    }
    // student
export const getJobById = async(req, res) => {
        try {
            const jobId = req.params.id;
            const job = await Job.findById(jobId).populate({
                path: "applications"
            });
            if (!job) {
                return res.status(404).json({
                    message: "Jobs not found.",
                    success: false
                })
            };
            return res.status(200).json({ job, success: true });
        } catch (error) {
            console.log(error);
        }
    }
    // all job created by specific admin
export const getAdminJobs = async(req, res) => {
    try {
        const adminId = req.id;
        const jobs = await Job.find({ created_by: adminId }).populate({
            path: 'company',
            createdAt: -1
        });
        if (!jobs) {
            return res.status(404).json({
                message: "Jobs not found.", 
                success: false
            })
        };
        return res.status(200).json({
            jobs,
            success: true
        })
    } catch (error) {
        console.log(error);
    }
}

export const deleteJob = async(req, res) => {
    const { jobId } = req.body;

    if (!jobId) {
        return res.status(400).json({ message: 'Job ID is required' });
    }

    try {
        // Find and delete the job by its ID
        const deletingJob = await Job.findByIdAndDelete(jobId);

        if (!deletingJob) {
            return res.status(404).json({ message: 'Job not found' });
        }
        const remainingJobs = await Job.find();



        return res.status(200).json({
            message: 'Job deleted successfully',
            remainingJobs,
        });
    } catch (error) {
        console.error('Error deleting job:', error);
        return res.status(500).json({
            message: 'Error deleting the job',
            error: error.message
        });
    }
};


/**
 * Fetch jobs from RapidAPI and save them to the database.
 */
export const fetchAndSaveJobs = async (req, res) => {
    try {
        const options = {
            method: "GET",
            hostname: "linkedin-jobs-api2.p.rapidapi.com",
            port: null,
            path: "/active-jb-24h?title_filter=%22Data%20Engineer%22&location_filter=%22United%20States%22",
            headers: {
                "x-rapidapi-key": process.env.RAPIDAPI_KEY, // Store in .env
                "x-rapidapi-host": "linkedin-jobs-api2.p.rapidapi.com",
            },
        };

        const request = https.request(options, (response) => {
            let chunks = [];

            response.on("data", (chunk) => {
                chunks.push(chunk);
            });

            response.on("end", async () => {
                try {
                    const body = Buffer.concat(chunks).toString();
                    const apiData = JSON.parse(body);

                    if (!apiData || !Array.isArray(apiData)) {
                        return res.status(400).json({ message: "Invalid API response" });
                    }

                    // Format and map data to job schema
                    const jobsToInsert = apiData.map(job => ({
                        title: job.title,
                        description: job.linkedin_org_description || "No description available.",
                        requirements: job.linkedin_org_specialties || [],
                        salary: job.salary_raw?.value?.minValue || 0, // Using minValue as salary
                        experienceLevel: job.seniority || "N/A",
                        location: job.locations_derived?.[0] || "Unknown",
                        jobType: job.employment_type?.[0] || "Unknown",
                        position: 1, // Default position value, update as needed
                        company: job.organization || "Unknown Company", // Fetch company name
                        companyLogo: job.organization_logo || "", // Fetch company logo
                        applyLink: job.url || "", // Fetch job application link
                        created_by: "Admin", // Placeholder user name
                        applications: [],
                    }));

                    // Insert into database
                    const insertedJobs = await Job.insertMany(jobsToInsert);

                    return res.status(201).json({
                        message: "Jobs successfully fetched and saved.",
                        jobs: insertedJobs,
                    });
                } catch (error) {
                    console.error("Error processing API response:", error);
                    return res.status(500).json({ message: "Error processing API response" });
                }
            });
        });

        request.on("error", (error) => {
            console.error("Error fetching jobs:", error);
            return res.status(500).json({ message: "Error fetching jobs", error: error.message });
        });

        request.end();

    } catch (error) {
        console.error("Server error:", error);
        return res.status(500).json({ message: "Server error", error: error.message });
    }
};