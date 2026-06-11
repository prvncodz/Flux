import { useState, useEffect, useContext, useCallback } from "react";
import axios from "../../api/axios.js";
import UserTick from "../assets/usertick.jsx";
import UserAddIcon from "../assets/useradd.jsx";
import dbanner from "../assets/dbanner.jpg";
import dpfp from "../assets/dpfp.jpg";
import Button from "../button.jsx";
import VideoFeed from "../home/videofeed/feed.jsx";
import PostFeed from "../home/tweetfeed/tweetFeed.jsx";
import PlaylistFeed from "../home/playlistfeed/playlistFeed.jsx";
import EditProfilePopUp from "./editProfilePopup.jsx";
import ChangePassPopup from "./changePass.jsx";
import { useLocation, useParams } from "react-router-dom";
import { ArrowLeftIcon, Ellipsis, LucideDotSquare, Pen, UserRoundKey } from "lucide-react";
import SignInBanner from "../signinInstructPopup.jsx";
import { motion } from "motion/react"
import useUserStore from "../../stores/user.store.js";

export default function Profile() {

    const user = useUserStore(s => s.user);
    const isUserLogged = useUserStore(s => s.isUserLogged);
    const [UserProfile, setUserProfile] = useState({});
    const [tabOpened, setTabOpened] = useState("videos");
    const [showElipse, setShowElipse] = useState(false);
    const [isPopupActive, setisPopupActive] = useState(false);
    const [isEditPopUpActive, setIsEditPopUpActive] = useState(false);
    const [isPassPopupActive, setIsPassPopupActive] = useState(false);
    const [isOtherUserP, setIsOtherUserP] = useState(false);
    const { username } = useParams();
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [isProfileFetched, setIsProfileFetched] = useState(false);
    const [signinInstruction, setSigninInstruction] = useState(false);
    let timeoutId;

    async function handleSubscription() {
        clearTimeout(timeoutId);
        if (!isUserLogged) {
            setSigninInstruction(true);
            return;
        }
        setIsSubscribed(!isSubscribed);
        timeoutId = setTimeout(async () => {
            try {
                await axios.post(`/subscriptions/c/${UserProfile?._id}`);
            } catch (error) {
                console.log(error);
                console.log(error.response?.data?.message);
            }
        }, 800);
    }
    useEffect(() => {
        if (username !== user?.userName) {
            setIsOtherUserP(true);
            setShowElipse(false);
            async function getUserProfile(username) {
                if (!username) return;
                try {
                    const res = await axios.get(`/user/p/${username}`);
                    if (res.status === 200) {
                        setUserProfile(res.data?.data);
                        setIsSubscribed(res.data?.data?.isSubscribed);
                        setIsProfileFetched(true);
                    }
                } catch (error) {
                    console.log(
                        "Error while fetching user's profile. err message",
                        error,
                    );
                }
            }
            getUserProfile(username);
        } else {
            setShowElipse(true);
            async function getUserProfile(username) {
                if (!username) return;
                try {
                    const res = await axios.get(`/user/p/${username}`);
                    if (res.status === 200) {
                        setUserProfile(res.data?.data);
                        setIsProfileFetched(true);
                    }
                } catch (error) {
                    console.log(
                        "Error while fetching user's profile. err message",
                        error,
                    );
                }
            }
            getUserProfile(user?.userName);
        }
    }, [user?.userName, username]);

    const tabs = {
        videos: <VideoFeed fetchType={"user"} userId={UserProfile?._id} />,
        posts: <PostFeed fetchType={"user"} userId={UserProfile?._id} />,
        playlists: <PlaylistFeed userId={UserProfile?._id} />,
    };

    return (
        <motion.div
            className="h-screen overflow-y-auto overflow-x-hidden"
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
            <nav className="bg-neutral-50 h-12 w-full border-b-neutral-100 relative flex items-center justify-between ">
                <a
                    href="/"
                    className="relative ml-5 text-gray-800 font flex items-center justify-left hover:bg-gray-100 p-3 size-auto "
                >
                    <ArrowLeftIcon />
                </a>
                {signinInstruction && (
                    <SignInBanner setShowPopup={setSigninInstruction} />
                )}
                {showElipse && (
                    <button
                        type="button"
                        className="mr-3 relative"
                        onClick={() => setisPopupActive((prev) => !prev)}
                    >
                        <Ellipsis size={30} />
                    </button>
                )}
                {isPopupActive && (
                    <>
                        <div className="absolute bg-gray-50 shadow-sm rounded-xl h-auto w-auto top-10 z-10 right-4 p-3 transition-all pop-in delay-75 flex flex-col gap-2">
                            <div
                                className="flex items-center gap-3 w-55 p-3 rounded-lg hover:bg-gray-100 cursor-pointer"
                                onClick={() => setIsEditPopUpActive(true)}
                            >
                                <Pen />
                                <h3 className="ml-1">Edit Profile</h3>
                            </div>
                            <div
                                className="flex items-center gap-3 w-55 p-3 rounded-lg hover:bg-gray-100 cursor-pointer"
                                onClick={() => setIsPassPopupActive(true)}
                            >
                                <UserRoundKey />
                                <h3 className="ml-1">Change Password</h3>
                            </div>

                        </div>

                    </>
                )}
            </nav>
            {(isEditPopUpActive && (
                <EditProfilePopUp setIsEditPopUpActive={setIsEditPopUpActive} />
            )) ||
                (isPassPopupActive && (
                    <ChangePassPopup setIsPassPopupActive={setIsPassPopupActive} />
                ))}
            <div className="relative h-45 z-0 md:h-60 lg:h-90">
                <img
                    src={UserProfile?.coverImage?.url || dbanner}
                    onError={(e) => (e.target.src = dbanner)}
                    className="h-full w-full relative"
                    loading="lazy"
                />
                <img
                    src={UserProfile?.avatar?.url || dpfp}
                    onError={(e) => (e.target.src = dpfp)}
                    className="h-20 rounded-full absolute left-1 -bottom-15 w-20 border-2 border-white md:h-25 md:w-25 md:left-8 lg:h-30 lg:w-30 "
                    loading="lazy"
                />
            </div>
            <div className="flex justify-between h-15 w-full relative z-0 ">
                <div className="ml-24 h-6 md:ml-36 lg:ml-45">
                    <h3 className="text-left text-neutral-700 font-medium text-lg">
                        {UserProfile?.fullName || "Jhon doe"}
                    </h3>
                    <h3 className="text-left text-neutral-600 font-medium text-xs mt-0">
                        @{UserProfile?.userName || "jhondoe201"}
                    </h3>
                    <div className="flex">
                        <h3 className="text-left text-neutral-600 font-medium text-xs mt-0">
                            {UserProfile?.subscriberCount || "0"} Subscribers
                        </h3>
                        <span className="mx-1 align-middle text-gray-600">•</span>
                        <h3 className="text-left text-neutral-600 font-medium text-xs mt-0">
                            {UserProfile?.channelsSubscribedCount || 0} Subscribed
                        </h3>
                    </div>
                </div>
                {isOtherUserP && (
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
                        classes="mt-4 mr-2 md:mr-10"
                        onClick={handleSubscription}
                    />
                )}
            </div>
            <div
                className={`flex flex-row w-full ${isOtherUserP ? `mt-4 md:mt-6` : `mt-3 md:mt-6`} pb-2 justify-center`}
            >
                <div
                    name="videos"
                    className={`text-base relative mt-3.5 font-normal w-50 cursor-pointer text-center ${tabOpened === "videos" ? `text-[#1E549D]` : `text-gray-800 `}`}
                    onClick={() => setTabOpened("videos")}
                >
                    Videos
                    <div
                        className={`absolute -bottom-2 w-full h-1 rounded-4xl ${tabOpened === "videos" ? `bg-[#1E549D]` : ``}`}
                    ></div>
                </div>
                <div
                    name="posts"
                    className={`text-base relative mt-3.5 font-normal w-50 cursor-pointer text-center ${tabOpened === "posts" ? `text-[#1E549D]` : `text-gray-800 `}`}
                    onClick={() => setTabOpened("posts")}
                >
                    Posts
                    <div
                        className={`absolute -bottom-2 w-full h-1 rounded-4xl ${tabOpened === "posts" ? `bg-[#1E549D]` : ``}`}
                    ></div>
                </div>
                <div
                    name="playlists"
                    className={`text-base relative mt-3.5 font-normal w-50 cursor-pointer text-center ${tabOpened === "playlists" ? `text-[#1E549D]` : `text-gray-800 `}`}
                    onClick={() => setTabOpened("playlists")}
                >
                    Playlists
                    <div
                        className={`absolute -bottom-2 w-full h-1 rounded-4xl ${tabOpened === "playlists" ? `bg-[#1E549D]` : ``}`}
                    ></div>
                </div>
            </div>
            <div>{isProfileFetched && tabs[tabOpened]}</div>
        </motion.div>
    );
}
