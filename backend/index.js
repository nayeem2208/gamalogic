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


morgan.token('ip', req => {
  return req.headers['cf-connecting-ip'] || 
         req.headers['x-real-ip'] || 
         req.headers['x-forwarded-for'] || 
         req.socket.remoteAddress || '';
});
morgan.token('date', () => new Date().toISOString());
app.use(express.json({ limit: '500mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(":date[iso] :method :url :status :res[content-length] - :response-time ms  :ip"));
app.use(cookieParser());


app.use(cors({
  origin: process.env.FRONTEND_URL
}));

const noCache = (req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
};

const __dirname = path.dirname(new URL(import.meta.url).pathname);
// app.use(express.static(path.join(__dirname, '..', 'gamalogic', 'dist')));
app.use(express.static(path.join(__dirname, '..', 'gamalogic', 'dist'), {
  setHeaders: (res, path) => {
    if (path.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-store'); // Disable caching for HTML files
    } else {
      res.setHeader('Cache-Control', 'max-age=31536000'); // Cache other assets (JS, CSS, etc.) for 1 year
    }
  }
}));


app.get('/signin-sitemap.xml', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'gamalogic', 'public', 'signin-sitemap.xml'));
});

app.get('/signup-sitemap.xml', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'gamalogic', 'public', 'signup-sitemap.xml'));
});

app.get('/forgot-password-sitemap.xml', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'gamalogic', 'public', 'forgot-password-sitemap.xml'));
});

app.get('/sitemap.xml',(req, res) => {
  res.sendFile(path.join(__dirname, '..', 'gamalogic', 'public', 'sitemap.xml'));
})

app.use('/api',userRouter)

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'gamalogic', 'dist', 'index.html'));
});

app.use((err, req, res, next) => {
  console.error(err.stack); // Log the error details
  res.status(500).json({ message: 'Something went wrong on the server.', error: err.message });
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
