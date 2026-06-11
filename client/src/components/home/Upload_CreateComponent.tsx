import { ListVideo, Pen, SquarePen, Upload, Video, Videotape } from "lucide-react";
import { motion } from "motion/react"

export default function CreateComponent({ handleUpload }) {
    return (
        <motion.div
            className="absolute bg-gray-50 shadow-sm rounded-xl h-auto w-auto top-12 z-10 right-0 p-3 transition-all pop-in delay-75 flex flex-col gap-2"
            initial={{
                opacity: 0,
            }}
            animate={{
                opacity: 1,
                duration: 100
            }}
            exit={{
                opacity: 0
            }}
        >
            <div
                className="flex items-center gap-3 w-55  p-3 rounded-lg  hover:bg-gray-100 cursor-pointer"
                onClick={() => handleUpload("video")}
            >
                <Upload />
                <h3 className="ml-1">Publish video</h3>
            </div>
            <div
                className="flex items-center gap-3 w-55 p-3 rounded-lg hover:bg-gray-100 cursor-pointer"
                onClick={() => handleUpload("post")}
            >
                <Pen />
                <h3 className="ml-1">Create post</h3>
            </div>
            <div
                className="flex items-center gap-3 w-55 p-3 rounded-lg hover:bg-gray-100 cursor-pointer"
                onClick={() => handleUpload("playlist")}
            >
                <ListVideo />
                <h3 className="ml-1">Create playlist</h3>
            </div>

        </motion.div>
    );
}
