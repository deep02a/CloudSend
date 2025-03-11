import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import User from "../models/user.models.js";
import {sequelize} from '../db/index.js';
import jwt from "jsonwebtoken"
import { Op } from "sequelize";


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


    const user = User.build({
        username,
        email,
        password,
    })
    await user.save();
    
    const createdUser = await User.findOne({
        where: { email },
    }, {
        attributes: { 
            exclude: ['password', 'refreshToken'] 
        }
    });
    

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered Successfully")
    );
    
})

const loginUser = asyncHandler(async (req, res)=>{
    
    const {email, username, password} = req.body

    if (!username && !email) {
        throw new ApiError(400, "username or email is required")
    }

    const user = await User.findOne({
        where: {
            [Op.or]: [
                { email },
                { username },
            ],
        },
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

export {registerUser, loginUser, logoutUser,refreshAccessToken,changeCurrentPassword}