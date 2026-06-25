import Formation from "../models/Formation.js";
import FormationSession from "../models/FormationSession.js";
import UserFormation from "../models/UserFormation.js";
import { createZoomMeeting } from "../utils/zoom.js";
import imagekit from "../configs/imageKit.js";

const safeJsonParse = (str, fallback) => {
  if (typeof str !== 'string') return str;
  try { return JSON.parse(str); } catch { return fallback; }
};

// --- FORMATIONS ---

const handleFileUploads = async (files, uploadedMap) => {
  const results = [];
  for (let i = 0; i < files.length; i++) {
    const entry = { ...files[i] };
    if (uploadedMap[i]) {
      const file = uploadedMap[i];
      const base64 = file.buffer.toString("base64");
      const uploadRes = await imagekit.upload({
        file: base64,
        fileName: `formation-file-${Date.now()}-${file.originalname}`,
        folder: "/formations/files",
      });
      entry.url = uploadRes.url;
      entry.fileId = uploadRes.fileId;
    }
    results.push(entry);
  }
  return results;
};

export const createFormation = async (req, res) => {
  try {
    const { title, description, price, files, sessionsCount, durationWeeks, startDate } = req.body;
    const user = req.user;

    const imageFile = req.files?.find(f => f.fieldname === "image");
    let imageUrl = null;
    let imageKitFileId = null;
    if (imageFile) {
      const base64Image = imageFile.buffer.toString("base64");
      const uploadResponse = await imagekit.upload({
        file: base64Image,
        fileName: `${Date.now()}-${imageFile.originalname}`,
        folder: "/formations",
      });
      imageUrl = uploadResponse.url;
      imageKitFileId = uploadResponse.fileId;
    }

    const parsedFiles = typeof files === "string" ? safeJsonParse(files, []) : files || [];

    const uploadedMap = {};
    for (const f of req.files || []) {
      const match = f.fieldname.match(/^file_(\d+)$/);
      if (match) uploadedMap[match[1]] = f;
    }

    const finalFiles = await handleFileUploads(parsedFiles, uploadedMap);

    const formation = await Formation.create({
      title,
      description,
      price: Number(price),
      image: imageUrl,
      imageKitFileId,
      files: finalFiles,
      sessionsCount: Number(sessionsCount) || 0,
      durationWeeks: Number(durationWeeks),
      startDate,
      createdBy: user.id,
      creatorInfo: {
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        photo: user.photo
      }
    });

    res.status(201).json({ success: true, data: formation });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error creating formation" });
  }
};

export const getFormations = async (req, res) => {
  try {
    const formations = await Formation.find({ status: "active" }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: formations });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching formations" });
  }
};

export const getFormationById = async (req, res) => {
  try {
    const formation = await Formation.findById(req.params.id);
    if (!formation) return res.status(404).json({ success: false, message: "Formation not found" });
    res.status(200).json({ success: true, data: formation });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching formation" });
  }
};

