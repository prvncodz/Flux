import { useContext, useEffect, useState } from "react";
import { Eye, ThumbsUp, Users, Video, EyeOff, Edit2, Delete, DeleteIcon, Trash, Trash2 } from "lucide-react";
import Nav from "../home/nav";
import axios from "../../api/axios";
import dbanner from "../assets/dbanner.jpg";
import dpfp from "../assets/dpfp.jpg";
import EditProfilePopUp from "../userProfile/editProfilePopup.jsx";
import EditVideoPopup from "./EditVideoPopup.jsx";
import { motion } from "motion/react"
import useTab from "../../stores/tab.store.js";

const CheckIcon = () => (
    <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
    >
        <circle cx="10" cy="10" r="10" fill="#22c55e" />
        <path
            d="M5.5 10.5L8.5 13.5L14.5 7"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);
const CrossIcon = () => (
    <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
    >
        <circle cx="10" cy="10" r="10" fill="#ef4444" />
        <path
            d="M6.5 6.5L13.5 13.5M13.5 6.5L6.5 13.5"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);
const Toast = ({ message, visible, onClose, type = "success" }) => {
    useEffect(() => {
        if (visible) {
            const t = setTimeout(onClose, 3500);
            return () => clearTimeout(t);
        }
    }, [visible, onClose]);

    return (
        <div
            className={`flex items-center gap-3 bg-white border border-gray-200 shadow-lg rounded-xl px-4 py-3 min-w-75 max-w-xs transition-all duration-500 ${visible
                ? "opacity-100 translate-y-0 pointer-events-auto"
                : "opacity-0 translate-y-4 pointer-events-none"
                }`}
            style={{ boxShadow: "0 4px 24px 0 rgba(0,0,0,0.10)" }}
        >
            {type === "success" ? <CheckIcon /> : <CrossIcon />}
            <span className="text-sm font-medium text-gray-800 flex-1">{message}</span>
            <button
                onClick={onClose}
                className="ml-1 text-gray-400 hover:text-gray-600 transition-colors duration-150 rounded-full p-0.5"
                aria-label="Dismiss"
            >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path
                        d="M4 4L12 12M12 4L4 12"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                    />
                </svg>
            </button>
        </div>
    );
};



