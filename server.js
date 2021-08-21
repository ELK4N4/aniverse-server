/* eslint-disable no-undef */
/* Import Modules */
import dotenv from 'dotenv';
import helmet from 'helmet';
import express from 'express';
import cookieParser from 'cookie-parser';
import userParser from './middlewares/user-parser.js';
import { addAsync } from '@awaitjs/express';
import morgan from 'morgan';
import cors from 'cors';

/* Import Routers */
import indexRouter from './routes/index.js';
import fansubsRouter from './routes/fansubs/index.js';
import animesRouter from './routes/animes.js';
import loginRouter from './routes/login.js';
import authRouter from './routes/auth/auth.js';
import userRouter from './routes/user.js';
import rateLimit  from 'express-rate-limit';

dotenv.config();




/* Constant Variables */
const app = addAsync(express());
const PORT = process.env.PORT || 5000;
const DATABASE_URL = process.env.DATABASE_URL || 'mongodb://localhost/test';
const limiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
// const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

/* Server Setup */

// Enable if you're behind a reverse proxy (Heroku, AWS ELB, Nginx, etc)
// see https://expressjs.com/en/guide/behind-proxies.html
// app.set('trust proxy', 1);

app.use(morgan(isProduction ? 'combined' : 'dev'));
app.use(function(err, req, res) {
    res.status(400).json({ error: err.message});
});

if(isProduction)
{
    app.use(limiter);
}
app.use(helmet());
app.use(cors());
app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    next();
});
app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.use(cookieParser());
app.useAsync(userParser);

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
    
//! MUST HANDLE PERMISSIONS

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



