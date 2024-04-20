import express from "express";
import path from "path";
import dotenv from "dotenv";
dotenv.config();
import cookieParser from "cookie-parser";
import cors from "cors";
import morgan from "morgan";
import mySqlPool from "./config/DB.js";
import userRouter from "./routers/userRouter.js";



const port = process.env.PORT || 3000;

const app = express();

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(cookieParser());

app.use(
  cors({
    origin: "*",
  })
);

app.use('/',userRouter)

mySqlPool
  .query("SELECT 1")
  .then(() => {
    console.log("MySQL DB connected ");
    app.listen(port, () => {
      console.log(`Server started on port ${port}`);
    });
  })
  .catch((error) => {
    console.log(error);
  });
