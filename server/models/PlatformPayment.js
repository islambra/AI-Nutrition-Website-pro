import mongoose from 'mongoose';

const platformPaymentSchema = new mongoose.Schema({
  ccpNumber: {
    type: String,
    default: null,
    trim: true,
  },
  ccpKey: {
    type: String,
    default: null,
    trim: true,
  },
  baridiMob: {
    type: Number,
    default: null,
  },
}, { timestamps: true });

platformPaymentSchema.index({ createdAt: -1 });

const PlatformPayment = mongoose.model('PlatformPayment', platformPaymentSchema);

export default PlatformPayment;
