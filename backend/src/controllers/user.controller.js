import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import User from "../models/user.models.js";
import {sequelize} from '../db/index.js';
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
        throw new ApiError(401, "Invalid credentials")
    }

    const { accessToken, refreshToken  } = await generateAccessTokenAndRefreshToken(user.email)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

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
    
})

export {registerUser, loginUser, logoutUser}