export default function Dashboard() {
    const [userChannelStats, setUserChannelStats] = useState({});
    const [videos, setVideos] = useState([]);
    const [isEditPopUpActive, setIsEditPopUpActive] = useState(false);
    const [showDeleted, setShowDeleted] = useState(false);
    const [showUpdated, setShowUpdated] = useState(false);
    const [showPublished, setShowPublished] = useState(false);
    const [publishStatus, setPublishStatus] = useState("unpublished");
    const [showPublishError, setShowPublishError] = useState(false);
    const [showDeleteError, setShowDeleteError] = useState(false);
    const [showUpdateError, setShowUpdateError] = useState(false);
    const setCurrentPage = useTab(s => s.setTab);

    function handleEditProfile() {
        setIsEditPopUpActive(true);
    }

    useEffect(() => {
        setCurrentPage("dashboard")
        async function getStats() {
            try {
                const res = await axios.get("/dashboard/stats");
                if (res.status === 200) {
                    setUserChannelStats(res.data?.data[0]);
                }
            } catch (error) {
                console.log(error);
            }
        }
        async function getVideos() {
            try {
                const res = await axios.get("/dashboard/videos");
                if (res.status === 200) {
                    setVideos(res.data?.data);
                }
            } catch (error) {
                console.log(error);
            }
        }
        getStats();
        getVideos();
    }, []);

    return (
        <div className="h-auto">
            <Nav />
            <motion.div
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

                className="flex justify-center h-screen overflow-y-auto w-full md:pb-2"
            >
                <div className="h-screen  overflow-y-auto w-full p-5 space-y-6 pb-20  md:h-full md:pl-16 md:max-w-[70vw] lg:max-w-[50vw] ">
                    {isEditPopUpActive && (
                        <EditProfilePopUp setIsEditPopUpActive={setIsEditPopUpActive} />
                    )}
                    <div className="absolute pointer-events-none top-15  flex-col gap-3 right-8 h-auto justify-center items-center z-10">
                        <Toast
                            message={`${publishStatus === "published" ? "Video published successfully" : "Video unpublished successfully"}`}
                            visible={showPublished}
                            onClose={() => setShowPublished(false)}
                        />
                        <Toast
                            message="Video deleted successfully"
                            visible={showDeleted}
                            onClose={() => setShowDeleted(false)}
                        />
                        <Toast
                            message="Video updated successfully"
                            visible={showUpdated}
                            onClose={() => setShowUpdated(false)}
                        />
                        <Toast
                            message="Error toggling video publish status"
                            visible={showPublishError}
                            onClose={() => setShowPublishError(false)}
                            type="error"
                        />
                        <Toast
                            message="Unable to delete the video"
                            visible={showDeleteError}
                            onClose={() => setShowDeleteError(false)}
                            type="error"
                        />
                        <Toast
                            message="Unable to update the video"
                            visible={showUpdateError}
                            onClose={() => setShowUpdateError(false)}
                            type="error"
                        />

                    </div >

                    <div className="hidden md:flex flex-col items-center mb-6 md:mt-5">
                        <h1 className="text-2xl font-semibold text-gray-800">
                            Welcome back, {userChannelStats?.fullName} 👋
                        </h1>

                        <p className="text-sm text-gray-500 mt-1">
                            Here’s what’s happening on your channel today.
                        </p>
                    </div>
                    <div className="relative h-55.25 w-full overflow-hidden rounded-xl border border-neutral-200   md:h-70 md:w-full md:mx-auto lg:w-130">
                        <div className="relative z-0 ">
                            <img
                                src={userChannelStats?.coverImage?.url || dbanner}
                                onError={(e) => (e.target.src = dbanner)}
                                className="h-35.5 w-full relative md:h-45 "
                                loading="lazy"
                            />
                            <img
                                src={userChannelStats?.avatar?.url || dpfp}
                                onError={(e) => (e.target.src = dpfp)}
                                className="h-21 rounded-full absolute left-3 -bottom-12 w-22.5 border-2 border-white md:h-25 md:w-25 md:-bottom-15 lg:-bottom-18"
                                loading="lazy"
                            />
                            <Edit2
                                size={20}
                                className="absolute right-5 -bottom-8 cursor-pointer"
                                onClick={handleEditProfile}
                            />
                        </div>
                        <div className="h-15 ml-30 w-full mt-1 md:ml-32 md:mt-1 ">
                            <h3 className="text-left text-neutral-600 font-medium text-xl ">
                                {userChannelStats?.fullName || "Jhon doe"}
                            </h3>
                            <h3 className="text-left text-neutral-500 font-medium text-sm mt-0 ">
                                @{userChannelStats?.userName || "jhondoe201"}
                            </h3>
                        </div>
                    </div>

                    <div className="md:mt-1">
                        <h2 className="text-lg font-bold mb-3 text-gray-900 text-left  md:mt-3 md:text-base">
                            CHANNEL STATS
                        </h2>

                        <div className="space-y-3 h-auto w-full   md:flex md:flex-col md:justify-center  md:items-center  ">
                            <StatCard
                                icon={<Eye size={16} />}
                                label="Total views"
                                value={userChannelStats?.totalViews}
                            />
                            <StatCard
                                icon={<ThumbsUp size={16} />}
                                label="Total likes"
                                value={userChannelStats?.totalLikes}
                            />
                            <StatCard
                                icon={<Users size={16} />}
                                label="Total subscribers"
                                value={userChannelStats?.totalSubscribers}
                            />
                        </div>
                    </div>

                    <div className="h-auto mb-10">
                        <h2 className="text-lg font-bold mb-3 text-gray-900 text-left ">
                            All Videos
                        </h2>

                        <div className="border border-neutral-200 rounded-xl p-3 space-y-3 mx-auto h-auto flex flex-col justify-center ">
                            <div className="flex justify-between text-xs text-gray-500 px-2">
                                <span>
                                    Total {userChannelStats?.totalVideoCount || videos.length}{" "}
                                    videos
                                </span>
                                <span className="mr-8">Status</span>
                            </div>

                            {videos.map((video) => (
                                <VideoCard video={video} key={video._id}
                                    setShowDeleted={setShowDeleted}
                                    setShowUpdated={setShowUpdated}
                                    setShowPublished={setShowPublished}
                                    setPublishStatus={setPublishStatus}
                                    setShowPublishError={setShowPublishError}
                                    setShowDeleteError={setShowDeleteError}
                                    setShowUpdateError={setShowUpdateError}
                                />
                            ))}
                        </div>
                    </div>
                </div >
            </motion.div >
        </div >
    );
}

