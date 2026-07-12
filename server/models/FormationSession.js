import mongoose from "mongoose";

const formationSessionSchema = new mongoose.Schema({
  formation: { type: mongoose.Schema.Types.ObjectId, ref: "Formation", required: true },
  title: { type: String, required: true },
  description: { type: String, default: "" },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  zoomLink: { type: String, default: null },
  zoomStartUrl: { type: String, default: null },
  meetingId: { type: String, default: null },
  meetingPassword: { type: String, default: null },
  order: { type: Number, default: 0 },
  videoUrl: { type: String, default: null },
  isPreview: { type: Boolean, default: false }
}, { timestamps: true });

formationSessionSchema.index({ formation: 1, order: 1 });

const FormationSession = mongoose.model("FormationSession", formationSessionSchema);
export default FormationSession;
