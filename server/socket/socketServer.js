import jwt from "jsonwebtoken";
import User from "../models/User.js";
import ChatRoom from "../models/ChatRoom.js";
import Message from "../models/Message.js";

export default function initializeSocket(io) {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) {
        return next(new Error("Authentication required"));
      }
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select("-password");
      if (!user) {
        return next(new Error("User not found"));
      }
      socket.user = user;
      next();
    } catch (err) {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    const user = socket.user;
    const userId = user._id.toString();

    socket.join(`user:${userId}`);

    socket.on("join:chat", async (roomId) => {
      try {
        const room = await ChatRoom.findById(roomId);
        if (!room) {
          socket.emit("error", { message: "Chat room not found" });
          return;
        }
        const isParticipant = room.participants.some(
          (p) => p.user.toString() === userId
        );
        if (!isParticipant) {
          socket.emit("error", { message: "Not a participant in this room" });
          return;
        }
        socket.join(`chat:${roomId}`);
        socket.emit("joined:chat", { roomId });
      } catch (err) {
        socket.emit("error", { message: "Failed to join chat room" });
      }
    });

    socket.on("leave:chat", (roomId) => {
      socket.leave(`chat:${roomId}`);
    });

    socket.on("send:message", async ({ roomId, content }, callback) => {
      try {
        if (!content || !content.trim()) {
          if (callback) callback({ error: "Message content is required" });
          return;
        }

        const room = await ChatRoom.findById(roomId);
        if (!room) {
          if (callback) callback({ error: "Chat room not found" });
          return;
        }

        const isParticipant = room.participants.some(
          (p) => p.user.toString() === userId
        );
        if (!isParticipant) {
          if (callback) callback({ error: "Not a participant" });
          return;
        }

        const message = await Message.create({
          room: roomId,
          sender: userId,
          content: content.trim()
        });

        await message.populate("sender", "fullName photo role email");

        room.lastMessage = {
          content: content.trim(),
          sender: userId,
          timestamp: message.createdAt
        };
        await room.save();

        io.to(`chat:${roomId}`).emit("new:message", message.toObject());

        const otherParticipants = room.participants.filter(
          (p) => p.user.toString() !== userId
        );
        otherParticipants.forEach((p) => {
          io.to(`user:${p.user.toString()}`).emit("new:notification", {
            roomId,
            message: content.trim(),
            senderName: user.fullName
          });
        });

        if (callback) callback({ success: true, message: message.toObject() });
      } catch (err) {
        if (callback) callback({ error: "Failed to send message" });
      }
    });

    socket.on("typing", ({ roomId }) => {
      socket.to(`chat:${roomId}`).emit("typing", {
        roomId,
        userId,
        fullName: user.fullName
      });
    });

    socket.on("stop:typing", ({ roomId }) => {
      socket.to(`chat:${roomId}`).emit("stop:typing", {
        roomId,
        userId
      });
    });

    socket.on("disconnect", () => {});
  });
}
