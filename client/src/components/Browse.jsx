import React, { useEffect, useState } from 'react';
import Navbar from './shared/Navbar';
import Job from './Job';
import { useDispatch, useSelector } from 'react-redux';
import { setSearchedQuery } from '@/redux/jobSlice';
import useGetAllJobs from '@/hooks/useGetAllJobs';
import Footer from './shared/Footer';
import { Button } from './ui/button';
import { Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { Input } from './ui/input';

const Browse = () => {
    useGetAllJobs();
    const dispatch = useDispatch();
    const { allJobs, searchedQuery } = useSelector(store => store.job);  

    const [query, setQuery] = useState('');

    useEffect(() => {
        return () => {
            dispatch(setSearchedQuery(''));
        };
    }, [dispatch]);

    const searchJobHandler = (e) => {
        e.preventDefault();
        dispatch(setSearchedQuery(query));
    };

    return (
        <>
            <div className="bg-gray-900 pt-20 min-h-screen text-white bg-gradient-to-br from-[#00040A] to-[#001636]">
                <Navbar />

                {/* ✅ Search Bar (Now in Browse Page) */}
                <motion.div
                    className="flex w-full sm:w-[70%] lg:w-[50%] shadow-md border border-gray-700 pl-3 pr-2 py-2 rounded-full items-center gap-4 mx-auto mt-12 bg-[#001636] bg-opacity-90"
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <Input
                        type="text"
                        value={query}
                        placeholder="Search by job title or skills"
                        onChange={(e) => setQuery(e.target.value)}
                        className="w-full p-3 outline-none border-none bg-transparent text-white placeholder-gray-400 rounded-full focus:ring-2 focus:ring-blue-500"
                    />
                    <Button
                        onClick={searchJobHandler}
                        className="rounded-full bg-gradient-to-r from-blue-400 to-purple-500 text-white hover:from-blue-500 hover:to-purple-600 px-6 py-3 flex items-center"
                    >
                        <Search className="h-5 w-5 mr-2" />
                        Search
                    </Button>
                </motion.div>

                {/* ✅ Job Listings */}
                <div className='max-w-7xl mx-auto pt-8'>
                    <h1 className='font-bold text-xl my-10'>
                        Search Results ({allJobs.length})
                    </h1>
                    {searchedQuery === '' && allJobs.length === 0 ? (
                        <p className="text-lg text-gray-400">
                            No jobs found. Please adjust your search criteria.
                        </p>
                    ) : (
                        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4'>
                            {allJobs.length > 0 ? (
                                allJobs.map((job) => (
                                    <Job key={job._id} job={job} />
                                ))
                            ) : (
                                <p>No jobs found.</p>
                            )}
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </>
    );
};

export default Browse;
