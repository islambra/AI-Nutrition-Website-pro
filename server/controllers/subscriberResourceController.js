import SubscriberResource from "../models/SubscriberResource.js";
import imagekit from "../configs/imageKit.js";

export const createResource = async (req, res) => {
  let uploadedFileId = null;
  try {
    const { title, description } = req.body;
    const dieteticienId = req.user.id;

    if (!title) {
      return res.status(400).json({ success: false, message: "Title is required" });
    }

    let fileUrl = null;
    let fileId = null;
    let fileName = null;

    if (req.file) {
      const base64 = req.file.buffer.toString("base64");
      const upload = await imagekit.upload({
        file: base64,
        fileName: `sub-resource-${Date.now()}-${req.file.originalname}`,
        folder: "/subscriber-resources",
      });
      fileUrl = upload.url;
      fileId = upload.fileId;
      fileName = req.file.originalname;
      uploadedFileId = upload.fileId;
    }

    const resource = await SubscriberResource.create({
      dieteticien: dieteticienId,
      title,
      description: description || "",
      fileUrl,
      fileId,
      fileName
    });

    res.status(201).json({ success: true, data: resource });
  } catch (error) {
    if (uploadedFileId) {
      try { await imagekit.deleteFile(uploadedFileId); } catch (_) {}
    }
    res.status(500).json({ success: false, message: "Error creating resource" });
  }
};

export const getMyResources = async (req, res) => {
  try {
    const resources = await SubscriberResource.find({ dieteticien: req.user.id })
      .sort({ createdAt: -1 })
      .lean();
    res.status(200).json({ success: true, data: resources });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching resources" });
  }
};

export const getSubscriberResources = async (req, res) => {
  try {
    const { dieteticienId } = req.params;
    const resources = await SubscriberResource.find({ dieteticien: dieteticienId })
      .sort({ createdAt: -1 })
      .lean();
    res.status(200).json({ success: true, data: resources });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching resources" });
  }
};

export const deleteResource = async (req, res) => {
  try {
    const resource = await SubscriberResource.findOneAndDelete({
      _id: req.params.id,
      dieteticien: req.user.id
    });
    if (!resource) {
      return res.status(404).json({ success: false, message: "Resource not found" });
    }
    if (resource.fileId) {
      try { await imagekit.deleteFile(resource.fileId); } catch (_) {}
    }
    res.status(200).json({ success: true, message: "Resource deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error deleting resource" });
  }
};
