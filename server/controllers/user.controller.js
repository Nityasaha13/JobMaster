import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import getDataUri from "../utils/datauri.js";
import cloudinary from "../utils/cloudinary.js";

export const register = async(req, res) => {
    try {
        const { fullname, email, password, role, phoneNumber } = req.body;

        console.log(fullname, email, password, role);

        // Check if any required field is missing
        if (!fullname || !email || !password || !role || !phoneNumber) {
            return res.status(400).json({
                message: "Required All Fileds",
                success: false,
            });
        }


        let profilePhotoUrl = null;
        const file = req.file;
        if (file) {
            const fileUri = getDataUri(file);
            const cloudResponse = await cloudinary.uploader.upload(fileUri.content);
            profilePhotoUrl = cloudResponse.secure_url;
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                message: 'User already exists with this email.',
                success: false,
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            fullname,
            email,

            password: hashedPassword,
            role,
            phoneNumber,
            profile: {
                profilePhoto: profilePhotoUrl,
            },
        });

        return res.status(201).json({
            message: "Account created successfully.",
            success: true,
            user: {
                fullname: newUser.fullname,
                email: newUser.email,
                phoneNumber: newUser.phoneNumber,
                role: newUser.role,
                profilePhoto: newUser.profile.profilePhoto,
            },
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Server error",
            success: false,
            error: error.message,
            false: error
        });
    }
};

export const login = async(req, res) => {
    try {
        console.log("Request body received:", req.body);

        const { email, password, role } = req.body;

        if (!email || !password || !role) {
            console.log("Validation failed: Missing fields");
            return res.status(400).json({
                message: "Something is missing",
                success: false,
            });
        }

        console.log("Checking user existence");
        let user = await User.findOne({ email });
        if (!user) {
            console.log("User not found for email:", email);
            return res.status(400).json({
                message: "Incorrect email or password.",
                success: false,
            });
        }

        console.log("Comparing passwords");
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            console.log("Password mismatch for email:", email);
            return res.status(400).json({
                message: "Incorrect email or password.",
                success: false,
            });
        }

        if (role !== user.role) {
            console.log("Role mismatch for user:", email);
            return res.status(400).json({
                message: "Account doesn't exist with current role.",
                success: false,
            });
        }


        const tokenData = { userId: user._id };
        const token = jwt.sign(tokenData, process.env.SECRET_KEY, { expiresIn: '1d' });

        console.log("Returning success response");

        return res
            .status(200)
            .cookie("token", token, {
                maxAge: 24 * 60 * 60 * 1000,
                // httpOnly: true,
                sameSite: 'none',
                secure: true,
            })
            .json({
                message: `Welcome back ${user.fullname}`,
                user,
                success: true,
            });

    } catch (error) {
        console.error("Error in login route:", {
            message: error.message,
            stack: error.stack,
        });

        // Send detailed error in response
        return res.status(500).json({
            message: "Internal Server Error",
            error: error.message, // Add error details here
            success: false,
        });
    }
};


export const logout = async(req, res) => {
    try {
        return res.status(200).cookie("token", "", { maxAge: 0 }).json({
            message: "Logged out successfully.",
            success: true
        })
    } catch (error) {
        console.log(error);
    }
}



export const updateProfile = async(req, res) => {
    try {
        const { fullname, email, phoneNumber, bio, skills } = req.body;
        const file = req.file;
        
        // Cloudinary integration to upload PDF file
        if (file) {
            // Check if the file is a PDF
            if (file.mimetype !== 'application/pdf') {
                return res.status(400).send('Only PDF files are allowed.');
            }
        
            const fileUri = getDataUri(file); // Assuming getDataUri returns { content: base64string, ... }
        
            try {
                // Uploading the file to Cloudinary
                const cloudResponse = await cloudinary.uploader.upload(fileUri.content, {
                    resource_type: "raw", // VERY IMPORTANT for PDFs
                    access_mode: "public", // Make the PDF publicly accessible
                    public_id: `resume-${Date.now()}`, // Unique public_id for the file
                });
        
                console.log("Cloudinary response:", cloudResponse);
        
                // The `secure_url` returned from Cloudinary is already the correct URL to access the PDF
                const publicUrl = cloudResponse.secure_url; // Do not append `.pdf`, Cloudinary already gives the correct URL
                
                console.log("Public URL:", publicUrl);
        
                // Send the public URL to the client or use it as needed
                // Now proceed to update the user's profile
                
                let skillsArray;
                if (skills) {
                    skillsArray = skills.split(",");
                }
                const userId = req.id;
                let user = await User.findById(userId);

                if (!user) {
                    return res.status(400).json({
                        message: "User not found.",
                        success: false
                    });
                }

                // updating user data
                if (fullname) user.fullname = fullname;
                if (email) user.email = email;
                if (phoneNumber) user.phoneNumber = phoneNumber;
                if (bio) user.profile.bio = bio;
                if (skills) user.profile.skills = skillsArray;

                // resume comes later here...
                if (cloudResponse) {
                    // user.profile.resume = cloudResponse.secure_url; // Store Cloudinary URL
                    user.profile.resume = publicUrl; // Store Cloudinary URL
                    user.profile.resumeOriginalName = file.originalname; // Store the original file name
                }

                await user.save();

                // Format the response object
                user = {
                    _id: user._id,
                    fullname: user.fullname,
                    email: user.email,
                    phoneNumber: user.phoneNumber,
                    role: user.role,
                    profile: user.profile
                };

                return res.status(200).json({
                    message: "Profile updated successfully.",
                    user,
                    success: true
                });
            } catch (error) {
                console.error("Error uploading to Cloudinary:", error);
                return res.status(500).send('Error uploading file to Cloudinary.');
            }
        } else {
            return res.status(400).send('No file uploaded.');
        }
    } catch (error) {
        console.log(error);
        return res.status(500).send('Error updating profile.');
    }
};




export const savedJobs = async(req, res) => {
    try {
        const { jobId } = req.body;
        const userId = req.id;

        let user = await User.findById(userId)
        if (!user) {
            return res.status(404).json({
                message: "User not found",
                success: false
            })
        }

        if (user.profile.savedJobs.includes(jobId)) {
            return res.status(400).json({
                message: "Job is already saved",
                success: false
            })
        }

        user.profile.savedJobs.push(jobId);
        await user.save()

        await user.populate('profile.savedJobs');
        return res.status(200).json({
            user,
            message: "Job saved successfully",
            success: true,
            savedJobs: user.profile.savedJobs
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "An error occurred",
            error: error.message,
            success: false
        });

    }
}