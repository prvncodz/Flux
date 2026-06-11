import { useState, useEffect } from "react";
import dpfp from "../../assets/dpfp.jpg";
import { useNavigate } from "react-router-dom";

export default function VideoComponent({
    video,
    idx,
    videosLength,
    setLoading,
}) {
    const { avatar, userName, fullName } = video?.owner;
    const [duration, setDuration] = useState("00:00");
    const [timeOfUpload, setTimeOfUpload] = useState("1 day");
    const navigate = useNavigate();

    function handleShowUserProfile() {
        navigate(`/userchannel/${userName}`)
    }

    function handleShowWatchVideo() {
        navigate(`/watch/video/${video?._id}`, {
            state: {
                ownerAvatar: avatar?.url,
                fullname: fullName,
            },
        });
    }
    useEffect(() => {
        if (idx === videosLength - 1) {
            setLoading(false);
        }
    }, [videosLength]);

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
            const seconds = Math.floor(dif / 1000);
            const days = Math.floor(dif / (1000 * 60 * 60 * 24));
            const months = Math.floor(days / 30);
            const years = Math.floor(days / 365);

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
    }, []);

    return (
        <div className="md:p-2 lg:p-2">
            <div
                className="relative z-0 aspect-video md:rounded-xl cursor-pointer"
                onClick={handleShowWatchVideo}
            >
                <img
                    src={video.thumbnail.url}
                    className=" w-full h-full md:rounded-lg"
                />
                <div className="absolute right-2 bottom-2 p-2 z-1 rounded-xl text-center text-neutral-300 bg-gray-900 text-sm font-medium subpixel-antialiased">
                    {duration}
                </div>
            </div>
            <div className="flex mt-3 p-2">
                <div className="h-10 w-10 shrink-0">
                    <img
                        src={avatar?.url || dpfp}
                        name="Userprofile"
                        className="rounded-full h-full w-full cursor-pointer"
                        loading="lazy"
                        onClick={handleShowUserProfile}
                        onError={(e) => (e.target.src = dpfp)}
                    />
                </div>
                <div className="ml-4">
                    <h3 className="text-left text-neutral-700 font-medium text-sm line-clamp-2 w-auto cursor-default antialiased">
                        {video.title}
                    </h3>
                    <h3 className="text-left text-neutral-600 font-medium text-xs cursor-default antialiased">
                        {timeOfUpload} ago . {video?.views} views
                    </h3>
                </div>
            </div>
        </div>
    );
}
