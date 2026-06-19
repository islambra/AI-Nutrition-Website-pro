import mongoose from "mongoose";

const connectDB = async () => {
  try {
    mongoose.connection.on("connected", () => console.log("Database Connected"));

    const dbName = "nutrition_app";
    await mongoose.connect(`${process.env.MONGODB_URL}/${dbName}`, {
      retryWrites: true,
      w: "majority"
    });
  } catch (error) {
    console.error("Database connection error:", error.message);
    process.exit(1);
  }
};

export default connectDB;
