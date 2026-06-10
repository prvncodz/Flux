import { Types } from "mongoose";
import type { IUser } from "../models/user.model";

declare global {
    namespace Express {
        interface Request {
            user?: (IUser & { _id: Types.ObjectId, __v: number }) | null;
            visitorId?: string;
        }
    }
}

export { };
