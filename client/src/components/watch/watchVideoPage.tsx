import { useLocation, useParams } from "react-router-dom";
import Nav from "../home/nav";
import dpfp from "../assets/dpfp.jpg";
import Button from "../button";
import UserTick from "../assets/usertick";
import UserAddIcon from "../assets/useradd";
import { useEffect, useState } from "react";
import axios from "../../api/axios";
import CommentFeed from "../commentFeed/commentFeed";
import VideoDescription from "./videoDescription";
import VideoFeed from "../home/videofeed/feed";
import LikeButton from "../home/likeComponent/likeButton";
import VideoPlayer from "../home/videofeed/VideoPlayer";
import SignInBanner from "../signinInstructPopup";
import useUserStore from "../../stores/user.store";
import useTab from "../../stores/tab.store";
import { Video } from "../../types/video.types";

export default function WatchVideoPage() {
    const location = useLocation();
    const { videoId } = useParams();
    const { username, ownerAvatar, fullname } = (location.state || {}) as { username?: string; ownerAvatar?: string; fullname?: string };
    const [isSubscribed, setIsSubscribed] = useState<boolean>(false);
    const [isCommentSectionOpen, setIsCommentSectionOpen] = useState<boolean>(false);
    const [video, setVideo] = useState<Video | null>(null);
    const [isLiked, setIsLiked] = useState<boolean>(false);
    const [subscribers, setSubscribers] = useState<number>(0);
    const [isOtherChannel, setIsOtherChannel] = useState<boolean>(false);
    const user = useUserStore(s => s.user);
    const isUserLogged = useUserStore(s => s.isUserLogged);
    const [signinInstruction, setSigninInstruction] = useState<boolean>(false);
    const setCurrentPage = useTab(s => s.setTab);

    let timeoutId: ReturnType<typeof setTimeout>;
    async function handleSubscription() {
        clearTimeout(timeoutId);
        if (!isUserLogged) {
            setSigninInstruction(true);
            return;
        }
        setIsSubscribed(!isSubscribed);
        timeoutId = setTimeout(async () => {
            try {
                if (video?.owner?._id) {
                    await axios.post(`/subscriptions/c/${video.owner._id}`);
                }
            } catch (error: any) {
                console.log(error);
                console.log(error.response?.data?.message);
            }
        }, 800);
    }

    useEffect(() => {
        if (!videoId) return;
        setCurrentPage("watchVideo")
        async function getVideoById(Id: string) {
            try {
                const res = await axios.get(
                    `/videos/c/${Id}${isUserLogged ? `?userId=${user?._id}` : ``}`,
                );
                if (res.status === 200) {
                    const videoData = res.data?.data as Video;
                    setVideo(videoData);
                    setIsLiked(!!videoData?.isLiked);
                    
                    const owner = videoData?.owner as any;
                    setIsSubscribed(!!owner?.isSubscribedByUser);
                    setSubscribers(owner?.totalSubscribers || 0);
                    
                    if (!isUserLogged || owner?._id !== user?._id) {
                        setIsOtherChannel(true);
                    } else {
                        setIsOtherChannel(false);
                    }
                }
            } catch (err) {
                console.log(err);
            }
        }
        getVideoById(videoId);
    }, [videoId, isUserLogged, isLiked, user?._id, setCurrentPage]);

    return (
        <div className=" scroll-smooth  z-2 bg-[#ffffff]">
            <Nav wantTabs={false} />
            {signinInstruction && (
                <SignInBanner setShowPopup={setSigninInstruction} />
            )}
            <div className="h-screen overflow-y-auto overflow-x-hidden lg:flex lg:flex-row lg:h-screen lg:w-screen lg:pb-80 scroll-smooth">
                <div className="lg:flex lg:flex-col lg:h-auto lg:w-full lg:max-w-[75vw] lg:bg-[#ffffff] lg:3 ">
                    <div className="relative h-auto lg:h-900  lg:px-10 lg:py-5 lg:z-2 lg:bg-[#ffffff]">
                        <div className=" aspect-video h-full w-full lg:rounded-xl lg:overflow-hidden">

                            <VideoPlayer
                                videoUrl={video?.videofile?.url} // Source URL for the video
                                autoplay={true} // Automatically start playing on load
                                replay={false} // Loop the video when it ends
                                theme="light" // Player theme: 'dark' | 'light'
                                color="#1e549f" // Accent color for controls and progress bar
                                fit={false} // If true, video fits within container. If false, it fills (cover).
                                className=" h-full w-full overflow-hidden" // Container classes
                            />
                        </div>
                    </div>
                    <div className="relative h-auto  rounded-xl ">
                        <div className="relative flex flex-col lg:px-5">
                            <h1 className="text-lg line-clamp-2 font-semibold text-gray-800 mx-2 text-left p-3  text-bold md:text-2xl">
                                {video?.title || ""}
                            </h1>
                            <VideoDescription
                                content={video?.description || ""}
                                views={video?.views || ""}
                                uploadTime={video?.createdAt || ""}
                                showVideoDetails={true}
                            />
                            <div className="flex mx-1 justify-between w-auto">
                                <div className="flex">
                                    <img
                                        src={ownerAvatar || dpfp}
                                        className="rounded-full h-11 w-11 mx-3"
                                    />
                                    <div className="flex-col  justify-left">
                                        <h1 className=" text-base font-normal text-gray-700  text-left w-30 truncate md:w-auto">
                                            {fullname || username || ""}
                                        </h1>
                                        <h1 className="text-xs font-normal text-gray-500">
                                            {subscribers +
                                                `${subscribers > 1 ? " Subscribers" : " Subscriber"}` ||
                                                ""}
                                        </h1>
                                    </div>
                                </div>
                                <div className="flex gap-0">
                                    <div className={`flex items-center py-3 ${!isOtherChannel ? "px-3 mr-4" : ""} `}>
                                        <LikeButton
                                            fetchType={"video"}
                                            Id={videoId}
                                            likeStatus={isLiked}
                                            setShowSignInPopup={setSigninInstruction}
                                            isUserLogged={isUserLogged}
                                        />
                                    </div>
                                    {isOtherChannel && (
                                        <Button
                                            children={
                                                isSubscribed ? (
                                                    <>
                                                        <UserTick />
                                                        <span>Subscribed</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <UserAddIcon />
                                                        <span>Subscribe</span>
                                                    </>
                                                )
                                            }
                                            classes=" ml-4"
                                            onClick={handleSubscription}
                                        />
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="overflow-auto my-2 lg:px-5">
                            <CommentFeed
                                fetchType={"video"}
                                Id={video?._id}
                                isOpen={isCommentSectionOpen}
                                setIsOpen={setIsCommentSectionOpen}
                                setShowSignInPopup={setSigninInstruction}
                            />
                        </div>
                    </div>
                </div>
                <div className="h-auto">
                    <VideoFeed
                        fetchType={"all"}
                        recommendations={true}
                        playingVideoId={video?._id}
                    />
                </div>
            </div>
        </div>
    );
}
