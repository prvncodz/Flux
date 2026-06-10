import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
//method to upload on cloudinary

const uploadOnCloud = async (filePath) => {
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
        fs.unlinkSync(filePath);

        return response;
    } catch (error) {
        fs.unlinkSync(filePath);
        console.log("cloudinary upload fail error :", error.message);
        return null;
    }
};
//method to delete from cloudinary

const deleteFromCloud = async (public_id) => {
    try {
        if (!public_id) {
            return null;
        }
        await cloudinary.uploader.destroy(public_id);
        console.log("old file deleted successfully");
        return true;
    } catch (error) {
        console.log("error :", error.message);
        return null;
    }
};

export { uploadOnCloud, deleteFromCloud };
