import 'dotenv/config';
import express from "express";
import cors from "cors";
import connectDB from "./configs/db.js";
import userRouter from "./routes/userRoutes.js";
import blogRouter from "./routes/blogRoutes.js";
import contactRouter from "./routes/contactRoutes.js";
import planRouter from "./routes/planRoutes.js";
import paymentRouter from "./routes/paymentRoutes.js";
import consultationRoutes from "./routes/consultationRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import adminRoutes from './routes/adminRoutes.js';
import dieteticienRoutes from './routes/dieteticienRoutes.js';
import courseRoutes from './routes/courseRoutes.js';
import formationRoutes from './routes/formationRoutes.js';
await connectDB();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/user", userRouter);
app.use("/api/blog", blogRouter);
app.use("/api", contactRouter);
app.use("/api/plans", planRouter);
app.use("/api/payments", paymentRouter);
app.use("/api/consultations", consultationRoutes);
app.use("/api/ai", aiRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/dieteticien', dieteticienRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/formations', formationRoutes);

const PORT = 5000;

app.get("/", (req, res) => {
  res.send("server is running");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});