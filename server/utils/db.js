import mongoose from "mongoose";

const connectDB = async() => {
    try {
        await mongoose.connect('mongodb+srv://nitya:nitya@jobmaster.m0s0f.mongodb.net/');
        console.log('new mongodb connected successfully');
    } catch (error) {
        console.log(error);
        console.log("mongo db conntion error")
    }
}
export default connectDB;