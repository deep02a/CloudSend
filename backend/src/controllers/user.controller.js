import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import User from "../models/user.models.js";
import {sequelize} from '../db/index.js';

const registerUser = asyncHandler(async (req,res)=>{
    const {username, email, password} = req.body;

    if (
        [  username,email,password].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }

    const existedUser = await User.findOne({
        where: { [Op.or]: [{ username }, { email }] }
    })

    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists")
    }

    const user = await User.build({
        id:1,
        username:hello,
        email:hi,
        password:whatsup,
    })
    console.log(user);
    
    
})

export{registerUser}