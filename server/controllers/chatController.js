import ChatRoom from "../models/ChatRoom.js";
import Message from "../models/Message.js";
import mongoose from "mongoose";

export const getRooms = async (req, res) => {
  try {
    const userId = req.user._id;
    const rooms = await ChatRoom.find({
      "participants.user": userId
    })
      .populate("participants.user", "fullName photo role email")
      .populate("lastMessage.sender", "fullName photo")
      .sort({ updatedAt: -1 });

    return res.json({ success: true, rooms });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error fetching rooms" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const room = await ChatRoom.findById(id);
    if (!room) {
      return res.status(404).json({ success: false, message: "Room not found" });
    }

    const isParticipant = room.participants.some(
      (p) => p.user.toString() === userId.toString()
    );
    if (!isParticipant) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const messages = await Message.find({ room: id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("sender", "fullName photo role")
      .lean();

    const total = await Message.countDocuments({ room: id });

    return res.json({
      success: true,
      messages: messages.reverse(),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error fetching messages" });
  }
};

export const createRoom = async (req, res) => {
  try {
    const { type, plan, formation, dieteticienSubscription, otherUserId, otherUserRole } = req.body;
    const userId = req.user._id;

    let roomData = { type };

    if (type === "plan") {
      roomData.plan = plan || null;
    } else if (type === "formation") {
      roomData.formation = formation || null;
    } else if (type === "dieteticien") {
      roomData.dieteticienSubscription = dieteticienSubscription || null;
    } else {
      return res.status(400).json({ success: false, message: "Invalid room type" });
    }

    const participantIds = [userId.toString(), otherUserId].sort();
    const existingRoom = await ChatRoom.findOne({
      "participants.user": { $all: participantIds }
    });

    if (existingRoom) {
      return res.json({ success: true, room: existingRoom, existing: true });
    }

    const room = await ChatRoom.create({
      participants: [
        { user: userId, role: req.user.role },
        { user: otherUserId, role: otherUserRole || "dieteticien" }
      ],
      ...roomData
    });

    return res.status(201).json({ success: true, room });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error creating room" });
  }
};

export const deleteRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const room = await ChatRoom.findById(id);
    if (!room) {
      return res.status(404).json({ success: false, message: "Room not found" });
    }

    const isParticipant = room.participants.some(
      (p) => p.user.toString() === userId.toString()
    );
    if (!isParticipant) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    await Message.deleteMany({ room: id });
    await ChatRoom.findByIdAndDelete(id);

    return res.json({ success: true, message: "Room deleted successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error deleting room" });
  }
};
