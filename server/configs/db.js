import mongoose from "mongoose"

const connectDB = async () =>{
    try {
        mongoose.connection.on("connected", ()=> console.log("Database Connected"));
        
        const dbName = "nutrition_app"; 
        await mongoose.connect(`${process.env.MONGODB_URL}/${dbName}`)
        
    } catch (error) {
        console.log(error.message);
    }
}

export default connectDB