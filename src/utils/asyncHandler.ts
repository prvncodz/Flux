import { RequestHandler } from "express";

const asyncHandler = (fnc: RequestHandler): RequestHandler => {
  return async (req, res, next) => {
    try {
      return await fnc(req, res, next);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      res.status(500).json({
        success: false,
        message,
      });
    }
  };
};
export { asyncHandler };
