import { asyncHandler } from "../utils/asyncHandler";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model";
import { Request, Response, NextFunction } from "express";

const verifyJwtOptional = asyncHandler(
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const token =
                (req.cookies?.accessTokens as string | undefined) ||
                req.header("authorization")?.replace("Bearer ", "");

            if (!token) {
                return next();
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
                return next();
            }

            req.user = user;
        } catch (error: unknown) {
            req.user = null;
        }

        next();
    }
);

export { verifyJwtOptional };
