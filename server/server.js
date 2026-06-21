import 'dotenv/config';
import express from "express";
import cors from "cors";
import helmet from "helmet";
import hpp from "hpp";
import { createServer } from "http";
import { Server } from "socket.io";
import connectDB from "./configs/db.js";
import { globalLimiter, authLimiter, apiLimiter } from "./middleware/rateLimiter.js";
import { errorHandler } from "./middleware/errorHandler.js";

import userRouter from "./routes/userRoutes.js";
import blogRouter from "./routes/blogRoutes.js";
import contactRouter from "./routes/contactRoutes.js";
import planRouter from "./routes/planRoutes.js";
import paymentRouter from "./routes/paymentRoutes.js";
import consultationRoutes from "./routes/consultationRoutes.js";
import adminRoutes from './routes/adminRoutes.js';
import dieteticienRoutes from './routes/dieteticienRoutes.js';
import courseRoutes from './routes/courseRoutes.js';
import formationRoutes from './routes/formationRoutes.js';
import aiToolRoutes from './routes/aiToolRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import passwordResetRoutes from './routes/passwordResetRoutes.js';
import initializeSocket from './socket/socketServer.js';

await connectDB();

const app = express();

const NODE_ENV = process.env.NODE_ENV || 'development';

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      imgSrc: ["'self'", "data:", "blob:", "https://ik.imagekit.io", "https://*.cloudinary.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      connectSrc: ["'self'", "https://ik.imagekit.io", "https://api.zoom.us", "wss://*.localhost:*"],
      frameSrc: ["'self'", "https://zoom.us"],
      objectSrc: ["'none'"]
    }
  }
}));

const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(',').map(o => o.trim())
  : ["http://localhost:5173", "http://localhost:4173", "http://127.0.0.1:5173"];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

const sanitizeValue = (val, path = '') => {
  if (!val || typeof val !== 'object') return;
  if (Array.isArray(val)) {
    val.forEach((item, i) => sanitizeValue(item, `${path}[${i}]`));
    return;
  }
  for (const key of Object.keys(val)) {
    const sanitizedKey = key.replace(/[$]/g, '_').replace(/[.]/g, '_');
    if (sanitizedKey !== key) {
      val[sanitizedKey] = val[key];
      delete val[key];
      console.warn(`[SECURITY] NoSQL injection attempt blocked on ${path}: key=${key}`);
    }
    sanitizeValue(val[sanitizedKey], `${path}.${sanitizedKey}`);
  }
};
app.use((req, _res, next) => {
  if (req.body) sanitizeValue(req.body, 'req.body');
  if (req.params) sanitizeValue(req.params, 'req.params');
  if (req.query) sanitizeValue(req.query, 'req.query');
  next();
});

app.use(hpp());

app.use(globalLimiter);

app.disable('x-powered-by');

app.use("/api/user/login", authLimiter);
app.use("/api/user", apiLimiter);
app.use("/api/admin", apiLimiter);

app.use("/api/user", userRouter);
app.use("/api/blog", blogRouter);
app.use("/api", contactRouter);
app.use("/api/plans", planRouter);
app.use("/api/payments", paymentRouter);
app.use("/api/consultations", consultationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/dieteticien', dieteticienRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/formations', formationRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/ai-tool', aiToolRoutes);
app.use('/api/password-reset', passwordResetRoutes);

const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.json({ message: "BiteWise Nutrition API", version: "1.0.0" });
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

app.use(errorHandler);

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  }
});

initializeSocket(io);

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT} [${NODE_ENV}]`);
});
