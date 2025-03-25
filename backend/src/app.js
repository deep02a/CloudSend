import express from 'express';
import cors from 'cors';
import cookieParser from "cookie-parser"
import { registerUser,loginUser,logoutUser,refreshAccessToken,changeCurrentPassword,verifyOTP } from './controllers/user.controller.js';
import { uploadFile } from './controllers/file.controller.js';
import { verifyJWT } from './middlewares/auth.middleware.js';
import { upload } from './middlewares/multer.middleware.js';

const app = express();

app.use(cors({
    origin:process.env.CORS_ORIGIN
}));
app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({limit:"16kb"}));
app.use(express.static("public"))
app.use(cookieParser());

app.post('/register',registerUser);
app.get('/verify-otp',verifyOTP);
app.post('/login',loginUser);

//secured routes
app.post('/logout',verifyJWT,logoutUser);
app.post('/refresh-token',refreshAccessToken);
app.post('/change-password',verifyJWT,changeCurrentPassword);

app.post('/upload-file',upload.single('file'),verifyJWT,uploadFile)


//import userRouter from './routes/user.routes.js';

//app.use('/api/user', userRouter);

export {app}