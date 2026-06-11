import { memo, useContext, useEffect, useRef, useState } from "react";
import { ArrowLeft, Eclipse, Ellipsis, EllipsisVertical, PlayCircleIcon, VideoIcon } from "lucide-react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Description from "../watch/videoDescription.jsx";
import dpfp from "../assets/dpfp.jpg";
import dbanner from "../assets/dbanner.jpg"
import PlaylistOptions from "./PlaylistOptions.jsx";
import axios from "../../api/axios.js";
import AddVideosModal from "./VideoOptionsPopup.jsx";
import VideoCardOptions from "./VideoCardOptionsPopup.jsx";
import EditPlaylistPopup from "./EditPlaylist.jsx";
import DeletePlaylist from "./DeletePlaylist.jsx";
import useUserStore from "../../stores/user.store.js";

export default function ShowPlaylistPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const user = useUserStore(s=>s.user)
    const { playlist, avatarUrl, fullname, username, name, owner } = location.state || {};
    const [avatar, setAvatar] = useState(avatarUrl || null);
    const [channelName, setChannelName] = useState(fullname || "");
    const [userName, setUserName] = useState(username || "");
    const [videos, setVideos] = useState(playlist?.videos || []);
    const playPlaylist = useRef(null);
    const [isUserPlaylistOwner, setIsUserPlaylistOwner] = useState(false);
    const [isOptionActive, setIsOptionsActive] = useState(false);
    const [isVideoOptionsActive, setIsVideoOptionsActive] = useState(false);
    const [allUserVideos, setAllUserVideos] = useState([]);
    const [set, setSet] = useState(() => new Set(playlist?.videos?.map(video => video._id) || []));
    const [isShowPopup, setShowPopup] = useState(false);
    const [popupType, setPopupType] = useState("edit");
    const { playlistId } = useParams();
    const [curPlaylist, setCurPlaylist] = useState(playlist || null);

    async function handleDeletePlaylist(id) {
        try {
            await axios.delete(`/playlists/${playlistId}`)
                .then(() => navigate("/"));
        } catch (error) {
            console.log(error.message);
        }
    }

    async function handleAddVideosToPlaylist(videoIds) {
        try {
            const res = await axios.patch(`/playlists/add/${playlistId}`, { videoIds: videoIds })
            setSet(prev => new Set([...prev, ...videoIds]));
            setVideos(res?.data?.data?.videos);
        } catch (err) {
            console.log(err);
        }
    }
    useEffect(() => { }, [videos])
    async function handleOption(optType) {
        try {
            if (optType === "edit") {
                setShowPopup(true);
                setPopupType("edit");
                setIsOptionsActive(false);
            } else if (optType === "delete") {
                setShowPopup(true);
                setPopupType("delete");
                setIsOptionsActive(false);
            }
        } catch (err) {
            console.log(err);
        }
    }
    useEffect(() => {
        async function fetchAllVideos(id) {
            try {
                const res = await axios.get(`/videos/all-videos-by-user?userId=${id}`)
                if (res.status === 200) {
                    setAllUserVideos(res.data?.data);
                }
            } catch (err) {
                console.log(err)
            }
        }
        async function fetchPlaylist(id) {
            if (!id) return;
            try {
                const res = await axios.get(`/playlists/${id}`)
                if (res.status === 200) {
                    setCurPlaylist(res?.data?.data);
                    setVideos(res.data?.data?.videos);
                    setAvatar(res.data?.data?.owner?.avatar?.url)
                    setChannelName(res.data?.data?.owner?.fullName)
                    setUserName(res.data?.data?.owner?.userName)
                }
            } catch (err) {
                console.log(err)
            }
        }

        fetchPlaylist(playlistId);
        if (owner === user?._id) {
            setIsUserPlaylistOwner(true);
            fetchAllVideos(user?._id);
        } else {
            setIsUserPlaylistOwner(false);
        }
    }, [user])

    const popup = {
        "edit": <EditPlaylistPopup setShowPopup={setShowPopup} playlist={curPlaylist} />,
        "delete": <DeletePlaylist isOpen={isShowPopup} onClose={() => setShowPopup(false)} onConfirm={handleDeletePlaylist} playlistName={curPlaylist?.name} />
    }

    return (
        <div className="max-w-md mx-auto h-screen overflow-y-auto p-6 space-y-6">
            {/* back button */}
            <div className="flex justify-between relative">
                <button onClick={() => navigate(`/userchannel/${userName}`)} className="flex flex-start">
                    <ArrowLeft />
                </button>
                {isUserPlaylistOwner &&
                    <>
                        <button onClick={() => setIsOptionsActive(prev => !prev)} className="flex">
                            <Ellipsis size={28} />
                        </button>
                        {
                            isOptionActive && <PlaylistOptions handleOption={handleOption} />
                        }
                        {isShowPopup &&
                            popup[popupType]
                        }
                    </>
                }
            </div>

            {/* playlist banner */}
            <div className="w-full h-55  rounded-xl overflow-hidden bg-gray-100">
                <img
                    src={curPlaylist?.videos[0]?.thumbnail?.url || dbanner}
                    alt=""
                    className="object-fill h-full w-full"
                />
            </div>

            {/* playlist info */}
            <div className="space-y-3">
                <h1 className="text-xl font-semibold wrap-break-word text-left">
                    {name || curPlaylist?.name}
                </h1>

                <div className="flex items-center gap-2">
                    <img
                        src={avatar || dpfp}
                        className="w-8 h-8 rounded-full"
                        alt=""
                    />

                    <span className="text-sm text-gray-600 wrap-break-word">
                        {channelName}
                    </span>
                </div>

                {/* description component */}
                <Description content={curPlaylist?.description} showVideoDetails={false} />

                <div className="flex  gap-3 justify-end">
                    <button
                        className="flex items-center gap-2 bg-blue-700 text-white px-6 py-2 rounded-full p-3 font-semibold text-xs "
                        onClick={() => playPlaylist.current.click()}
                    >
                        <PlayCircleIcon size={18} />
                        PLAY
                    </button>
                    {isUserPlaylistOwner &&
                        <button
                            className="flex items-center gap-2 text-gray-800 px-6 py-2 rounded-full p-3 font-semibold text-xs ring ring-gray-800 outline-none cursor-pointer"
                            onClick={() => setIsVideoOptionsActive(prev => !prev)}
                        >
                            <VideoIcon size={18} />
                            ADD VIDEO
                        </button>
                    }
                    {isVideoOptionsActive && <AddVideosModal
                        isOpen={isVideoOptionsActive}
                        onClose={() => setIsVideoOptionsActive(false)}
                        onAdd={handleAddVideosToPlaylist}
                        videos={allUserVideos}
                        alreadyAdded={set}
                    />}
                </div>
            </div>

            {/* videos list */}
            <VideoList
                videos={videos}
                setVideos={setVideos}
                ref={playPlaylist}
                fullname={channelName}
                avatarUrl={avatarUrl}
                isUserPlaylistOwner={isUserPlaylistOwner}
                playlistId={playlistId}
                setSet={setSet}
            />
        </div>
    );
}

