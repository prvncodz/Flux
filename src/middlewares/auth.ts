import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

const verifyJwt = asyncHandler(async (req, res, next) => {
    try {
        const token =
            (await req.cookies?.accessTokens) ||
            req.header("authorization")?.replace("Bearer ", "");

        if (!token) {
            throw new ApiError(401, "unauthorized request");
        }
        const decodedjwt = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = await User.findById(decodedjwt?._id);
        if (!user) {
            throw new ApiError(401, "access token expired");
        }
        req.user = user;
        next();
    } catch (error) {
        throw new ApiError(401, "invalid access token");
    }
});

export { verifyJwt };
