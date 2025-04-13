import express from 'express';
import cors from 'cors';
import cookieParser from "cookie-parser"
import { registerUser,loginUser,logoutUser,refreshAccessToken,changeCurrentPassword,verifyOTP,getMe,googleLoginCallback} from './controllers/user.controller.js';
import { uploadFile,downloadFile,fetchFiles, fileRename,deleteFile } from './controllers/file.controller.js';
import { verifyJWT } from './middlewares/auth.middleware.js';
import { upload } from './middlewares/multer.middleware.js';
import { shareFile,getdownloadFile,getSharedFiles } from './controllers/fileShare.controller.js';
import passport from './utils/passport/index.js';
import User from './models/user.models.js';


const app = express();
app.use(cookieParser());

app.use(cors({
    origin:"http://localhost:3000",
    credentials: true,
}));
app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"))
app.use(passport.initialize());



app.post('/register',registerUser);
app.post('/verify-otp',verifyOTP);
app.post('/login',loginUser);


app.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));
app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login", session: false }),
  async (req, res) => {
    try {

      const { email } = req.user;

      const dbUser = await User.findOne({ where: { email } });

      if (!dbUser) {
        return res.status(401).send("User not found");
      }

      const accessToken = dbUser.generateAccessToken();


      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        sameSite: "Lax",
        secure: false,
      });

      res.redirect("http://localhost:3000/dashboard");
    } catch (err) {
      res.redirect("http://localhost:3000/login?error=auth_failed");
    }
  }
);



//secured routes
app.get('/me', verifyJWT, getMe);
app.post('/logout',verifyJWT,logoutUser);
app.post('/refresh-token',refreshAccessToken);
app.post('/change-password',verifyJWT,changeCurrentPassword);

app.post('/upload-file',upload.single('file'),verifyJWT,uploadFile)
app.delete('/delete-file/:id',verifyJWT,deleteFile)
app.get('/download/:id',verifyJWT,downloadFile)

app.get('/fetch-files',verifyJWT,fetchFiles)
app.patch('/files/rename/:id',verifyJWT,fileRename)
app.post('/share-file',verifyJWT,shareFile)
app.get('/get-download-file/:fileId',verifyJWT,getdownloadFile)
app.get('/get-recieved-file',verifyJWT,getSharedFiles)


//import userRouter from './routes/user.routes.js';

//app.use('/api/user', userRouter);

export {app}