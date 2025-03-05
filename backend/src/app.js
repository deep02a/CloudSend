import express from 'express';
import cors from 'cors';
import cookieParser from "cookie-parser"
import { registerUser } from './controllers/user.controller.js';

const app = express();

app.use(cors({
    origin:process.env.CORS_ORIGIN
}));
app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({limit:"16kb"}));
app.use(express.static("public"))
app.use(cookieParser());

app.get('/add',registerUser);

import userRouter from './routes/user.routes.js';

app.use('/api/user', userRouter);

export {app}