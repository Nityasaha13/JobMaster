import React from 'react';
import { Button } from './ui/button';
import { BookmarkPlus, ArrowUpRight } from 'lucide-react';
import { Avatar, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { setsavedJobs } from '@/redux/authSlice';
import { toast } from 'sonner';
import { USER_API_END_POINT } from '@/utils/constant';
import { Card } from '@/components/ui/card';
import axios from 'axios';
import { Description } from '@radix-ui/react-dialog';

const Job = ({ job }) => {
    const { savedJobs } = useSelector(store => store.auth);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    /**
     * Debugging: Check job details in console
     */
    // console.log("Job Data:", job);
    
    /**
     * Function to return the correct company logo.
     */
    const getCompanyLogo = () => {
        if (job?.companyLogo && job.companyLogo.trim() !== "") {
            // console.log("✅ Using API Company Logo:", job.companyLogo);
            return job.companyLogo; // Correctly fetched from API
        }
        console.log("⚠️ No logo found, using placeholder");
        return "https://via.placeholder.com/150"; // Fallback placeholder
    };

    /**
     * Convert MongoDB `createdAt` date to a formatted date string (YYYY-MM-DD).
     */
    const formatDate = (mongodbTime) => {
        if (!mongodbTime) return "Unknown";
        return new Date(mongodbTime).toISOString().split("T")[0]; // Extract YYYY-MM-DD
    };

    /**
     * Handle saving a job for later.
     */
    const handleSaveForLater = async (jobId) => {
        try {
            const response = await axios.post(`${USER_API_END_POINT}/savedjob`, { jobId }, {
                withCredentials: true
            });
            if (response) {
                dispatch(setsavedJobs(response.data.savedJobs));
                toast.success(response.data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error saving job');
        }
    };

    return (
        <motion.div
            className="flex items-stretch gap-4 p-4"
            whileHover={ { scale: 1.05 } }
            initial={ { opacity: 0, y: 20 } }
            animate={ { opacity: 1, y: 0 } }
            transition={ { type: 'spring', stiffness: 300, damping: 20, duration: 0.9 } }
        >
            <Card key={ job.id } className="bg-gray-900 border-gray-800 w-full p-6 rounded-lg shadow-md">
                <div className="flex items-start justify-between">
                    <div className="flex items-center">
                        {/* ✅ Fixed: Displaying the correct Company Logo from API with debugging */}
                        <Avatar>
                            <AvatarImage 
                                src={ getCompanyLogo() } 
                                alt={ job?.company || "Company" } 
                                onError={(e) => { 
                                    // console.error("❌ Image failed to load:", e.target.src);
                                    e.target.src = "https://via.placeholder.com/150"; 
                                }} // Fallback if image fails
                            />
                        </Avatar>
                        <div className="ml-4">
                            <h3 className="text-lg font-semibold text-white">{ job?.title }</h3>
                            <p className="text-gray-400">{ job?.company }</p> {/* ✅ Fixed: Displaying Company Name */}
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={ () => handleSaveForLater(job._id) }
                        style={ { zIndex: 999 } }  // Ensuring button is on top
                    >
                        <BookmarkPlus className="h-5 w-5 text-gray-400" />
                    </Button>
                </div>

                <div className="mt-4">
                    <div className="flex items-center text-gray-400 mb-2">
                        <Badge variant="secondary" className="mr-2">{ job?.position } Positions</Badge>
                        <span className="text-sm">{ job?.location }</span>
                    </div>
                    <p className="text-gray-300 font-medium"> ${ job?.salary } year</p>

                    <div className="mt-4 flex items-center justify-between">
                        {
                            savedJobs?.some(savedJob => savedJob._id.toString() === job?._id.toString()) ?
                                <Button className="bg-green-500 text-white text-xs sm:text-sm py-1 sm:py-2 px-3 sm:px-4">
                                    Saved Already
                                </Button> :
                                <Button className="bg-blue-700 text-white text-xs sm:text-sm py-1 sm:py-2 px-3 sm:px-4"
                                    onClick={ () => handleSaveForLater(job._id) }>
                                    Save For Later
                                </Button>
                        }

                        {/* ✅ Fixed: Displaying "Posted at: YYYY-MM-DD" instead of "X days ago" */}
                        <span className="text-xs sm:text-sm text-gray-400">
                            { formatDate(job?.createdAt) }
                        </span>

                        {/* <Button
                            className="text-blue-400 text-xs sm:text-sm py-1 sm:py-2 px-3 sm:px-4"
                            variant="ghost" size="sm"
                            onClick={ () => navigate(`/description/${job?._id}`) }
                        >
                            Details
                            <ArrowUpRight className="ml-2 h-4 w-4" />
                        </Button> */}
                        <Button
                        className="text-blue-400 text-xs sm:text-sm py-1 sm:py-2 px-3 sm:px-4"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                            if (job?.applyLink) {
                            window.open(job.applyLink, "_blank");
                            } else {
                            window.open(`/description/${job?._id}`);
                            }
                        }}
                        >
                        {job?.applyLink ? 'Apply Link' : 'View Description'}
                        <ArrowUpRight className="ml-2 h-4 w-4" />
                        </Button>


                    </div>
                </div>
            </Card>
        </motion.div>
    );
};

export default Job;
