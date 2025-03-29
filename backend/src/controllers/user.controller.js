import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import User from "../models/user.models.js";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import crypto from 'crypto';
import { Op } from "sequelize";

const otpStore = new Map();


const encryptKey = (key) => {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(process.env.MASTER_KEY, "hex"), iv);
    const encrypted = Buffer.concat([cipher.update(key), cipher.final()]);
    return `${iv.toString("hex")}:${encrypted.toString("hex")}`;
};


const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL, 
        pass: process.env.GMAIL_PASSWORD 
    }
});

const sendOTP = async (email, otp) => {
    const mailOptions = {
        from: 'your-email@gmail.com',
        to: email,
        subject: 'Your One-Time Password (OTP)',
        text: `Your OTP is ${otp}. It will expire in 5 minutes.`
    };

    await transporter.sendMail(mailOptions);
}

const generateOTP = ()=>{
    const otpLength = 6;
    const charset = "0123456789";
    let result = '';
    for (let i = 0; i < otpLength; i++) {
        result += charset[Math.floor(Math.random() * charset.length)];
    }
    return result;
}


import schedule from 'node-schedule';
 schedule.scheduleJob('*/5 * * * *', () => {
    const now = Date.now();
    for (const [email, otp] of otpStore.entries()) {
        if (now >= otp.expires) {
            otpStore.delete(email);
        }
    }
});


const generateAccessTokenAndRefreshToken = async(email) => {
    try {
        const user = await User.findOne({
            where: 
                { email}
        });
        const accessToken =  user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
    
        user.refreshToken = refreshToken;
        
        await user.save({validateBeforeSave: false});
        
        return { accessToken, refreshToken  };
        


    } catch (error) {
        console.error(error);
        throw new ApiError(500, "Something went wrong while generating tokens");
        
    }
};

const registerUser = asyncHandler(async (req,res)=>{


    const {username, email, password} = req.body;

    if (
        [  username,email,password].some((field) => field?.trim() === "")
    ) {
       throw new ApiError(400, "All fields are required")
    }

    const existedUser = await User.findOne({
        where: 
            { email: email }
    });
    
    
    if (existedUser) {
        throw new ApiError(409, "User with email already exists")
    }

    const otp = generateOTP();
    const expiresAt = Date.now() + 300000; 
    otpStore.set(email, { value: otp, expires: expiresAt });

    try {
        await sendOTP(email, otp);
        const tempToken = jwt.sign(
            {username,email,password},
            process.env.JWT_SECRET,
            {expiresIn: '10m'}
        )
        res.status(200).json(
            new ApiResponse(200, tempToken, "OTP sent to email")
        );    
    } catch (error) {
        console.error('Error sending OTP:', error);
        res.status(500).json({ message: 'Failed to send OTP' });
    }    
})

const verifyOTP = asyncHandler(async (req, res)=>{
    const { otp, tempToken } = req.body;

    const decoded = jwt.verify(tempToken, process.env.JWT_SECRET);

    if (!otpStore.has(decoded.email)) {
        //console.error(error)
        return res.status(401).json({ message: 'OTP not found' });
    }

    const storedOtp = otpStore.get(decoded.email);

    if (storedOtp.value === otp && Date.now() < storedOtp.expires) {

        const userKey = crypto.randomBytes(32).toString("hex");  // Generate a new encryption key
        const encryptedKey = encryptKey(userKey); 
        const newUser= await User.create(
            {
                username:decoded.username, 
                email:decoded.email, 
                password:decoded.password,
                encryptionKey: encryptedKey,
                isVerified: true,
            }
        );
        otpStore.delete(decoded.email);
        res.status(200).json({ message: 'OTP verified successfully' });
    } else {
        res.status(401).json({ message: 'Invalid or expired OTP' });
    }
});

const loginUser = asyncHandler(async (req, res)=>{

    const {email, password} = req.body

    if (!email) {
        throw new ApiError(400, "email is required")
    }

    const user = await User.findOne({
        where:{ email }
    });

    if (!user) {
        throw new ApiError(404, "User does not exist")
    }

    const isPasswordCorrect = await user.isPasswordCorrect(password);
    

    if (!isPasswordCorrect) {
        console.log(isPasswordCorrect)
        throw new ApiError(401, "Invalid credentials")
    }

    const { accessToken, refreshToken  } = await generateAccessTokenAndRefreshToken(user.email)


    const loggedInUser = await User.findOne({
        where: { email },
    }, {
        attributes: { 
            exclude: ['password', 'refreshToken'] 
        }
    });


    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200, 
            {
                user: loggedInUser, accessToken, refreshToken
            },
            "User logged In Successfully"
        )
    )
})

const logoutUser = asyncHandler(async (req, res)=>{
    const user = await User.findOne({ where: { email: req.user.email } });

    if (!user) {
        throw new Error('User not found');
    }

    // Update refresh token to null
    user.refreshToken = null;

    await user.save({validateBeforeSave: false});

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"))
})

const refreshAccessToken = asyncHandler(async (req, res)=>{
    const incomingRefreshToken=req.cookies.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
        throw new ApiError(401, "unauthorized request")
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
    
        const user = await User.findOne({
            where: { email: decodedToken.email },
        });
    
        if (!user) {
            throw new ApiError(401, "Invalid refresh token")
        }
    
        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used")
            
        }
    
        const options = {
            httpOnly: true,
            secure: true
        }
    
        const {accessToken, newRefreshToken} = await generateAccessTokenAndRefreshToken(user._id)
    
        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(
                new ApiResponse(
                    200, 
                    {accessToken, refreshToken: newRefreshToken},
                    "Access token refreshed"
                )
            )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token")
    }
});

const  changeCurrentPassword = asyncHandler(async (req, res)=>{
    const {oldPassword, newPassword} = req.body;

    const user = await User.findOne({
        where: { email:req.user.email }
    });

    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if (!isPasswordCorrect) {
        throw new ApiError(400, "Invalid old password")
    }
    user.password = newPassword
    await user.save({validateBeforeSave: false})

    return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"))
})


export {registerUser, loginUser, logoutUser,refreshAccessToken,changeCurrentPassword,verifyOTP}