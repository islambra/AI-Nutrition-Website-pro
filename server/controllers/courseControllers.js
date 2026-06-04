import Course from "../models/Course.js";
import User from "../models/User.js";
import imagekit from "../configs/imageKit.js";

export const createCourse = async (req, res) => {
  try {
    const { title, level, semester, url } = req.body;

    if (!title || !level || !semester) {
      return res.status(400).json({ success: false, message: "Title, level, and semester are required" });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    let pdfUrl = null;
    let pdfFileId = null;
    if (req.file) {
      try {
        const base64File = req.file.buffer.toString("base64");
        const uploadResponse = await imagekit.upload({
          file: base64File,
          fileName: `course-${Date.now()}-${req.file.originalname}`,
          folder: "/courses",
        });
        pdfUrl = uploadResponse.url;
        pdfFileId = uploadResponse.fileId;
      } catch (uploadError) {
        return res.status(400).json({ success: false, message: "Failed to upload PDF file" });
      }
    }

    const course = new Course({
      title: title.trim(),
      level: parseInt(level),
      semester: parseInt(semester),
      pdfUrl,
      pdfFileId,
      url: url || undefined,
      createdBy: user._id,
      creatorInfo: {
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        photo: user.photo
      }
    });

    await course.save();

    res.status(201).json({
      success: true,
      message: "Course created successfully",
      course
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || "Failed to create course" });
  }
};

export const getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find().sort({ level: 1, semester: 1, createdAt: -1 });
    res.status(200).json({ success: true, courses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || "Failed to fetch courses" });
  }
};

export const getCoursesByLevel = async (req, res) => {
  try {
    const { level } = req.params;
    const courses = await Course.find({ level: parseInt(level) }).sort({ semester: 1, createdAt: -1 });
    res.status(200).json({ success: true, courses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || "Failed to fetch courses" });
  }
};

export const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const course = await Course.findById(id);

    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    if (course.createdBy.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Not authorized to delete this course" });
    }

    if (course.pdfFileId) {
      try { await imagekit.deleteFile(course.pdfFileId); } catch (_) {}
    }

    await Course.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: "Course deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || "Failed to delete course" });
  }
};