const VideoList = ({ videos, setVideos, ref, fullname, avatarUrl, isUserPlaylistOwner, playlistId, setSet }) => {

    const navigate = useNavigate();
    function handleShowWatchVideo(videoId) {

        if (videoId) {
            navigate(`/watch/video/${videoId}`, {
                state: {
                    ownerAvatar: avatarUrl,
                    fullname: fullname,
                },
            });
        }
    }
    useEffect(() => {

    }, [videos])
    return (
        <div className="space-y-4 mt-10">
            {videos?.length !== 0 ?

                videos?.map((video, idx) => (
                    <VideoCardComponent
                        key={video._id}
                        video={video}
                        idx={idx}
                        ref={idx === 0 ? ref : null}
                        onClick={() => handleShowWatchVideo(video._id)}
                        fullname={fullname}
                        isUserPlaylistOwner={isUserPlaylistOwner}
                        playlistId={playlistId}
                        setVideos={setVideos}
                        setSet={setSet}
                    />
                ))
                :
                <h1 className="text-center">No videos are uploaded to this playlist yet</h1>
            }
        </div>
    )
}

function VideoCardComponent({ video, ref, onClick, fullname, isUserPlaylistOwner, playlistId, setVideos, setSet }) {
    const [duration, setDuration] = useState("00:00");
    const [isOptionActive, setIsOptionsActive] = useState(false);

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
        calcDuration(video?.duration);
    }, [video]);
    async function handleOption(type) {
        if (type === "remove") {
            try {
                await axios.patch(`/playlists/remove/${video._id}/${playlistId}`)
                setVideos(prev => prev.filter(v => v._id !== video?._id));
                setSet(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(video?._id);
                    return newSet
                });
            } catch (err) {
                console.log(err);
            }
            setIsOptionsActive(false)
        }
    }
    return (
        <div key={video._id} className="flex gap-4">
            <div className="relative" onClick={onClick} ref={ref}>
                <img
                    src={video.thumbnail?.url || dbanner}
                    alt=""
                    className="w-50 h-21 rounded-lg object-cover"
                />
                <div className="absolute bg-gray-800 rounded-xl bottom-1 right-1 w-10 h-4 text-xs text-gray-300 text-center">
                    {duration}
                </div>
            </div>

            <div className="flex  justify-between w-70 relative">
                <div className="flex flex-col" onClick={onClick}>

                    <h3 className="text-sm font-base line-clamp-3 wrap-break-word text-left w-45">
                        {video.title}
                    </h3>

                    <p className="text-xs text-gray-500 mt-1 wrap-break-word text-left">
                        {fullname}
                    </p>
                </div>
                {isUserPlaylistOwner &&
                    <>
                        <button onClick={() => setIsOptionsActive(prev => !prev)} className="absolute top-1 right-1">
                            <EllipsisVertical size={20} />
                        </button>
                        {
                            isOptionActive && <VideoCardOptions handleOption={handleOption} />
                        }
                    </>
                }
            </div>
        </div>
    );
}
