import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

const verifyJwtOptional = asyncHandler(async (req, res, next) => {
    try {
        const token =
            (await req.cookies?.accessTokens) ||
            req.header("authorization")?.replace("Bearer ", "");

        if (!token) {
            return next();
        }
        const decodedjwt = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = await User.findById(decodedjwt?._id);
        if (!user) {
            return next();
        }
        req.user = user;
    } catch (error) {
        req.user = null;
    }

    next();
});

export { verifyJwtOptional };
