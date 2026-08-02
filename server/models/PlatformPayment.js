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
    type: String,
    default: null,
    trim: true,
    match: [/^\d{20}$/, "BaridiMob must be exactly 20 digits"],
  },
}, { timestamps: true });

platformPaymentSchema.index({ createdAt: -1 });

const PlatformPayment = mongoose.model('PlatformPayment', platformPaymentSchema);

export default PlatformPayment;
