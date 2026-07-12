import mongoose from "mongoose";

const formationSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String, default: null },
  imageKitFileId: { type: String, default: null },
  files: [{
    name: { type: String },
    url: { type: String },
    type: { type: String, enum: ["pdf", "drive", "link"] },
    fileId: { type: String, default: null }
  }],
  sessionsCount: { type: Number, default: 0 },
  durationWeeks: { type: Number, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, default: null },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  creatorInfo: {
    fullName: String,
    email: String,
    role: String,
    photo: String
  },
  status: { type: String, enum: ["active", "completed", "cancelled"], default: "active" }
}, { timestamps: true });

formationSchema.index({ status: 1, createdAt: -1 });
formationSchema.index({ createdBy: 1 });

const Formation = mongoose.model("Formation", formationSchema);
export default Formation;
