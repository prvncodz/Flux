import { v4 as uuid } from "uuid";
import { Request, Response, NextFunction } from "express";

export const ensureVisitor = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.cookies?.visitorId) {
    const id = uuid();
    res.cookie("visitorId", id, { httpOnly: true, maxAge: 31536000000 });
    (req as Request).visitorId = id;
  } else {
    (req as Request).visitorId = String(req.cookies.visitorId);
  }
  next();
};
