import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  photo: {
    type: String,
    default: null
  },
  imageKitFileId: {
    type: String,
    default: null
  },
  role: {
    type: String,
    enum: ["admin", "dieteticien", "client", "student"],
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  passwordResetToken: {
    type: String,
    default: undefined
  },
  passwordResetExpires: {
    type: Date,
    default: undefined
  }
});

userSchema.index({ role: 1, createdAt: -1 });
userSchema.index({ passwordResetToken: 1 });

const User = mongoose.model("User", userSchema);
export default User;