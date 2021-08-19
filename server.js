/* Import Modules */
import dotenv from 'dotenv';
import helemt from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import favicon from 'serve-favicon';
import expressLayout from 'express-ejs-layouts';
import cookieParser from 'cookie-parser';
import userParser from './middlewares/user-parser.js';


/* Import Routers */
import indexRouter from './routes/index.js';
import fansubsRouter from './routes/fansubs/index.js';
import animesRouter from './routes/animes.js';
import loginRouter from './routes/login.js';
import authRouter from './routes/auth/auth.js';
import userRouter from './routes/user.js';
import rateLimit  from "express-rate-limit";

dotenv.config();

// Enable if you're behind a reverse proxy (Heroku, Bluemix, AWS ELB, Nginx, etc)
// see https://expressjs.com/en/guide/behind-proxies.html
// app.set('trust proxy', 1);

const limiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});

/* Constant Variables */
const PORT = process.env.PORT || 5000;
const DATABASE_URL = process.env.DATABASE_URL || "mongodb://localhost/test";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


/* Server Setup */
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.set('layout', 'layouts/layout');


  
app.use(limiter);
app.use(helemt());
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
    next();
});
app.use(expressLayout);
app.use(express.static('public'));
app.use(favicon(__dirname + '/public/images/favicon.png'));
app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.use(cookieParser());
app.use(userParser);


/* DataBase */

import mongoose from 'mongoose';

mongoose.connect(
    DATABASE_URL,
    {
      useUnifiedTopology: true,
      useNewUrlParser: true,
      useCreateIndex: true,
    },
    (err) => {
      if (err) return console.error(err);
      console.log('Mongoose is connected');
    },
); // mongoose.set('useFindAndModify', false);

/* Routes */
app.use('/', indexRouter);
// app.use('/about', aboutRouter);
// app.use('/team', teamRouter);
app.use('/fansubs', fansubsRouter);
app.use('/animes', animesRouter);
app.use('/user', userRouter);
app.use('/login', loginRouter);
app.use('/auth', authRouter);


/* Server Listening */
app.listen(PORT, '0.0.0.0', () => {
    console.clear();
    console.log(`Listening at port ${PORT}...`);
});



