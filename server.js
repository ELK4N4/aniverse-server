/* Import Modules */
import dotenv from 'dotenv';
import helmet from 'helmet';
import express from 'express';
import cookieParser from 'cookie-parser';
import { userParser } from './middlewares/auth.js';
import { addAsync } from '@awaitjs/express';
import morgan from 'morgan';
import cors from 'cors';

/* Import Routers */
import indexRouter from './routes/index.js';
import fansubsRouter from './routes/fansubs/index.js';
import animesRouter from './routes/animes/index.js';
import authRouter from './routes/auth/index.js';
import userRouter from './routes/users/user.js';
import usersRouter from './routes/users/users.js';
import adminsRouter from './routes/users/admins.js';
import bansRouter from './routes/users/bans.js';
import rateLimit  from 'express-rate-limit';

dotenv.config();


/* Constant Variables */
const app = addAsync(express());
const PORT = process.env.PORT || 5000;
const DATABASE_URL = process.env.DATABASE_URL || 'mongodb://localhost/anime-prime';
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

if(isProduction)
{
    app.use(limiter);
}

app.use(helmet());
app.use(cors({exposedHeaders: 'Content-Range'}));
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
); 
mongoose.set('useFindAndModify', false);
//! MUST HANDLE PERMISSIONS

/* Routes */
app.use('/', indexRouter);
// app.use('/about', aboutRouter);
// app.use('/team', teamRouter);
app.use('/fansubs', fansubsRouter);
app.use('/animes', animesRouter);
app.use('/user', userRouter);
app.use('/users', usersRouter);
app.use('/auth', authRouter);
app.use('/admins', adminsRouter);
app.use('/bans', bansRouter);


/* Error Handler */
app.use((error, req, res, _next) => {
    console.log({ error: error.message });
    res.status(400).json({ error: error.message });
});



/* Server Listening */
app.listen(PORT, '0.0.0.0', () => {
    console.clear();
    console.log(`\x1b[36mListening at port ${PORT}...`);
});