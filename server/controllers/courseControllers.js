import Course from "../models/Course.js";
import User from "../models/User.js";
import Payment from "../models/Payment.js";
import CourseSubscription from "../models/CourseSubscription.js";
import PlatformPayment from "../models/PlatformPayment.js";
import imagekit from "../configs/imageKit.js";

const COURSE_SUBSCRIPTION_PRICE = 2499.99;

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

    const pdfs = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        try {
          const base64File = file.buffer.toString("base64");
          const uploadResponse = await imagekit.upload({
            file: base64File,
            fileName: `course-${Date.now()}-${file.originalname}`,
            folder: "/courses",
          });
          pdfs.push({
            url: uploadResponse.url,
            fileId: uploadResponse.fileId,
            fileName: file.originalname,
          });
        } catch (uploadError) {
          return res.status(400).json({ success: false, message: "Failed to upload one or more PDF files" });
        }
      }
    }

    const course = new Course({
      title: title.trim(),
      level: parseInt(level),
      semester: parseInt(semester),
      pdfs,
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
    res.status(500).json({ success: false, message: "Failed to create course" });
  }
};

export const getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find().sort({ level: 1, semester: 1, createdAt: -1 });
    res.status(200).json({ success: true, courses });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch courses" });
  }
};

export const getCoursesByLevel = async (req, res) => {
  try {
    const { level } = req.params;
    const courses = await Course.find({ level: parseInt(level) }).sort({ semester: 1, createdAt: -1 });
    res.status(200).json({ success: true, courses });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch courses" });
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

    if (course.pdfs && course.pdfs.length > 0) {
      for (const pdf of course.pdfs) {
        try { await imagekit.deleteFile(pdf.fileId); } catch (_) {}
      }
    }

    await Course.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: "Course deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete course" });
  }
};

// Get platform payment info for course subscriptions
export const getPlatformPaymentInfo = async (req, res) => {
  try {
    let config = await PlatformPayment.findOne();
    if (!config) {
      config = await PlatformPayment.create({
        ccpNumber: process.env.PLATFORM_CCP_NUMBER || null,
        ccpKey: process.env.PLATFORM_CCP_KEY || null,
        baridiMob: process.env.PLATFORM_BARIDI_MOB || null,
      });
    }
    res.status(200).json({
      success: true,
      data: {
        ccpNumber: config.ccpNumber,
        ccpKey: config.ccpKey,
        baridiMob: config.baridiMob,
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching payment info" });
  }
};

// Initiate course subscription (offline payment with proof)
export const initiateCourseSubscription = async (req, res) => {
  let uploadedFileId = null;
  try {
    const userId = req.user.id;
    const { paymentMethod } = req.body;

    if (!paymentMethod || !["ccp", "baridimob"].includes(paymentMethod)) {
      return res.status(400).json({ success: false, message: "Invalid payment method. Use 'ccp' or 'baridimob'." });
    }

    const existing = await CourseSubscription.findOne({ user: userId });
    if (existing && existing.hasAccess && existing.endDate && new Date(existing.endDate) > new Date()) {
      return res.status(400).json({ success: false, message: "You already have an active subscription" });
    }

    let proofImage = null;
    let proofImageFileId = null;
    if (req.file) {
      const base64 = req.file.buffer.toString("base64");
      const upload = await imagekit.upload({
        file: base64,
        fileName: `course-sub-proof-${Date.now()}-${req.file.originalname}`,
        folder: "/payment-proofs",
      });
      proofImage = upload.url;
      proofImageFileId = upload.fileId;
      uploadedFileId = upload.fileId;
    }

    const payment = await Payment.create({
      user: userId,
      amount: COURSE_SUBSCRIPTION_PRICE,
      paymentMethod,
      status: "pending",
      proofImage,
      proofImageFileId,
      courseSubscription: true
    });

    res.status(201).json({
      success: true,
      message: "Subscription payment proof submitted. Waiting for admin approval.",
      data: payment
    });
  } catch (error) {
    if (uploadedFileId) {
      try { await imagekit.deleteFile(uploadedFileId); } catch (_) {}
    }
    res.status(500).json({ success: false, message: "Error initiating subscription" });
  }
};

// Check if current user has active course subscription access
export const checkCourseAccess = async (req, res) => {
  try {
    const userId = req.user.id;
    const sub = await CourseSubscription.findOne({ user: userId });

    let hasAccess = false;
    if (sub && sub.hasAccess && sub.endDate && new Date(sub.endDate) > new Date()) {
      hasAccess = true;
    }

    res.status(200).json({ success: true, hasAccess });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error checking access" });
  }
};

// Get current user's subscription details
export const getMySubscription = async (req, res) => {
  try {
    const userId = req.user.id;
    const sub = await CourseSubscription.findOne({ user: userId })
      .populate("payment", "amount status paymentMethod createdAt");

    if (!sub) {
      return res.status(200).json({ success: true, data: null });
    }

    const isActive = sub.hasAccess && sub.endDate && new Date(sub.endDate) > new Date();
    const daysRemaining = isActive ? Math.ceil((new Date(sub.endDate) - new Date()) / (1000 * 60 * 60 * 24)) : 0;

    res.status(200).json({
      success: true,
      data: {
        hasAccess: sub.hasAccess,
        isActive,
        startDate: sub.startDate,
        endDate: sub.endDate,
        daysRemaining,
        payment: sub.payment
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching subscription" });
  }
};
