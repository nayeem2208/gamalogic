import express from "express";
import path from "path";
import dotenv from "dotenv";
dotenv.config();
import cookieParser from "cookie-parser";
import cors from "cors";
import morgan from "morgan";
import  mySqlPool from "./config/DB.js";
import userRouter from "./routers/userRouter.js";



const port = process.env.PORT || 3000;

const app = express();

app.use(express.json({ limit: '500mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(cookieParser());


app.use(cors({
  origin: 'https://beta.gamalogic.com'
}));

const __dirname = path.dirname(new URL(import.meta.url).pathname);
app.use(express.static(path.join(__dirname, '..', 'gamalogic', 'dist')));


app.use('/api',userRouter)

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'gamalogic', 'dist', 'index.html'));
});


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
