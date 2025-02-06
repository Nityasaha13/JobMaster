import React from 'react';
import { motion } from 'framer-motion';
import { Badge } from './ui/badge';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { BookmarkPlus, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const LatestJobCards = ({ job }) => {
    const navigate = useNavigate();

    /**
     * Function to return a valid company logo or a placeholder.
     */
    const getCompanyLogo = () => {
        if (job?.companyLogo && job.companyLogo.trim() !== "") {
            return job.companyLogo;
        }
        return "https://via.placeholder.com/50"; // Fallback logo
    };

    return (
        <motion.div
            className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden shadow-lg transition-all duration-300 cursor-pointer"
            initial={{ opacity: 0, y: 30 }} // Initial state for motion
            animate={{ opacity: 1, y: 0 }} // Animate to final state
            whileHover={{ scale: 1.05, boxShadow: "0px 8px 24px rgba(0, 0, 0, 0.1)" }} // Hover effect
            transition={{ duration: 0.3 }}
        >
            <div className="p-6">
                {/* ✅ Header with Company Logo and Job Title */}
                <div className="flex items-start justify-between">
                    <div className="flex items-center">
                        <img
                            src={getCompanyLogo()} // ✅ Fixed company logo fetching
                            alt={job?.company || "Company Logo"}
                            className="w-12 h-12 rounded-full"
                        />
                        <div className="ml-4">
                            <h3 className="text-lg font-semibold text-white">
                                {job?.title || "Job Title"}
                            </h3>
                            <p className="text-gray-400">{job?.company || "Company Name"}</p>
                        </div>
                    </div>
                    <Button variant="ghost" size="icon">
                        <BookmarkPlus className="h-5 w-5 text-gray-400" />
                    </Button>
                </div>

                {/* ✅ Job Details Section */}
                <div className="mt-4">
                    <div className="flex items-center text-gray-400 mb-2">
                        <Badge variant="secondary" className="mr-2">
                            {job?.jobType || "Job Type"}
                        </Badge>
                        <span className="text-sm">{job?.location || "Location"}</span>
                    </div>
                    <p className="text-gray-300 font-medium">
                        {job?.salary ? `$${job.salary} year` : "Not disclosed"}
                    </p>

                    {/* ✅ Footer with Positions and Apply Link */}
                    <div className="mt-4 flex items-center justify-between">
                        <span className="text-sm text-gray-400">
                            {job?.position ? `${job.position} Positions` : "Not specified"}
                        </span>

                        {/* ✅ Open Apply Link in New Tab */}
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-blue-500"
                            onClick={() => {
                                if (job?.applyLink) {
                                    window.open(job.applyLink, "_blank"); // ✅ Opens job link in a new tab
                                } else {
                                    alert("No apply link available for this job.");
                                }
                            }}
                        >
                            Apply Now
                            <ArrowUpRight className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default LatestJobCards;
