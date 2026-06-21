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
  },
}, { timestamps: true });

const PlatformPayment = mongoose.model('PlatformPayment', platformPaymentSchema);

export default PlatformPayment;
