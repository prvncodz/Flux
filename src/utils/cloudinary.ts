import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

type CloudinaryResponse = Record<string, unknown>;

const uploadOnCloud = async (filePath?: string): Promise<CloudinaryResponse | null> => {
    try {
        if (!filePath) {
            return null;
        }
        if (!fs.existsSync(filePath)) {
            console.log("file doesn't exist");
        }
        console.log("attempting to upload a file...");
        const response = await cloudinary.uploader.upload(filePath, {
            resource_type: "auto",
        });

        console.log("File uploaded to cloudinary");
        try {
            fs.unlinkSync(filePath);
        } catch { }

        return response as CloudinaryResponse;
    } catch (error: unknown) {
        try {
            if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
        } catch { }
        const msg = error instanceof Error ? error.message : String(error);
        console.log("cloudinary upload fail error :", msg);
        return null;
    }
};

const deleteFromCloud = async (public_id?: string): Promise<boolean | null> => {
    try {
        if (!public_id) {
            return null;
        }
        await cloudinary.uploader.destroy(public_id);
        console.log("old file deleted successfully");
        return true;
    } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : String(error);
        console.log("error :", msg);
        return null;
    }
};

export { uploadOnCloud, deleteFromCloud };