export const updateFormation = async (req, res) => {
  try {
    const formation = await Formation.findById(req.params.id);
    if (!formation) return res.status(404).json({ success: false, message: "Formation not found" });
    if (formation.createdBy.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    const imageFile = req.files?.find(f => f.fieldname === "image");
    if (imageFile) {
      const base64Image = imageFile.buffer.toString("base64");
      const uploadResponse = await imagekit.upload({
        file: base64Image,
        fileName: `${Date.now()}-${imageFile.originalname}`,
        folder: "/formations",
      });
      if (formation.imageKitFileId) {
        try { await imagekit.deleteFile(formation.imageKitFileId); } catch (_) {}
      }
      formation.image = uploadResponse.url;
      formation.imageKitFileId = uploadResponse.fileId;
    }

    const { files, price, sessionsCount, durationWeeks, ...rest } = req.body;
    Object.assign(formation, rest);

    if (files !== undefined) {
      const parsedFiles = typeof files === "string" ? safeJsonParse(files, []) : files;

      for (const oldFile of formation.files || []) {
        if (oldFile.fileId) {
          const stillReferenced = parsedFiles.some(f => f.fileId === oldFile.fileId);
          if (!stillReferenced) {
            try { await imagekit.deleteFile(oldFile.fileId); } catch (_) {}
          }
        }
      }

      const uploadedMap = {};
      for (const f of req.files || []) {
        const match = f.fieldname.match(/^file_(\d+)$/);
        if (match) uploadedMap[match[1]] = f;
      }

      formation.files = await handleFileUploads(parsedFiles, uploadedMap);
    }

    if (price !== undefined) formation.price = Number(price);
    if (sessionsCount !== undefined) formation.sessionsCount = Number(sessionsCount);
    if (durationWeeks !== undefined) formation.durationWeeks = Number(durationWeeks);
    await formation.save();
    res.status(200).json({ success: true, data: formation });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error updating formation" });
  }
};

export const deleteFormation = async (req, res) => {
  try {
    const formation = await Formation.findById(req.params.id);
    if (!formation) return res.status(404).json({ success: false, message: "Formation not found" });
    if (formation.createdBy.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    if (formation.imageKitFileId) {
      try { await imagekit.deleteFile(formation.imageKitFileId); } catch (_) {}
    }
    for (const file of formation.files || []) {
      if (file.fileId) {
        try { await imagekit.deleteFile(file.fileId); } catch (_) {}
      }
    }
    await FormationSession.deleteMany({ formation: formation._id });
    await UserFormation.deleteMany({ formation: formation._id });
    await formation.deleteOne();
    res.status(200).json({ success: true, message: "Formation deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error deleting formation" });
  }
};

export const getMyFormations = async (req, res) => {
  try {
    const formations = await Formation.find({ createdBy: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: formations });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching formations" });
  }
};

// --- SESSIONS ---

export const createSession = async (req, res) => {
  try {
    const { title, description, startTime, endTime } = req.body;
    const formation = await Formation.findById(req.params.formationId);
    if (!formation) return res.status(404).json({ success: false, message: "Formation not found" });
    if (formation.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    const sessionCount = await FormationSession.countDocuments({ formation: formation._id });

    let meeting = null;
    try {
      const topic = `${formation.title} - Session ${sessionCount + 1}`;
      meeting = await createZoomMeeting(topic, new Date(startTime).toISOString(), 60);
    } catch (zoomError) {
      console.error("Zoom creation failed (session will be created without link):", zoomError.message);
    }

    const session = await FormationSession.create({
      formation: formation._id,
      title,
      description,
      startTime,
      endTime,
      order: sessionCount + 1,
      zoomLink: meeting?.joinUrl || null,
      zoomStartUrl: meeting?.startUrl || null,
      meetingId: meeting?.zoomMeetingId || null,
      meetingPassword: meeting?.password || null
    });

    await formation.save();

    res.status(201).json({ success: true, data: session });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error creating session" });
  }
};

export const getSessions = async (req, res) => {
  try {
    const sessions = await FormationSession.find({ formation: req.params.formationId }).sort({ order: 1 });
    res.status(200).json({ success: true, data: sessions });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching sessions" });
  }
};

export const updateSession = async (req, res) => {
  try {
    const session = await FormationSession.findById(req.params.sessionId).populate("formation");
    if (!session) return res.status(404).json({ success: false, message: "Session not found" });
    if (session.formation.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    Object.assign(session, req.body);
    await session.save();
    res.status(200).json({ success: true, data: session });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error updating session" });
  }
};

export const deleteSession = async (req, res) => {
  try {
    const session = await FormationSession.findById(req.params.sessionId).populate("formation");
    if (!session) return res.status(404).json({ success: false, message: "Session not found" });
    if (session.formation.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    await session.deleteOne();
    res.status(200).json({ success: true, message: "Session deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error deleting session" });
  }
};

// --- PURCHASE (removed - now handled via unified /api/payments/buy endpoint) ---

export const getMyPurchasedFormations = async (req, res) => {
  try {
    const userFormations = await UserFormation.find({ user: req.user.id })
      .populate("formation")
      .sort({ purchasedAt: -1 });

    const result = await Promise.all(userFormations.map(async (uf) => {
      const sessions = await FormationSession.find({ formation: uf.formation._id }).sort({ order: 1 });
      return { ...uf.toObject(), sessions };
    }));

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error processing formation" });
  }
};

export const checkFormationOwnership = async (req, res) => {
  try {
    const uf = await UserFormation.findOne({ user: req.user.id, formation: req.params.id });
    res.status(200).json({ success: true, owns: !!uf });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error checking formation ownership" });
  }
};
