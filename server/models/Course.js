import mongoose from "mongoose";

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  level: {
    type: Number,
    required: true,
    enum: [1, 2, 3]
  },
  semester: {
    type: Number,
    required: true,
    enum: [1, 2]
  },
  pdfUrl: {
    type: String,
    default: null
  },
  pdfFileId: {
    type: String,
    default: null
  },
  url: {
    type: String,
    default: null
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  creatorInfo: {
    fullName: String,
    email: String,
    role: String,
    photo: String
  }
}, { timestamps: true });

courseSchema.index({ level: 1, semester: 1 });

const Course = mongoose.model("Course", courseSchema);
export default Course;
