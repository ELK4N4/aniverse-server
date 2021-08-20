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
import { addAsync } from '@awaitjs/express';

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


/* Constant Variables */
const app = addAsync(express());
const PORT = process.env.PORT || 5000;
const DATABASE_URL = process.env.DATABASE_URL || "mongodb://localhost/test";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const limiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

/* Server Setup */

if(isProduction)
{
    app.use(limiter);
}
app.useAsync(helemt());
app.useAsync(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
    next();
});
app.useAsync(expressLayout);
app.useAsync(express.static('public'));
app.useAsync(favicon(__dirname + '/public/images/favicon.png'));
app.useAsync(express.urlencoded({extended: false}));
app.useAsync(express.json());
app.useAsync(cookieParser());
app.useAsync(userParser);
app.useAsync(function(error, req, res, next) {
    res.json({ error: error.message});
});

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
app.useAsync('/', indexRouter);
// app.use('/about', aboutRouter);
// app.use('/team', teamRouter);
app.useAsync('/fansubs', fansubsRouter);
app.useAsync('/animes', animesRouter);
app.useAsync('/user', userRouter);
app.useAsync('/login', loginRouter);
app.useAsync('/auth', authRouter);


/* Server Listening */
app.listen(PORT, '0.0.0.0', () => {
    console.clear();
    console.log(`Listening at port ${PORT}...`);
});



