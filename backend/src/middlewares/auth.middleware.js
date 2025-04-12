import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import jwt from 'jsonwebtoken';
import User from '../models/user.models.js';

export const verifyJWT = asyncHandler(async (req, res, next) => {
  const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

  console.log("Token received:", token);

  if (!token || typeof token !== 'string' || token.split('.').length !== 3) {
    throw new ApiError(401, "Invalid or missing access token");
  }

  try {
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await User.findOne({
      where: { email: decodedToken?.email },
      attributes: { exclude: ['password', 'refreshToken'] }
    });

    if (!user) {
      throw new ApiError(401, "User not found or invalid token");
    }

    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, error.message || "Invalid access token");
  }
});
