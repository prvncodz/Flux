import multer from "multer";
import path from "path";
import { Request } from "express";


const storage = multer.diskStorage({
    destination: function (req: Request, file: Express.Multer.File, cb: (err: Error | null, dest: string) => void) {
        cb(null, path.join(__dirname, "../../public/assets")); // folder to store files
    },
    filename: function (req: Request, file: Express.Multer.File, cb: (err: Error | null, filename: string) => void) {
        cb(null, file.originalname);
    },
});
export const upload = multer({ storage });