function VideoCard({ video, setShowDeleted, setShowUpdated, setShowUpdateError, setShowPublished, setPublishStatus, setShowPublishError, setShowDeleteError }) {
    const [isPublished, setIsPublished] = useState(video.isPublished);
    const [showEditVideo, setShowEditVideo] = useState(false);

    let timeoutId;
    async function handleTogglePublish(videoId) {
        clearTimeout(timeoutId);
        setTimeout(async () => {
            try {
                const res = await axios.post(
                    `/videos/c/${videoId}/toggle-publish-status`,
                );
                if (res.status === 200) {
                    setIsPublished((prev) => !prev);
                    setPublishStatus(isPublished ? "unpublished" : "published");
                    setShowPublished(true);
                } else {
                    setShowPublishError(true);
                }
            } catch (error) {
                setShowPublishError(true);
            }
        }, 800);
    }

    async function handleDeleteVideo(videoId) {
        try {
            const res = await axios.delete(`/videos/c/${videoId}/delete-video`);
            if (res.status == 200) {
                setShowDeleted(true);
            } else {
                setShowDeleteError(true);
            }
        } catch (err) {
            setShowDeleteError(true)
        }
    }
    async function handleUpdateVideo() {
        setShowEditVideo(true);
    }
    return (
        <div
            key={video._id}
            className="flex items-center justify-between border border-neutral-300 rounded-lg px-3 py-2 h-auto"
        >

            {showEditVideo && (
                <EditVideoPopup setIsEditPopUpActive={setShowEditVideo} video={video} setShowUpdated={setShowUpdated} setShowUpdateError={setShowUpdateError} />
            )}
            <div className="flex items-center gap-3 text-sm">
                <Video size={16} />
                <div className="sm:w-25 w-35 min-w-40 max-w-[240x] text-left text-wrap line-clamp-2 md:line-clamp-3 md:w-50 lg:w-100  ">
                    {video.title}
                </div>
            </div>
            <div className="flex items-center gap-3 lg:gap-6">

                {isPublished ? (
                    <Eye size={16} className="text-green-500" />
                ) : (
                    <EyeOff size={16} className="text-red-500" />
                )}
                <Edit2 className="text-gray-500 hidden cursor-pointer md:block" size={16} onClick={handleUpdateVideo} />
                <Trash2 className=" hidden cursor-pointer text-red-500 md:block " size={16} onClick={() => handleDeleteVideo(video._id)} />
                <div className="flex items-center gap-2">
                    <button
                        className={`text-xs px-3 py-1 w-20 rounded-md text-white active:scale-95 transition-all cursor-pointer outline-none ${isPublished ? "bg-gray-800" : "bg-gray-600"
                            }`}
                        onClick={() => handleTogglePublish(video._id)}
                    >
                        {isPublished ? "Unpublish" : "Publish"}
                    </button>
                </div>
            </div>
        </div >
    );
}

function StatCard({ icon, label, value }) {
    return (
        <div className="flex items-start gap-3 border border-neutral-200 rounded-xl p-5 flex-col md:h-40 md:w-full md:p-5 lg:h-50  ">
            <div className="bg-[#1E549D] text-[#ffffff] p-1.5  rounded-full">
                {icon}
            </div>

            <div>
                <p className="text-xs text-gray-500 md:text-base lg:text-lg ">
                    {label}
                </p>
                <p className="font-semibold text-xl text-left md:text-2xl md:mt-1 lg:text-3xl lg:mt-2 lg:font-normal">
                    {value}
                </p>
            </div>
        </div>
    );
}
