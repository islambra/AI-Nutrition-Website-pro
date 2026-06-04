import mongoose from "mongoose";

const studentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true
  },
  studentCardNumber: {
    type: String,
    required: true,
    trim: true
  }
}, { timestamps: true });

const Student = mongoose.model("Student", studentSchema);
export default Student;