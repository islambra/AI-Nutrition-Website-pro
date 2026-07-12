import mongoose from "mongoose";

const userFormationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  formation: { type: mongoose.Schema.Types.ObjectId, ref: "Formation", required: true },
  payment: { type: mongoose.Schema.Types.ObjectId, ref: "Payment" },
  purchasedAt: { type: Date, default: Date.now }
});

userFormationSchema.index({ user: 1 });
userFormationSchema.index({ formation: 1 });

const UserFormation = mongoose.model("UserFormation", userFormationSchema);
export default UserFormation;
