import 'dotenv/config';
import express from "express";
import cors from "cors";
import connectDB from "./configs/db.js";
import userRouter from "./routes/userRoutes.js";
import blogRouter from "./routes/blogRoutes.js";
import contactRouter from "./routes/contactRoutes.js";
import planRouter from "./routes/planRoutes.js";

await connectDB();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/user", userRouter);
app.use("/api/blog", blogRouter);
app.use("/api", contactRouter);
app.use("/api/plans", planRouter);

const PORT = 5000;

app.get("/", (req, res) => {
  res.send("server is running");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
