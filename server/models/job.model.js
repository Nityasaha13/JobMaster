import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        },
        requirements: [{
            type: String
        }],
        salary: {
            type: Number,
            required: true
        },
        experienceLevel: {
            type: String,
        }, 
        location: {
            type: String,
            required: true
        },
        jobType: {
            type: String,
            required: true
        },
        position: {
            type: Number,
            required: true
        },
        company: { 
            type: String,  // Now stores company name instead of an ObjectId
            required: true
        },
        companyLogo: {
            type: String, // Stores the company logo URL
            required: false
        },
        applyLink: {
            type: String, // Stores the job application link
            required: false
        },
        created_by: { 
            type: String,  // Now stores creator name instead of an ObjectId
            required: true
        },
        applications: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Application',
        }]
    },
    { timestamps: true }
);

export const Job = mongoose.model("Job", jobSchema);
