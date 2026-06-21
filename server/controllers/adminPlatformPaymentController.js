import PlatformPayment from '../models/PlatformPayment.js';

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
    res.status(500).json({ success: false, message: 'Error fetching platform payment info' });
  }
};

export const updatePlatformPaymentInfo = async (req, res) => {
  try {
    const { ccpNumber, ccpKey, baridiMob } = req.body;

    if (!ccpNumber && !ccpKey && !baridiMob) {
      return res.status(400).json({ success: false, message: 'At least one field must be provided' });
    }

    const config = await PlatformPayment.findOneAndUpdate(
      {},
      { $set: { ccpNumber, ccpKey, baridiMob } },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Platform payment info updated successfully',
      data: {
        ccpNumber: config.ccpNumber,
        ccpKey: config.ccpKey,
        baridiMob: config.baridiMob,
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating platform payment info' });
  }
};
