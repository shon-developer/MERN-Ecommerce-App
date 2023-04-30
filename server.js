import express from "express";
const app = express();
const PORT = process.env.PORT || 3000;
import dotenv from "dotenv";
import morgan from "morgan";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoute.js";

// configure dotenv
dotenv.config();

//database config
connectDB();

//middlewares
app.use(express.json());
app.use(morgan("dev"));

//routes
app.use("/api/v1/auth", authRoutes);

app.get("/", (req, res) => {
  res.send("<h1>Server is up and running</h1>");
});

app.listen(PORT, (req, res) => {
  console.log(
    `server is running on ${process.env.DEV_MODE} mode on port ${PORT}`
  );
});
