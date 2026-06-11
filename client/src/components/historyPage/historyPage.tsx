import { useNavigate } from "react-router-dom";
import Nav from "../home/nav.jsx";
import axios from "../../api/axios.js";
import { useState, useEffect } from "react";
import useTab from "../../stores/tab.store.js";

export default function HistoryPage() {
    const navigate = useNavigate();
    const [videos, setVideos] = useState([]);
    const setCurrentPage = useTab(s => s.setTab);

    useEffect(() => {
        setCurrentPage("watchHistory")
        async function getHistory() {
            try {
                const res = await axios.get(`/user/user-watch-history`);
                if (res.status === 200) {
                    setVideos(res.data?.data);
                }
            } catch (error) {
                console.log(error);
            }
        }
        getHistory();
    }, []);
    return (
        <>
            <Nav />
            <div className="flex justify-center ">
                <div className="max-w-lg  p-5 h-[95vh] overflow-y-auto rounded-xl  md:max-w-[90vw] md:w-full  md:ml-20 md:p-5 md:flex md:flex-col ">
                    {videos.length === 0 ? (
                        <div className="flex flex-col items-center justify-center mt-20 gap-4 text-center">
                            <p className="text-gray-500">You haven't watched any video yet</p>

                            <button
                                onClick={() => navigate("/")}
                                className="bg-black text-white px-4 py-2 rounded-lg"
                            >
                                Explore Videos
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <h1 className="text-2xl text-left font-semibold mb-6 mt-5">
                                Watch History
                            </h1>
                            {videos.map((video) => (
                                <VideoCardComponent video={video} key={video._id} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

function VideoCardComponent({ video }) {
    const [duration, setDuration] = useState("00:00");
    const [timeOfUpload, setTimeOfUpload] = useState("1 day");
    const navigate = useNavigate();

    useEffect(() => {
        function calcDuration(dur) {
            if (!dur) return;
            const hours = Math.trunc(dur / 3600);
            const minutes = Math.trunc((dur % 3600) / 60);
            const seconds = Math.trunc((dur % 3600) % 60);

            if (hours >= 1) {
                setDuration(
                    `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`,
                );
            } else if (minutes >= 1) {
                setDuration(
                    `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`,
                );
            } else {
                setDuration(`00:${String(seconds).padStart(2, "0")}`);
            }
        }
        function calcTimeOfUpload(t) {
            if (!t) return;
            const now = new Date();
            const dif = now.getTime() - new Date(t).getTime();
            const hours = Math.floor(dif / (1000 * 60 * 60));
            const minutes = Math.floor(dif / (1000 * 60));
            const days = Math.floor(dif / (1000 * 60 * 60 * 24));
            const months = Math.floor(days / 30);
            const years = Math.floor(days / 365);
            const seconds = Math.floor(dif / 1000);

            if (years > 0) {
                setTimeOfUpload(`${years} ${years > 1 ? "years" : "year"}`);
            } else if (months > 0) {
                setTimeOfUpload(`${months} ${months > 1 ? "months" : "month"}`);
            } else if (days > 0) {
                setTimeOfUpload(`${days} ${days > 1 ? "days" : "day"}`);
            } else if (hours > 0) {
                setTimeOfUpload(`${hours} ${hours > 1 ? "hours" : "hour"}`);
            } else if (minutes > 0) {
                setTimeOfUpload(`${minutes} ${minutes > 1 ? "minutes" : "minute"}`);
            } else {
                setTimeOfUpload(`${seconds} ${seconds > 1 ? "seconds" : "second"}`);
            }
        }
        calcTimeOfUpload(video.createdAt);
        calcDuration(Math.trunc(video.duration));
    }, [video]);

    function handleShowWatchVideo() {
        navigate(`/watch/video/${video?._id}`, {
            state: {
                ownerAvatar: video.owner?.avatar?.url,
                username: video?.owner?.userName,
            },
        });
    }

    return (
        <div
            className="flex gap-3 border border-neutral-200 rounded-xl p-3 w-full"
            onClick={handleShowWatchVideo}
        >
            {/* thumbnail */}
            <div className="relative">
                <img
                    src={video.thumbnail?.url}
                    className="w-[142px] h-[84px] object-cover rounded-lg md:aspect-video md:h-30 md:w-50 lg:h-40 lg:w-70"
                />
                <div className="absolute bg-gray-800 rounded-2xl bottom-1 right-1 w-10 h-4 text-xs text-gray-300 text-center">
                    {duration}
                </div>
            </div>

            {/* video info */}
            <div className="flex flex-col justify-between flex-1 h-21 md:mt-1 md:p-y-20">
                <div className="text-left mt-1 ml-2">
                    <h3 className="text-sm font-semibold leading-tight line-clamp-2  md:font-normal md:leading-relaxed md:text-lg  lg:font-normal lg:leading-relaxed lg:text-xl">
                        {video.title}
                    </h3>

                    <p className="text-xs text-gray-500 md:text-sm  lg:text-base">
                        {video.views + " views"} · {timeOfUpload + " ago"}
                    </p>
                </div>
                <div className="flex items-center gap-1  ml-2 md:mt-3 ">
                    <img
                        src={video?.owner?.avatar?.url}
                        className="w-6 h-6 rounded-full cursor-pointer"
                    />

                    <span className="text-xs text-gray-600 md:ml-0.5 lg:text-sm">
                        {video?.owner?.fullName}
                    </span>
                </div>
            </div>
        </div>
    );
}
