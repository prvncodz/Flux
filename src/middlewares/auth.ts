import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import jwt, { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { Request, Response, NextFunction } from "express";

const verifyJwt = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const token =
        (req.cookies?.accessTokens as string | undefined) ||
        req.header("authorization")?.replace("Bearer ", "");

      if (!token) {
        throw new ApiError(401, "unauthorized request");
      }

      const decoded = jwt.verify(token, String(process.env.ACCESS_TOKEN_SECRET)) as unknown;

      let userId: string | undefined;
      if (typeof decoded === "object" && decoded !== null) {
        const d = decoded as Record<string, unknown>;
        const Id = d._id;
        if (typeof Id === "string") userId = Id;
        else userId = String(Id);
      }

      const user = await User.findById(userId);
      if (!user) {
        throw new ApiError(401, "access token expired");
      }

      req.user = user;
      next();

    } catch (error: unknown) {
      if(error instanceof ApiError){
        throw error;
      }else if(error instanceof JsonWebTokenError){
        throw new ApiError(401, "invalid token");
      }else if(error instanceof TokenExpiredError){
       throw new ApiError(401, "token expired");
      } else{
      throw new ApiError(500, "something went wrong");
      }
    }
  }
);

export { verifyJwt };
