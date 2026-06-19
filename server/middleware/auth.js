import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { securityLogger } from "./securityLogger.js";

const getClientIp = (req) => {
  return req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip || req.socket?.remoteAddress || 'unknown';
};

export const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: "Not authorized. Please log in to continue." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      securityLogger.suspiciousActivity(getClientIp(req), decoded.id, 'Token with non-existent user');
      return res.status(401).json({ success: false, message: "User no longer exists." });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      securityLogger.suspiciousActivity(getClientIp(req), null, 'Expired token used');
      return res.status(401).json({ success: false, message: "Token expired. Please log in again." });
    }
    if (error.name === 'JsonWebTokenError') {
      securityLogger.suspiciousActivity(getClientIp(req), null, 'Invalid JWT signature');
    }
    return res.status(401).json({ success: false, message: "Not authorized. Invalid token." });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Not authorized." });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: "Access denied. Insufficient permissions." });
    }
    next();
  };
};

export const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }
  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password");
  } catch (_) {
    // Silently continue without user
  }
  next();
};
