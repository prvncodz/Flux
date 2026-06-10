import { v4 as uuid } from "uuid";

export const ensureVisitor = (req, res, next) => {
    if (!req.cookies.visitorId) {
        const id = uuid();
        res.cookie("visitorId", id, { httpOnly: true, maxAge: 31536000000 });
        req.visitorId = id;
    } else {
        req.visitorId = req.cookies.visitorId;
    }
    next();
};
