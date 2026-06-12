import { RequestHandler } from "express";
import { ApiError } from "./ApiError";

const asyncHandler = (fnc: RequestHandler): RequestHandler => {
    return async (req, res, next) => {
        try {
            return await fnc(req, res, next);
        } catch (err: unknown) {
            const message = err instanceof ApiError ? err.message : "something went wrong";
            const status = err instanceof ApiError ? err.statusCode : 500;
            res.
                status(status || 500)
                .json({
                    success: false,
                    message: message,
                });
        }
    };
};
export { asyncHandler };
